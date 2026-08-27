import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { buildBaseMetadata } from "./metadata"
import { getCategoryCanonicalUrl } from "./canonical"
import { SITE_NAME } from "./constants"

/**
 * Generates Google-compliant Next.js Metadata for Category Pages
 */
export function generateCategoryMetadata(
  category: HttpTypes.StoreProductCategory,
  countryCode: string = "zw"
): Metadata {
  const title = `${category.name} | ${SITE_NAME}`
  const description =
    category.description ||
    `Browse authentic ${category.name} products at ${SITE_NAME}. Best prices, genuine warranty, and fast shipping in Zimbabwe.`

  const canonicalUrl = getCategoryCanonicalUrl(category.handle, countryCode)

  return buildBaseMetadata({
    title,
    description,
    canonicalUrl,
    type: "website",
  })
}
