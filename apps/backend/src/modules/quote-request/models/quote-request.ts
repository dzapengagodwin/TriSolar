import { model } from "@medusajs/framework/utils"

const QuoteRequest = model.define("quote_request", {
  id: model.id().primaryKey(),
  contact_name: model.text(),
  organization: model.text(),
  email: model.text(),
  phone: model.text(),
  project_type: model.text(),
  location: model.text(),
  budget: model.text().nullable(),
  requirements: model.text(),
  contact_method: model.text().default("Email"),
  status: model.enum(["new", "in_review", "quoted", "closed"]).default("new"),
})

export default QuoteRequest
