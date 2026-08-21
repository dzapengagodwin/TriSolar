import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = false

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
      "products.id",
      "products.thumbnail",
    ],
    filters: {
      is_active: true,
    },
    pagination: {
      take: Math.max(1, Number(req.query.limit) || 50),
      skip: Math.max(0, Number(req.query.offset) || 0),
    },
  })

  // Format brand response with product count and logo/image fallback
  const formattedBrands = brands.map((b: any) => ({
    id: b.id,
    name: b.name,
    handle: b.handle,
    logo:
      b.logo ||
      b.metadata?.logo ||
      b.metadata?.image ||
      b.metadata?.thumbnail ||
      b.products?.[0]?.thumbnail ||
      null,
    image:
      b.metadata?.image ||
      b.logo ||
      b.products?.[0]?.thumbnail ||
      null,
    description: b.description,
    website: b.website,
    products_count: b.products?.length || 0,
    metadata: b.metadata,
  }))

  return res.status(200).json({
    brands: formattedBrands,
    count: metadata?.count ?? formattedBrands.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 50,
  })
}
