import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { handle } = req.params

  const limit = parseInt(req.query.limit as string) || 20
  const offset = parseInt(req.query.offset as string) || 0

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
      "products.id",
      "products.title",
      "products.handle",
      "products.thumbnail",
      "products.status",
      "products.variants.id",
      "products.variants.title",
      "products.variants.calculated_price.*",
    ],
    filters: {
      handle,
      is_active: true,
    },
  })

  if (!brands || brands.length === 0) {
    return res
      .status(404)
      .json({ message: `Brand with handle '${handle}' not found` })
  }

  const brandData = brands[0] as any
  const allProducts = Array.isArray(brandData.products)
    ? brandData.products
    : brandData.product
    ? [brandData.product]
    : []

  const paginatedProducts = allProducts.slice(offset, offset + limit)

  return res.status(200).json({
    brand: {
      id: brandData.id,
      name: brandData.name,
      handle: brandData.handle,
      logo: brandData.logo,
      description: brandData.description,
      website: brandData.website,
      products: paginatedProducts,
      count: paginatedProducts.length,
      total_products: allProducts.length,
      limit,
      offset,
      metadata: brandData.metadata,
    },
  })
}
