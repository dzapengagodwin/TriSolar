import { model } from "@medusajs/framework/utils"

export const ErpnextSettings = model.define("erpnext_settings", {
  id: model.id().primaryKey(),
  default_company: model.text().nullable(),
  default_warehouse: model.text().nullable(),
  warehouse_mappings: model.json().nullable(),
  price_sync_enabled: model.boolean().default(true),
  erpnext_price_list: model.text().default("Standard Selling"),
  sync_currency: model.text().default("usd"),
  auto_create_sales_order: model.boolean().default(true),
  sales_order_print_format: model.text().default("Standard"),
  last_audit_at: model.dateTime().nullable(),
  last_audit_summary: model.json().nullable(),
  last_sync_at: model.dateTime().nullable(),
  last_sync_summary: model.json().nullable(),
  is_sync_running: model.boolean().default(false),
  sync_lock_run_id: model.text().nullable(),
  sync_lock_acquired_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default ErpnextSettings

