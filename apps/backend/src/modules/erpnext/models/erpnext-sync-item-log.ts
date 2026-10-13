import { model } from "@medusajs/framework/utils"

export const ErpnextSyncItemLog = model.define("erpnext_sync_item_log", {
  id: model.id().primaryKey(),
  sync_log_id: model.text().index("idx_erpnext_sync_item_log_sync_log_id"),
  sku: model.text().nullable(),
  erp_item_code: model.text().nullable(),
  medusa_variant_id: model.text().nullable(),
  medusa_product_id: model.text().nullable(),
  location_id: model.text().nullable(),
  erp_warehouse: model.text().nullable(),
  status: model.text(),
  previous_quantity: model.number().nullable(),
  new_quantity: model.number().nullable(),
  previous_price: model.number().nullable(),
  new_price: model.number().nullable(),
  error_message: model.text().nullable(),
  details: model.json().nullable(),
})

export default ErpnextSyncItemLog

