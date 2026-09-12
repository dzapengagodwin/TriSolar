import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: wishlists } = await query.graph({
      entity: "wishlist",
      filters: { customer_id: id },
      fields: [
        "id",
        "name",
        "customer_id",
        "sales_channel_id",
        "created_at",
        "updated_at",
      ],
    })

    if (!wishlists || wishlists.length === 0) {
      return res.status(200).json({
        wishlists: [],
        items: [],
        count: 0,
      })
    }

    const wishlistIds = wishlists.map((w: { id: string }) => w.id)

    const { data: items } = await query.graph({
      entity: "wishlist_item",
      filters: { wishlist_id: wishlistIds },
      fields: [
        "id",
        "wishlist_id",
        "product_id",
        "product_variant_id",
        "created_at",
        "product_variant.id",
        "product_variant.title",
        "product_variant.sku",
        "product_variant.product.id",
        "product_variant.product.title",
        "product_variant.product.handle",
        "product_variant.product.thumbnail",
      ],
    })

    return res.status(200).json({
      wishlists,
      items: items || [],
      count: items?.length || 0,
    })
  } catch (error) {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error("Error fetching customer wishlist:", error)
    return res.status(500).json({
      message: "Failed to fetch customer wishlist",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

