import { model } from "@medusajs/framework/utils"

export const StoreSettings = model.define("store_settings", {
  id: model.id().primaryKey(),
  order_notification_emails: model.text().nullable(),
  is_active: model.boolean().default(true),
})

