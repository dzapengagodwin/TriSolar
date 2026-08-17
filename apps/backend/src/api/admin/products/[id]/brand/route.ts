import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { linkProductBrandWorkflow } from "../../../../../workflows/link-product-brand"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "brand.id",
      "brand.name",
      "brand.handle",
      "brand.logo",
      "brand.description",
      "brand.is_active",
    ],
    filters: {
      id,
    },
  })

  if (!products || products.length === 0) {
    return res.status(404).json({ message: `Product with id ${id} not found` })
  }

  const product = products[0] as any

  return res.status(200).json({
    brand: product.brand || null,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { brand_id } = req.body as { brand_id?: string | null }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  await linkProductBrandWorkflow(req.scope).run({
    input: {
      productId: id,
      brandId: brand_id,
    },
  })

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "brand.id",
      "brand.name",
      "brand.handle",
      "brand.logo",
      "brand.description",
      "brand.is_active",
    ],
    filters: {
      id,
    },
  })

  const product = products?.[0] as any

  return res.status(200).json({
    message: "Product brand updated successfully",
    brand: product?.brand || null,
  })
}
