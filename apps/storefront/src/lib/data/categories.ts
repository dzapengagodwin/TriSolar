import { HttpTypes } from "@medusajs/types"
import { STATIC_CATEGORIES } from "@lib/constants/categories"

export { STATIC_CATEGORIES }

export const listCategories = async (
  _query?: Record<string, unknown>
): Promise<HttpTypes.StoreProductCategory[]> => {
  return STATIC_CATEGORIES
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory | null> => {
  const handle = categoryHandle.join("/").toLowerCase()
  const found = STATIC_CATEGORIES.find(
    (c) =>
      c.handle.toLowerCase() === handle ||
      c.handle.toLowerCase() === handle.replace(/_/g, "-") ||
      c.id.toLowerCase() === handle
  )
  return found || null
}
