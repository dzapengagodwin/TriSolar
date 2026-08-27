import { Metadata } from "next"
import { buildBaseMetadata } from "./metadata"
import { getBrandCanonicalUrl } from "./canonical"
import { SITE_NAME } from "./constants"

export type BrandInput = {
  id?: string
  name: string
  handle: string
  description?: string | null
  logo?: string | null
}

/**
 * Generates Google-compliant Next.js Metadata for Brand Pages
 */
export function generateBrandMetadata(
  brand: BrandInput,
  countryCode: string = "zw"
): Metadata {
  const title = `${brand.name} Laptops, Computers & Tech | ${SITE_NAME}`
  const description =
    brand.description ||
    `Shop original ${brand.name} products at ${SITE_NAME}. High performance, official warranty, and nationwide delivery across Zimbabwe.`

  const canonicalUrl = getBrandCanonicalUrl(brand.handle, countryCode)

  return buildBaseMetadata({
    title,
    description,
    canonicalUrl,
    imageUrl: brand.logo || null,
    type: "website",
  })
}
