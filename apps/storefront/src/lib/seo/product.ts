import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { buildBaseMetadata } from "./metadata"
import { getProductCanonicalUrl } from "./canonical"
import { SITE_NAME } from "./constants"

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
 * Generates Google-compliant Next.js Metadata for Product Detail Pages allowing full indexing and crawling
 */
export function generateProductMetadata(
  product: HttpTypes.StoreProduct,
  countryCode: string = "zw"
): Metadata {
  const title = `${product.title} | ${SITE_NAME}`
  const description = cleanMetaDescription(
    product.description || product.subtitle,
    `Buy ${product.title} online at ${SITE_NAME}. Authentic tech with warranty and fast delivery across Zimbabwe.`
  )

  const canonicalUrl = getProductCanonicalUrl(product.handle, countryCode)
  const imageUrl = product.thumbnail || product.images?.[0]?.url || null

  // Only noindex if explicitly marked as hidden in metadata or not published
  const isExplicitlyHidden =
    (typeof (product as any).status === "string" &&
      (product as any).status !== "published") ||
    product.metadata?.noindex === true ||
    product.metadata?.seo_index === false

  return buildBaseMetadata({
    title,
    description,
    canonicalUrl,
    imageUrl,
    noIndex: isExplicitlyHidden,
    type: "website",
  })
}
