import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { erpnextSkuAuditWorkflow } from "../../../../../workflows/erpnext-sku-audit"
import { sanitizeCsvCell } from "../../../../../modules/erpnext/services/security-utils"
import { SkuAuditRecord } from "../../../../../modules/erpnext/services/sku-audit-service"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { result } = await erpnextSkuAuditWorkflow(req.scope).run({
      input: {
        baseUrl: req.query.baseUrl as string,
        apiKey: req.query.apiKey as string,
        apiSecret: req.query.apiSecret as string,
        company: req.query.company as string,
      },
    })

    const records: SkuAuditRecord[] = result.records || []

    const headers = [
      "Status",
      "SKU",
      "ERP Item Code",
      "ERP Item Name",
      "ERP Is Stock Item",
      "ERP Disabled",
      "Medusa Product ID",
      "Medusa Product Title",
      "Medusa Variant ID",
      "Medusa Variant Title",
      "Medusa Current Stock",
      "Notes",
    ]

    const csvRows = [headers.map(sanitizeCsvCell).join(",")]

    for (const r of records) {
      const row = [
        sanitizeCsvCell(r.status),
        sanitizeCsvCell(r.sku),
        sanitizeCsvCell(r.erp_item_code ?? ""),
        sanitizeCsvCell(r.erp_item_name ?? ""),
        sanitizeCsvCell(r.erp_is_stock !== null ? String(r.erp_is_stock) : ""),
        sanitizeCsvCell(r.erp_disabled !== null ? String(r.erp_disabled) : ""),
        sanitizeCsvCell(r.medusa_product_id ?? ""),
        sanitizeCsvCell(r.medusa_product_title ?? ""),
        sanitizeCsvCell(r.medusa_variant_id ?? ""),
        sanitizeCsvCell(r.medusa_variant_title ?? ""),
        sanitizeCsvCell(r.medusa_stock !== null && r.medusa_stock !== undefined ? String(r.medusa_stock) : ""),
        sanitizeCsvCell(r.notes ?? ""),
      ]
      csvRows.push(row.join(","))
    }

    const csvContent = csvRows.join("\r\n")
    const filename = `erpnext-sku-audit-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    return res.status(200).send(csvContent)
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to export SKU audit CSV" })
  }
}

