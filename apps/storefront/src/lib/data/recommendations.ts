"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { CACHE_TAGS, productTag } from "@lib/cache-tags"
import { HttpTypes } from "@medusajs/types"

/**
 * Fetch recommendation products for a specific product and type from the custom backend module
 */
export async function getProductRecommendations({
  productId,
  type = "accessory",
  limit = 4,
}: {
  productId: string
  type?: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> {
  if (!productId) return []

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const tags = [CACHE_TAGS.products, productTag(productId)]

    const res = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products/${productId}/recommendations`,
      {
        method: "GET",
        query: {
          type,
          limit,
        },
        headers,
        next: {
          tags,
          revalidate: 300,
        },
      }
    )

    return res.products || []
  } catch (error) {
    console.error("Error fetching product recommendations:", error)
    return []
  }
}

/**
 * Retrieve accessory recommendations for products currently in the cart
 */
export async function getCartAccessoryRecommendations(
  productIds: string[]
): Promise<HttpTypes.StoreProduct[]> {
  if (!productIds || productIds.length === 0) {
    return []
  }

  const seenIds = new Set<string>(productIds)
  const accessories: HttpTypes.StoreProduct[] = []

  for (const productId of productIds) {
    if (!productId) continue
    try {
      const recs = await getProductRecommendations({
        productId,
        type: "accessory",
        limit: 4,
      })

      for (const item of recs) {
        if (item && !seenIds.has(item.id)) {
          seenIds.add(item.id)
          accessories.push(item)
          if (accessories.length >= 3) {
            return accessories
          }
        }
      }
    } catch {
      // continue
    }
  }

  return accessories
}
