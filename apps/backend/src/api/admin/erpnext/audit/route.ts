import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { erpnextSkuAuditWorkflow } from "../../../../workflows/erpnext-sku-audit"
import { ERPNEXT_MODULE } from "../../../../modules/erpnext"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as any) || {}
    const { result } = await erpnextSkuAuditWorkflow(req.scope).run({
      input: {
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        company: body.company,
      },
    })

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to execute SKU audit" })
  }
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
    const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })

    return res.status(200).json({
      last_audit_at: settings?.last_audit_at || null,
      last_audit_summary: settings?.last_audit_summary || null,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve audit status" })
  }
}

