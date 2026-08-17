import { model } from "@medusajs/framework/utils"

export const BulkOperationItem = model.define("bulk_operation_item", {
  id: model.id().primaryKey(),
  operation_id: model.text(),
  entity_id: model.text(),
  status: model.text().default("pending"),
  error: model.text().nullable(),
  previous_value: model.json().nullable(),
  new_value: model.json().nullable(),
  attempts: model.number().default(0),
  started_at: model.dateTime().nullable(),
  processed_at: model.dateTime().nullable(),
})

export default BulkOperationItem
