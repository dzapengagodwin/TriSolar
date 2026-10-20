import { model } from "@medusajs/framework/utils"

export const ErpnextSyncLog = model.define("erpnext_sync_log", {
  id: model.id().primaryKey(),
  run_type: model.text().default("sync"),
  status: model.text().default("pending"),
  started_at: model.dateTime(),
  completed_at: model.dateTime().nullable(),
  triggered_by: model.text().nullable(),
  summary: model.json().nullable(),
  error_message: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default ErpnextSyncLog

