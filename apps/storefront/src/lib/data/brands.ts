import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"
import { CACHE_TAGS, brandTag } from "@lib/cache-tags"
import type { StoreBrand } from "@lib/constants/brands"
import { STATIC_BRANDS } from "@lib/constants/brands"

export type { StoreBrand }
export { STATIC_BRANDS }

const LOCAL_BRAND_LOGOS: Record<string, string> = {
  apple: "/top-brands/apple.png",
  hp: "/top-brands/hp.png",
  dell: "/top-brands/dell.png",
  lenovo: "/top-brands/lenovo.png",
  asus: "/brands/asus.svg",
  amd: "/brands/amd.svg",
  intel: "/brands/intel.svg",
  msi: "/brands/msi.svg",
  razer: "/brands/razer.svg",
  corsair: "/brands/corsair.svg",
  benq: "/brands/benq.svg",
  samsung: "/brands/samsung.svg",
  acer: "/brands/acer.svg",
  xiaomi: "/brands/xiaomi.svg",
  huawei: "/brands/huawei.svg",
  jbl: "/brands/jbl.svg",
  epson: "/brands/epson.svg",
  canon: "/top-brands/canon.png",
  brother: "/top-brands/brother.png",
  sony: "/brands/sony.svg",
}

function enhanceBrandLogo(brand: StoreBrand): StoreBrand {
  const localLogo = LOCAL_BRAND_LOGOS[brand.handle?.toLowerCase()]
  return {
    ...brand,
    logo: localLogo || brand.logo || brand.image || null,
  }
}

export const listBrands = async (query?: {
  limit?: number
  offset?: number
}): Promise<StoreBrand[]> => {
  const sessionNext = await getCacheOptions("brands")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.brands,
      ...(sessionNext.tags || []),
    ])
  )

  const limit = query?.limit || 100
  const offset = query?.offset || 0

  return sdk.client
    .fetch<{ brands: StoreBrand[]; count: number }>("/store/brands", {
      query: {
        limit,
        offset,
      },
      next: {
        ...sessionNext,
        tags,
        revalidate: 3600,
      },
    })
    .then(({ brands }) => {
      if (!brands || brands.length === 0) {
        return STATIC_BRANDS
      }
      return brands.map(enhanceBrandLogo)
    })
    .catch((err) => {
      console.warn("Failed to fetch brands from backend, falling back to static:", err)
      return STATIC_BRANDS
    })
}

export const getBrandByHandle = async (
  handle: string
): Promise<StoreBrand | null> => {
  const sessionNext = await getCacheOptions("brands")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.brands,
      brandTag(handle),
      ...(sessionNext.tags || []),
    ])
  )

  return sdk.client
    .fetch<{ brand: StoreBrand }>(`/store/brands/${handle}`, {
      next: {
        ...sessionNext,
        tags,
        revalidate: 3600,
      },
    })
    .then(({ brand }) => {
      if (!brand) {
        const fallback = STATIC_BRANDS.find(
          (b) => b.handle.toLowerCase() === handle.toLowerCase()
        )
        return fallback || null
      }
      return enhanceBrandLogo(brand)
    })
    .catch(() => {
      const fallback = STATIC_BRANDS.find(
        (b) => b.handle.toLowerCase() === handle.toLowerCase()
      )
      return fallback || null
    })
}
