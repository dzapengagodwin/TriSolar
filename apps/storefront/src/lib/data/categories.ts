"use server"

import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { CACHE_TAGS, categoryTag } from "@lib/cache-tags"
import { CATEGORY_IMAGE_MAP } from "@lib/constants/categories"

/**
 * Enriches category with fallback images/metadata if not provided by backend.
 */
function enrichCategory(
  cat: HttpTypes.StoreProductCategory
): HttpTypes.StoreProductCategory {
  const handleKey = cat.handle?.toLowerCase() || ""
  const fallbackImg = CATEGORY_IMAGE_MAP[handleKey]

  const metadata = {
    ...(cat.metadata || {}),
    image: (cat.metadata?.image as string) || fallbackImg || null,
  }

  const enrichedChildren = (cat.category_children || []).map((child) =>
    enrichCategory(child)
  )

  return {
    ...cat,
    metadata,
    category_children: enrichedChildren,
  }
}

/**
 * Lists all product categories dynamically from the commerce backend.
 */
export const listCategories = async (
  query?: Record<string, unknown>
): Promise<HttpTypes.StoreProductCategory[]> => {
  const limit = (query?.limit as number) || 100
  const tags = [CACHE_TAGS.categories, CACHE_TAGS.navigation]

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[]; count: number }>(
      "/store/product-categories",
      {
        method: "GET",
        query: {
          fields:
            "*category_children,*parent_category,+metadata,+products.id",
          limit,
          ...query,
        },
        next: {
          tags,
          revalidate: 3600,
        },
      }
    )
    .then(({ product_categories }) => {
      if (!product_categories || product_categories.length === 0) {
        return []
      }
      return product_categories.map(enrichCategory)
    })
    .catch((err) => {
      console.error("Failed to fetch product categories:", err)
      return []
    })
}

/**
 * Retrieves an individual category or subcategory dynamically by its URL handle.
 */
export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory | null> => {
  const fullHandle = categoryHandle.join("/").toLowerCase()
  const lastHandle =
    categoryHandle[categoryHandle.length - 1]?.toLowerCase() || fullHandle

  const tags = [
    CACHE_TAGS.categories,
    categoryTag(lastHandle),
    categoryTag(fullHandle),
  ]

  // 1. Try querying backend directly for this handle
  try {
    const res = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      method: "GET",
      query: {
        handle: [lastHandle, fullHandle],
        fields:
          "*category_children,*parent_category,*parent_category.parent_category,+metadata",
        limit: 5,
      },
      next: {
        tags,
        revalidate: 3600,
      },
    })

    if (res.product_categories && res.product_categories.length > 0) {
      const matched =
        res.product_categories.find(
          (c) =>
            c.handle.toLowerCase() === lastHandle ||
            c.handle.toLowerCase() === fullHandle
        ) || res.product_categories[0]

      return enrichCategory(matched)
    }
  } catch (err) {
    console.error(`Failed to fetch category by handle [${lastHandle}]:`, err)
  }

  return null
}
