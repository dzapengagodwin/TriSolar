import { Metadata } from "next"
import { buildBaseMetadata } from "./metadata"
import { getBrandCanonicalUrl } from "./canonical"
import { SITE_NAME } from "./constants"
import { SeoMetadataDTO } from "@lib/data/seo"

export type BrandInput = {
  id?: string
  name: string
  handle: string
  description?: string | null
  logo?: string | null
}

/**
 * Generates Google-compliant Next.js Metadata for Brand Pages.
 * When a custom seo record is provided, its fields take precedence over
 * the template-generated fallbacks.
 */
export function generateBrandMetadata(
  brand: BrandInput,
  countryCode: string = "zw",
  seo?: SeoMetadataDTO | null
): Metadata {
  const fallbackTitle = `${brand.name} Laptops, Computers & Tech | ${SITE_NAME}`
  const fallbackDescription =
    brand.description ||
    `Shop original ${brand.name} products at ${SITE_NAME}. High performance, official warranty, and nationwide delivery across Zimbabwe.`
  const fallbackCanonicalUrl = getBrandCanonicalUrl(brand.handle, countryCode)

  const title = seo?.meta_title || fallbackTitle
  const description = seo?.meta_description || fallbackDescription
  const canonicalUrl = seo?.canonical_url || fallbackCanonicalUrl
  const imageUrl = seo?.og_image || brand.logo || null

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
