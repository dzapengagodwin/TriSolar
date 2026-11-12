import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = (_req: MedusaRequest, res: MedusaResponse) => {
  return res.redirect("/app")
}
