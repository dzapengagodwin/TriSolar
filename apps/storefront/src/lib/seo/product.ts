import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { buildBaseMetadata } from "./metadata"
import { getProductCanonicalUrl, stripVariantIdFromUrl } from "./canonical"
import { SITE_NAME } from "./constants"
import { SeoMetadataDTO } from "@lib/data/seo"

/**
 * Strips HTML tags and collapses whitespace to create a clean meta description
 */
function cleanMetaDescription(raw?: string | null, fallback?: string): string {
  if (!raw) return fallback || ""
  const cleaned = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (cleaned.length <= 160) return cleaned
  return `${cleaned.slice(0, 157)}...`
}

/**
 * Generates Google-compliant Next.js Metadata for Product Detail Pages
 * Priority: 1. Custom SEO metadata -> 2. Product fields -> 3. Safe fallback
 */
export function generateProductMetadata(
  product: HttpTypes.StoreProduct,
  countryCode: string = "zw",
  seo?: Partial<SeoMetadataDTO> | null
): Metadata {
  // 1. Title Priority: Custom SEO title -> Product title + Brand -> Fallback
  const title =
    seo?.meta_title && seo.meta_title.trim()
      ? seo.meta_title.trim()
      : product.title
      ? `${product.title} | ${SITE_NAME}`
      : SITE_NAME

  // 2. Description Priority: Custom SEO desc -> Product desc/subtitle -> Fallback
  const rawDescription =
    seo?.meta_description && seo.meta_description.trim()
      ? seo.meta_description.trim()
      : product.description || product.subtitle

  const description = cleanMetaDescription(
    rawDescription,
    `Buy ${product.title} online at ${SITE_NAME}. Authentic tech with warranty and fast delivery across Zimbabwe.`
  )

  // 3. Canonical URL: Custom canonical override -> Standard canonical product URL
  const canonicalUrl =
    seo?.canonical_url && seo.canonical_url.trim()
      ? stripVariantIdFromUrl(seo.canonical_url.trim())
      : getProductCanonicalUrl(product.handle, countryCode)

  // 4. Primary Image: Custom OG image -> Product thumbnail -> First gallery image
  const imageUrl =
    seo?.og_image && seo.og_image.trim()
      ? seo.og_image.trim()
      : product.thumbnail || product.images?.[0]?.url || null

  // 5. Robots: SEO record override -> Product status/metadata check
  let isNoIndex = false
  if (seo && typeof seo.robots_index === "boolean") {
    isNoIndex = !seo.robots_index
  } else {
    isNoIndex =
      (typeof (product as unknown as Record<string, unknown>).status === "string" &&
        (product as unknown as Record<string, unknown>).status !== "published") ||
      product.metadata?.noindex === true ||
      product.metadata?.seo_index === false
  }

  return buildBaseMetadata({
    title,
    description,
    canonicalUrl,
    imageUrl,
    noIndex: isNoIndex,
    type: "website",
  })
}
