import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { erpnextInventorySyncWorkflow, ErpnextInventorySyncInput } from "../../../../workflows/erpnext-inventory-sync"
import { ERPNEXT_MODULE } from "../../../../modules/erpnext"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as Partial<ErpnextInventorySyncInput> & { force?: boolean }) || {}

    const action = body.action || "preview"
    if (action !== "preview" && action !== "execute" && (action as string) !== "unlock") {
      return res.status(400).json({ error: "Invalid action. Must be 'preview', 'execute', or 'unlock'." })
    }

    if ((action as string) === "unlock") {
      const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
      const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })
      if (settings) {
        await erpnextService.updateErpnextSettings({
          id: settings.id,
          is_sync_running: false,
          sync_lock_run_id: null,
          sync_lock_acquired_at: null,
        })
      }
      return res.status(200).json({ success: true, message: "Sync lock released successfully." })
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
        force: body.force,
      },
    })

    return res.status(200).json(result)
  } catch (error: any) {
    const status = error.status || (error.type === "conflict" ? 409 : 500)
    return res.status(status).json({ error: error.message || "Failed to run inventory synchronization" })
  }
}


