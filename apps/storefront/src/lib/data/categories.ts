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
  const categories: HttpTypes.StoreProductCategory[] = []
  let offset = (query?.offset as number) || 0
  let count = 0
  let pageCount = 0

  do {
    const response = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
      count: number
    }>(
      "/store/product-categories",
      {
        method: "GET",
        query: {
          fields:
            "*category_children,*parent_category,+metadata,+products.id",
          ...query,
          limit,
          offset,
        },
        next: {
          tags,
          revalidate: 3600,
        },
      }
    )

    categories.push(...response.product_categories)
    count = response.count
    pageCount = response.product_categories.length
    offset += response.product_categories.length

    if (query?.offset !== undefined) {
      break
    }
  } while (offset < count && pageCount > 0)

  const enrichedCategories = categories.map(enrichCategory)
  const flattened = new Map<string, HttpTypes.StoreProductCategory>()
  const addCategory = (category: HttpTypes.StoreProductCategory) => {
    if (!flattened.has(category.id)) {
      flattened.set(category.id, category)
      category.category_children?.forEach(addCategory)
    }
  }

  enrichedCategories.forEach(addCategory)
  return Array.from(flattened.values())
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
      )

    return matched ? enrichCategory(matched) : null
  }

  return null
}
