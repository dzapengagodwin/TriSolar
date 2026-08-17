import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateBrandWorkflow } from "../../../../workflows/update-brand"
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: brands } = await query.graph({
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
      "products.thumbnail",
    ],
    filters: {
      id,
    },
  })

  if (!brands || brands.length === 0) {
    return res.status(404).json({ message: `Brand with id ${id} not found` })
  }

  return res.status(200).json({ brand: brands[0] })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { name, handle, logo, description, website, is_active, metadata } =
    req.body as {
      name?: string
      handle?: string
      logo?: string
      description?: string
      website?: string
      is_active?: boolean
      metadata?: Record<string, unknown>
    }

  const { result: brand } = await updateBrandWorkflow(req.scope).run({
    input: {
      id,
      name,
      handle,
      logo,
      description,
      website,
      is_active,
      metadata,
    },
  })

  return res.status(200).json({ brand })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await deleteBrandWorkflow(req.scope).run({
    input: {
      id,
    },
  })

  return res.status(200).json({
    id: result.id,
    object: "brand",
    deleted: true,
  })
}
