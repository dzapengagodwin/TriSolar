import { model } from "@medusajs/framework/utils"

export const BulkOperation = model.define("bulk_operation", {
  id: model.id().primaryKey(),
  action: model.text(),
  entity_type: model.text().default("product"),
  status: model.text().default("pending"),
  total: model.number().default(0),
  processed: model.number().default(0),
  successful: model.number().default(0),
  failed: model.number().default(0),
  batch_size: model.number().default(50),
  selection_data: model.json(),
  payload: model.json().nullable(),
  error: model.text().nullable(),
  created_by: model.text(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
})

export default BulkOperation
