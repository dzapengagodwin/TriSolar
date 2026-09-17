/**
 * Centralized cache tags and helper functions for Next.js Data Cache.
 */

export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  collections: "collections",
  brands: "brands",
  regions: "regions",
  homepage: "homepage",
  navigation: "navigation",
} as const

export const productTag = (id: string) => `product:${id}`
export const productHandleTag = (handle: string) => `product-handle:${handle}`
export const categoryTag = (idOrHandle: string) => `category:${idOrHandle}`
export const collectionTag = (idOrHandle: string) => `collection:${idOrHandle}`
export const brandTag = (idOrHandle: string) => `brand:${idOrHandle}`
export const regionTag = (idOrCode: string) => `region:${idOrCode}`

