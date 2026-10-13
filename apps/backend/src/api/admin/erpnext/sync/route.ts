import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { erpnextInventorySyncWorkflow, ErpnextInventorySyncInput } from "../../../../workflows/erpnext-inventory-sync"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as Partial<ErpnextInventorySyncInput>) || {}

    const action = body.action || "preview"
    if (action !== "preview" && action !== "execute") {
      return res.status(400).json({ error: "Invalid action. Must be 'preview' or 'execute'." })
    }

    if (action === "execute" && !body.approvalToken) {
      return res.status(400).json({
        error: "Approval token is required for executing synchronization. Please generate a preview first.",
      })
    }

    const { result } = await erpnextInventorySyncWorkflow(req.scope).run({
      input: {
        action,
        approvalToken: body.approvalToken,
        warehouseMappings: body.warehouseMappings,
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        company: body.company,
        triggeredBy: req.auth_context?.actor_id || "admin",
      },
    })

    return res.status(200).json(result)
  } catch (error: any) {
    const status = error.status || (error.type === "conflict" ? 409 : 500)
    return res.status(status).json({ error: error.message || "Failed to run inventory synchronization" })
  }
}

