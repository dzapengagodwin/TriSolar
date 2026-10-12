import { listBrands } from "@lib/data/brands"
import { getBrandCanonicalUrl, getCanonicalUrl } from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"
import { buildUrlSetXml, xmlResponse, SitemapEntry } from "@lib/seo/sitemap-helper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

type BrandWithDate = {
  handle: string
  updated_at?: string | Date | null
}

/**
 * Dedicated Brand Sitemap (/brand-sitemap.xml)
 * Returns the brand directory and all active brand pages under /brands/.
 */
export async function GET() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date()
  const entries: SitemapEntry[] = []

  // Main /brands directory index page
  entries.push({
    url: getCanonicalUrl("/brands", countryCode),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  })

  try {
    const brands = await listBrands({ limit: 100 }).catch(() => [])
    for (const brand of brands || []) {
      if (brand.handle) {
        const item = brand as unknown as BrandWithDate
        entries.push({
          url: getBrandCanonicalUrl(brand.handle, countryCode),
          lastModified: item.updated_at ? new Date(item.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.6,
        })
      }
    }
  } catch (err) {
    console.error("Error fetching brands for brand sitemap:", err)
  }

  const xml = buildUrlSetXml(entries)
  return xmlResponse(xml)
}
