import { listCategories } from "@lib/data/categories"
import { getCategoryCanonicalUrl } from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"
import { buildUrlSetXml, xmlResponse, SitemapEntry } from "@lib/seo/sitemap-helper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

type EntityWithUpdatedAt = {
  updated_at?: string | Date | null
}

/**
 * Dedicated Category Sitemap (/category-sitemap.xml)
 * Returns all active store product categories.
 */
export async function GET() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date()
  const entries: SitemapEntry[] = []

  // Categories
  try {
    const categories = await listCategories().catch(() => [])
    for (const cat of categories || []) {
      if (cat.handle) {
        const item = cat as unknown as EntityWithUpdatedAt
        entries.push({
          url: getCategoryCanonicalUrl(cat.handle, countryCode),
          lastModified: item.updated_at ? new Date(item.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  } catch (err) {
    console.error("Error fetching categories for category sitemap:", err)
  }

  const xml = buildUrlSetXml(entries)
  return xmlResponse(xml)
}
