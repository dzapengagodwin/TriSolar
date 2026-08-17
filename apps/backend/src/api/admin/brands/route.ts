import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createBrandWorkflow } from "../../../workflows/create-brand"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: brands, metadata } = await query.graph({
    entity: "brand",
    fields: [
      "id",
      "name",
      "handle",
      "logo",
      "description",
      "website",
      "is_active",
      "metadata",
      "created_at",
      "updated_at",
      "products.id",
      "products.title",
      "products.handle",
    ],
    pagination: {
      take: req.query.limit ? Number(req.query.limit) : 50,
      skip: req.query.offset ? Number(req.query.offset) : 0,
    },
  })

  return res.status(200).json({
    brands,
    count: metadata?.count ?? brands.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 50,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { name, handle, logo, description, website, is_active, metadata } =
    req.body as {
      name: string
      handle?: string
      logo?: string
      description?: string
      website?: string
      is_active?: boolean
      metadata?: Record<string, unknown>
    }

  if (!name) {
    return res.status(400).json({ message: "Brand name is required" })
  }

  const { result: brand } = await createBrandWorkflow(req.scope).run({
    input: {
      name,
      handle,
      logo,
      description,
      website,
      is_active: is_active ?? true,
      metadata,
    },
  })

  return res.status(201).json({ brand })
}
