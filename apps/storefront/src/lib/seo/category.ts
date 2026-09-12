import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { buildBaseMetadata } from "./metadata"
import { getCategoryCanonicalUrl } from "./canonical"
import { SITE_NAME } from "./constants"
import { SeoMetadataDTO } from "@lib/data/seo"

/**
 * Generates Google-compliant Next.js Metadata for Category Pages.
 * When a custom seo record is provided, its fields take precedence over
 * the template-generated fallbacks.
 */
export function generateCategoryMetadata(
  category: HttpTypes.StoreProductCategory,
  countryCode: string = "zw",
  seo?: SeoMetadataDTO | null
): Metadata {
  const fallbackTitle = `${category.name} | ${SITE_NAME}`
  const fallbackDescription =
    category.description ||
    `Browse authentic ${category.name} products at ${SITE_NAME}. Best prices, genuine warranty, and fast shipping in Zimbabwe.`
  const fallbackCanonicalUrl = getCategoryCanonicalUrl(category.handle, countryCode)

  const title = seo?.meta_title || fallbackTitle
  const description = seo?.meta_description || fallbackDescription
  const canonicalUrl = seo?.canonical_url || fallbackCanonicalUrl
  const imageUrl = seo?.og_image || null

  const robotsIndex = seo ? seo.robots_index : true
  const robotsFollow = seo ? seo.robots_follow : true

  return buildBaseMetadata({
    title: seo?.og_title || title,
    description: seo?.og_description || description,
    canonicalUrl,
    imageUrl,
    type: "website",
    robots: { index: robotsIndex, follow: robotsFollow },
    metaTitle: title,
    metaDescription: description,
  })
}
