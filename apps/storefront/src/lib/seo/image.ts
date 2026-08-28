import { SITE_NAME } from "./constants"

export type ProductImageAltOptions = {
  title?: string | null
  brand?: string | null
  index?: number
  totalImages?: number
  explicitAlt?: string | null
}

/**
 * Strips HTML tags and normalizes whitespace
 */
function cleanText(raw?: string | null): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Generates a descriptive, natural, non-keyword-stuffed alt text for product images.
 * Fallback hierarchy:
 * 1. Explicit image alt text if already defined
 * 2. Brand + Product Title + (Angle/View context)
 * 3. Product Title
 * 4. Safe fallback
 */
export function getProductImageAlt({
  title,
  brand,
  index = 0,
  totalImages = 1,
  explicitAlt,
}: ProductImageAltOptions): string {
  const cleanExplicit = cleanText(explicitAlt)
  if (cleanExplicit && cleanExplicit.toLowerCase() !== "thumbnail" && cleanExplicit.toLowerCase() !== "image") {
    return cleanExplicit
  }

  const cleanTitle = cleanText(title)
  const cleanBrand = cleanText(brand)

  if (!cleanTitle) {
    return `${cleanBrand ? cleanBrand + " " : ""}Product Image | ${SITE_NAME}`
  }

  // Prevent duplicate brand prefixes (e.g. if title is "Lenovo ThinkPad" and brand is "Lenovo")
  let displayTitle = cleanTitle
  if (
    cleanBrand &&
    !cleanTitle.toLowerCase().startsWith(cleanBrand.toLowerCase())
  ) {
    displayTitle = `${cleanBrand} ${cleanTitle}`
  }

  // Format natural context for single vs multiple image galleries
  if (totalImages <= 1 || index === 0) {
    return `${displayTitle} - Main View`
  }

  return `${displayTitle} - Angle ${index + 1}`
}

/**
 * Safely escapes characters for standard XML sitemaps
 */
export function escapeXml(str?: string | null): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
