import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERPNEXT_MODULE } from "../../../../modules/erpnext"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
    const syncLogId = req.query.syncLogId as string | undefined

    if (syncLogId) {
      // Fetch specific log with its item logs
      const syncLog = await erpnextService.retrieveErpnextSyncLog(syncLogId)
      const itemLogs = await erpnextService.listErpnextSyncItemLogs(
        { sync_log_id: syncLogId },
        { order: { created_at: "ASC" }, take: 200 }
      )
      return res.status(200).json({ syncLog, itemLogs })
    }

    // List recent sync runs
    const limit = Number(req.query.limit) || 20
    const syncLogs = await erpnextService.listErpnextSyncLogs(
      {},
      { order: { started_at: "DESC" }, take: limit }
    )

    return res.status(200).json({ syncLogs })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve sync logs" })
  }
}

