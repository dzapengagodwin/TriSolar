export type StoreBrand = {
  id: string
  name: string
  handle: string
  logo?: string | null
  image?: string | null
  description?: string | null
  website?: string | null
  products_count?: number
  total_products?: number
  product_ids?: string[]
  products?: unknown[]
  metadata?: Record<string, unknown> | null
}
