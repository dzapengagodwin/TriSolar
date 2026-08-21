import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type StoreBrand = {
  id: string
  name: string
  handle: string
  logo?: string | null
  image?: string | null
  description?: string | null
  website?: string | null
  products_count?: number
  metadata?: Record<string, unknown> | null
}

export const listBrands = async (query?: { limit?: number; offset?: number }): Promise<StoreBrand[]> => {
  const next = {
    ...(await getCacheOptions("brands")),
  }

  const limit = query?.limit || 50
  const offset = query?.offset || 0

  return sdk.client
    .fetch<{ brands: StoreBrand[]; count: number }>("/store/brands", {
      query: {
        limit,
        offset,
      },
      next,
      cache: "no-store",
    })
    .then(({ brands }) => brands || [])
    .catch(() => [])
}

export const getBrandByHandle = async (handle: string): Promise<StoreBrand | null> => {
  const next = {
    ...(await getCacheOptions("brands")),
  }

  return sdk.client
    .fetch<{ brand: StoreBrand }>(`/store/brands/${handle}`, {
      next,
      cache: "no-store",
    })
    .then(({ brand }) => brand || null)
    .catch(() => null)
}
