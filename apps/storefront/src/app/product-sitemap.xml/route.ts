import { listProducts } from "@lib/data/products"
import { getProductCanonicalUrl } from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"
import { buildUrlSetXml, xmlResponse, SitemapEntry } from "@lib/seo/sitemap-helper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

/**
 * Dedicated Product Sitemap (/product-sitemap.xml)
 * Returns all active, indexable published products.
 */
export async function GET() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date()
  const pageSize = 100
  let offset = 0
  let hasMore = true

  const entries: SitemapEntry[] = []

  while (hasMore) {
    try {
      const { response } = await listProducts({
        countryCode,
        queryParams: {
          limit: pageSize,
          offset,
          fields: "id,handle,updated_at,status,metadata",
        },
      })

      const products = response?.products || []
      if (products.length === 0) {
        hasMore = false
        break
      }

      for (const prod of products) {
        if (
          prod.handle &&
          (prod as unknown as { status?: string }).status !== "draft" &&
          (prod as unknown as { status?: string }).status !== "archived" &&
          prod.metadata?.noindex !== true &&
          prod.metadata?.seo_index !== false
        ) {
          entries.push({
            url: getProductCanonicalUrl(prod.handle, countryCode),
            lastModified: prod.updated_at ? new Date(prod.updated_at) : now,
            changeFrequency: "daily",
            priority: 0.8,
          })
        }
      }

      offset += pageSize
      if (products.length < pageSize) {
        hasMore = false
      }
    } catch (err) {
      console.error("Error fetching products for product sitemap:", err)
      hasMore = false
    }
  }

  const xml = buildUrlSetXml(entries)
  return xmlResponse(xml)
}

