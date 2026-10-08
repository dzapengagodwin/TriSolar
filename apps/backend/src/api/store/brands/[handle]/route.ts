import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { handle } = req.params

  const limit = Math.max(1, parseInt(req.query.limit as string) || 20)
  const offset = Math.max(0, parseInt(req.query.offset as string) || 0)

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
  const rawProducts = Array.isArray(brandData.products)
    ? brandData.products
    : brandData.product
    ? [brandData.product]
    : []

  const publishedProducts = rawProducts.filter(
    (p: any) => !p.status || p.status === "published"
  )

  const paginatedProducts = publishedProducts.slice(offset, offset + limit)

  return res.status(200).json({
    brand: {
      id: brandData.id,
      name: brandData.name,
      handle: brandData.handle,
      logo: brandData.logo,
      description: brandData.description,
      website: brandData.website,
      products: paginatedProducts,
      product_ids: publishedProducts.map((p: any) => p.id),
      count: paginatedProducts.length,
      total_products: publishedProducts.length,
      limit,
      offset,
      metadata: brandData.metadata,
    },
  })
}
