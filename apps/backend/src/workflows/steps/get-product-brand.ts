import { extractBrandFromProduct, normalizeBrand } from "../../modules/brand/utils/brand-normalizer"

export type ProductBrandInput = {
  title: string
  brand?: { name?: string } | null
  categories?: Array<{ name: string; handle?: string }> | null
  tags?: Array<{ value?: string; name?: string }> | null
  metadata?: Record<string, unknown> | null
}

/**
 * Resolves the brand name for a product using multiple discovery layers:
 * 1. Explicit linked brand entity (from brand module link)
 * 2. Product metadata (brand, make, manufacturer)
 * 3. Matched brand categories or tags
 * 4. Regex dictionary extraction from product title
 */
export function getProductBrand(product: ProductBrandInput): string | undefined {
  // 1. Check linked brand module entity
  if (product.brand?.name) {
    const normalized = normalizeBrand(product.brand.name)
    if (normalized?.name) {
      return normalized.name
    }
  }

  // 2. Check metadata
  const metaBrand =
    (product.metadata?.brand as string) ||
    (product.metadata?.make as string) ||
    (product.metadata?.manufacturer as string)

  if (metaBrand) {
    const normalized = normalizeBrand(metaBrand)
    if (normalized?.name) {
      return normalized.name
    }
  }

  // 3. Extract from product title and attributes using canonical tech dictionary
  const categories = (product.categories || []).map((cat) => ({
    name: cat.name,
    slug: cat.handle || "",
  }))

  const tags = (product.tags || []).map((tag) => ({
    name: tag.value || tag.name || "",
    slug: "",
  }))

  const extracted = extractBrandFromProduct({
    title: product.title || "",
    categories,
    tags,
  })

  if (extracted?.name) {
    return extracted.name
  }

  return undefined
}
