import { Metadata } from "next"
import { buildBaseMetadata } from "./metadata"
import { getBrandCanonicalUrl } from "./canonical"
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
  const fallbackCanonicalUrl = getBrandCanonicalUrl(brand.handle, countryCode)

  const rawTitle = seo?.meta_title || brand.name
  const title = rawTitle.replace(/\s*\|\s*(Laptopzone|Laptop Zone)\s*$/i, "").trim()

  const rawOgTitle = seo?.og_title || title
  const ogTitle = rawOgTitle.replace(/\s*\|\s*(Laptopzone|Laptop Zone)\s*$/i, "").trim()

  const description = seo?.meta_description || brand.description || undefined
  const canonicalUrl = fallbackCanonicalUrl
  const imageUrl = seo?.og_image || brand.logo || null

  const robotsIndex = seo ? seo.robots_index : true
  const robotsFollow = seo ? seo.robots_follow : true

  return buildBaseMetadata({
    title: ogTitle,
    description: seo?.og_description || description,
    canonicalUrl,
    imageUrl,
    type: "website",
    robots: { index: robotsIndex, follow: robotsFollow },
    metaTitle: title,
    metaDescription: description,
    absoluteTitle: true,
  })
}
