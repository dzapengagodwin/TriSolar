import { STORE_URL } from "@lib/seo/constants"
import { buildSitemapIndexXml, xmlResponse } from "@lib/seo/sitemap-helper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

/**
 * Master Sitemap Index (/sitemap.xml)
 * Groups and references dedicated sub-sitemaps for search engines:
 *  - /product-sitemap.xml   (Published catalog products)
 *  - /category-sitemap.xml  (Store product categories)
 *  - /brand-sitemap.xml     (Hardware & electronics brands)
 *  - /pages-sitemap.xml     (Static content and policy pages)
 *  - /image-sitemap.xml     (Google Image sitemap)
 */
export async function GET() {
  const baseUrl = STORE_URL.replace(/\/+$/, "")
  const now = new Date()

  const sitemaps = [
    {
      loc: `${baseUrl}/product-sitemap.xml`,
      lastmod: now,
    },
    {
      loc: `${baseUrl}/category-sitemap.xml`,
      lastmod: now,
    },
    {
      loc: `${baseUrl}/brand-sitemap.xml`,
      lastmod: now,
    },
    {
      loc: `${baseUrl}/pages-sitemap.xml`,
      lastmod: now,
    },
    {
      loc: `${baseUrl}/image-sitemap.xml`,
      lastmod: now,
    },
  ]

  const xml = buildSitemapIndexXml(sitemaps)
  return xmlResponse(xml)
}

