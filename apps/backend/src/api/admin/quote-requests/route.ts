import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const take = Math.min(100, Math.max(1, Number(req.query.limit) || 25))
  const skip = Math.max(0, Number(req.query.offset) || 0)

  const { data: quoteRequests, metadata } = await query.graph({
    entity: "quote_request",
    fields: [
      "id",
      "contact_name",
      "organization",
      "email",
      "phone",
      "project_type",
      "location",
      "budget",
      "requirements",
      "contact_method",
      "status",
      "created_at",
      "updated_at",
    ],
    pagination: {
      take,
      skip,
      order: { created_at: "DESC" },
    },
  })

  return res.status(200).json({
    quote_requests: quoteRequests,
    count: metadata?.count ?? quoteRequests.length,
    offset: metadata?.skip ?? skip,
    limit: metadata?.take ?? take,
  })
}
