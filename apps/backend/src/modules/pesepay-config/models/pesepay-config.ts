import { model } from "@medusajs/framework/utils"

export const PesepayConfig = model.define("pesepay_config", {
  id: model.id().primaryKey(),
  integration_key: model.text().nullable(),
  encryption_key: model.text().nullable(),
  environment: model.text().default("sandbox"),
  callback_url: model.text().nullable(),
  webhook_secret: model.text().nullable(),
  is_active: model.boolean().default(true),
})
