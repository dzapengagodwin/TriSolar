import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncMedusaOrderToErpnext } from "../../../../../../modules/erpnext/services/sales-order-service"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const orderId = req.params.id
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" })
  }

  try {
    const result = await syncMedusaOrderToErpnext(orderId, req.scope)

    if (result.success) {
      return res.status(200).json({
        success: true,
        salesOrderId: result.salesOrderId,
        message: result.message || "Sales order synchronized successfully",
      })
    }

    return res.status(500).json({
      success: false,
      error: result.message || "Failed to synchronize Sales Order with ERPNext",
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process Sales Order synchronization",
    })
  }
}
