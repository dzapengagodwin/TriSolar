import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import { getSalesOrderStorageDir, syncMedusaOrderToErpnext } from "../../../../../../modules/erpnext/services/sales-order-service"
import { ErpnextClient } from "../../../../../../modules/erpnext/services/erpnext-client"
import { ERPNEXT_MODULE } from "../../../../../../modules/erpnext"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const orderId = req.params.id
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const storageDir = getSalesOrderStorageDir()
  const cachedPdfPath = path.join(storageDir, `${orderId}.pdf`)

  // 1. If PDF is cached on disk, stream it immediately
  if (fs.existsSync(cachedPdfPath)) {
    const pdfData = fs.readFileSync(cachedPdfPath)
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="Sales-Order-${orderId}.pdf"`)
    return res.status(200).send(pdfData)
  }

  // 2. Fetch order to inspect metadata
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "metadata"],
    filters: { id: orderId },
  })

  const order = orders?.[0]
  if (!order) {
    return res.status(404).json({ error: `Order ${orderId} not found` })
  }

  const salesOrderId = (order.metadata as any)?.erpnext_sales_order_id

  // 3. If Sales Order ID exists in metadata, fetch directly from ERPNext
  if (salesOrderId) {
    try {
      const baseUrl = process.env.ERPNEXT_BASE_URL
      const apiKey = process.env.ERPNEXT_API_KEY
      const apiSecret = process.env.ERPNEXT_API_SECRET
      const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
      const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })

      if (baseUrl && apiKey && apiSecret) {
        const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
        const printFormat = settings?.sales_order_print_format || "Standard"
        const pdfBuffer = await client.getSalesOrderPdf(salesOrderId, printFormat)

        // Cache on disk
        fs.writeFileSync(cachedPdfPath, pdfBuffer)

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader(
          "Content-Disposition",
          `inline; filename="Sales-Order-${order.display_id || order.id}.pdf"`
        )
        return res.status(200).send(pdfBuffer)
      }
    } catch (err: any) {
      console.warn(`[ERPNext Sales Order PDF] Could not fetch existing PDF: ${err.message}`)
    }
  }

  // 4. If no Sales Order exists yet, create it on-demand and fetch PDF
  const result = await syncMedusaOrderToErpnext(orderId, req.scope)

  if (result.success && result.pdfBuffer) {
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Sales-Order-${order.display_id || order.id}.pdf"`
    )
    return res.status(200).send(result.pdfBuffer)
  }

  return res.status(500).json({
    error: result.message || "Failed to generate or retrieve ERPNext Sales Order PDF",
  })
}

