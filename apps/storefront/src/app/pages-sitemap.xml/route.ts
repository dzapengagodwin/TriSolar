import { getCanonicalUrl } from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"
import { buildUrlSetXml, xmlResponse, SitemapEntry } from "@lib/seo/sitemap-helper"

export const dynamic = "force-dynamic"
export const revalidate = 3600

/**
 * Dedicated Static Pages Sitemap (/pages-sitemap.xml)
 * Returns all static, informational, and policy pages.
 */
export async function GET() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date()

  const entries: SitemapEntry[] = [
    {
      url: getCanonicalUrl("", countryCode),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getCanonicalUrl("/shop", countryCode),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/contact-us", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: getCanonicalUrl("/returns-and-refunds", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: getCanonicalUrl("/delivery-terms", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: getCanonicalUrl("/terms-and-conditions", countryCode),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/privacy-policy", countryCode),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/faq", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: getCanonicalUrl("/track-order", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/customer-help", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  const xml = buildUrlSetXml(entries)
  return xmlResponse(xml)
}

