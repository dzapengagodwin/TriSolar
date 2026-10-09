import { sdk } from "@lib/config"
import { CACHE_TAGS, brandTag } from "@lib/cache-tags"
import type { StoreBrand } from "@lib/constants/brands"

export type { StoreBrand }

function resolveBrandLogo(brand: StoreBrand): StoreBrand {
  return {
    ...brand,
    logo: brand.logo || null,
  }
}

/**
 * Fetches all active brands directly from the Medusa backend.
 */
export const listBrands = async (query?: {
  limit?: number
  offset?: number
}): Promise<StoreBrand[]> => {
  const tags = [CACHE_TAGS.brands]

  const limit = query?.limit || 100
  const offset = query?.offset || 0

  return sdk.client
    .fetch<{ brands: StoreBrand[]; count: number }>("/store/brands", {
      query: {
        limit,
        offset,
      },
      next: {
        tags,
        revalidate: 3600,
      },
    })
    .then(({ brands }) => {
      if (!brands || brands.length === 0) {
        return []
      }
      return brands.map(resolveBrandLogo)
    })
    .catch((err) => {
      console.error("Failed to fetch brands from backend:", err)
      return []
    })
}

/**
 * Fetches a single brand by its handle directly from the Medusa backend.
 */
export const getBrandByHandle = async (
  handle: string
): Promise<StoreBrand | null> => {
  const tags = [CACHE_TAGS.brands, brandTag(handle)]

  return sdk.client
    .fetch<{ brand: StoreBrand }>(`/store/brands/${handle}`, {
      next: {
        tags,
        revalidate: 3600,
      },
    })
    .then(({ brand }) => {
      if (!brand) {
        return null
      }
      return resolveBrandLogo(brand)
    })
    .catch(() => {
      return null
    })
}
