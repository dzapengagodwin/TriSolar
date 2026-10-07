import { ProductFeedConfig, ProductFeedItem } from "./types"
import { getProductBrand } from "./get-product-brand"

/**
 * Strips HTML tags, entities, and excessive whitespace from a string
 */
function cleanDescription(raw?: string | null): string {
  if (!raw) return ""

  return raw
    .replace(/<[^>]+>/g, " ") // Remove HTML tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Safely converts value to clean trimmed string or undefined
 */
function cleanString(val: unknown): string | undefined {
  if (val === null || val === undefined) return undefined
  const str = String(val).trim()
  return str.length > 0 ? str : undefined
}

/**
 * Normalizes GTIN by removing spaces and hyphens.
 * Returns digits-only string if it matches standard GTIN lengths (8 to 14 digits).
 */
function normalizeGtin(raw: unknown): string | undefined {
  const str = cleanString(raw)
  if (!str) return undefined
  const digitsOnly = str.replace(/[\s-]/g, "")
  if (/^\d{8,14}$/.test(digitsOnly)) {
    return digitsOnly
  }
  return undefined
}

/**
 * Normalizes MPN by trimming and filtering out placeholder strings.
 */
function normalizeMpn(raw: unknown): string | undefined {
  const str = cleanString(raw)
  if (!str) return undefined
  const lower = str.toLowerCase()
  if (lower === "n/a" || lower === "none" || lower === "null" || lower === "undefined") {
    return undefined
  }
  return str
}

/**
 * Maps a single Medusa product and variant into a Google Product Feed item
 */
export function mapProductToFeedItem(
  product: any,
  variant: any,
  config: ProductFeedConfig
): ProductFeedItem {
  const currencyUpper = config.currency_code.toUpperCase()
  const merchant = (product.metadata?.google_merchant || {}) as Record<string, unknown>
  const variantMerchant = (variant.metadata?.google_merchant || {}) as Record<string, unknown>

  // 1. Title formatting (include variant options if not default)
  let title = (cleanDescription(merchant.title as string) || product.title || "")
  const isDefaultVariant =
    !variant.title ||
    variant.title.toLowerCase() === "default" ||
    variant.title.toLowerCase() === "default variant" ||
    variant.title.toLowerCase() === "default value"

  if (!merchant.title && !isDefaultVariant && variant.title) {
    title = `${product.title} - ${variant.title}`
  } else if (!merchant.title && variant.options && variant.options.length > 0) {
    const optValues = variant.options
      .map((opt: any) => opt.value)
      .filter(
        (val: string) =>
          val &&
          val.toLowerCase() !== "default" &&
          val.toLowerCase() !== "default variant" &&
          val.toLowerCase() !== "default value"
      )
    if (optValues.length > 0) {
      title = `${product.title} - ${optValues.join(" / ")}`
    }
  }

  // 2. Clean plain-text description
  const description =
    cleanDescription(product.description) ||
    cleanDescription(product.subtitle) ||
    title

  // 3. Link generation
  const baseStorefrontUrl = config.storefront_url.replace(/\/+$/, "")
  const link = `${baseStorefrontUrl}/product/${product.handle}`

  // 4. Primary and additional images
  const primaryImage =
    (variant.metadata?.image as string) ||
    product.thumbnail ||
    product.images?.[0]?.url ||
    ""

  const additionalImages: string[] = (product.images || [])
    .map((img: any) => img.url)
    .filter((url: string) => url && url !== primaryImage)
    .slice(0, 10)

  // 5. Availability computation
  let availability: "in_stock" | "out_of_stock" | "preorder" = "in_stock"

  if (variant.manage_inventory === false) {
    availability = "in_stock"
  } else if (variant.allow_backorder) {
    availability = "in_stock"
  } else if (variant.inventory_items && variant.inventory_items.length > 0) {
    let totalStock = 0
    for (const invItem of variant.inventory_items) {
      const levels = invItem.inventory?.location_levels || []
      for (const level of levels) {
        const available = (level.stocked_quantity || 0) - (level.reserved_quantity || 0)
        totalStock += available
      }
    }
    availability = totalStock > 0 ? "in_stock" : "out_of_stock"
  }

  // 6. Price & Sale Price calculation
  let originalAmount: number | null = null
  let currentAmount: number | null = null

  // Check calculated price if resolved by Pricing Module / Query Graph
  if (variant.calculated_price) {
    const calcObj = variant.calculated_price
    const calcAmount =
      typeof calcObj.calculated_amount === "number"
        ? calcObj.calculated_amount
        : typeof calcObj.amount === "number"
        ? calcObj.amount
        : null

    const origAmount =
      typeof calcObj.original_amount === "number"
        ? calcObj.original_amount
        : calcAmount

    if (calcAmount !== null) {
      currentAmount = calcAmount
      originalAmount = origAmount
    }
  }

  // Fallback to variant.prices matching currency
  if (currentAmount === null && variant.prices && variant.prices.length > 0) {
    const matchingPrice =
      variant.prices.find(
        (p: any) =>
          (p.currency_code || "").toUpperCase() === currencyUpper &&
          !p.price_list_id
      ) || variant.prices[0]

    if (matchingPrice && typeof matchingPrice.amount === "number") {
      currentAmount = matchingPrice.amount
      originalAmount = matchingPrice.amount
    }
  }

  const finalAmount = currentAmount !== null ? currentAmount : 0
  const finalOrigAmount =
    originalAmount !== null && originalAmount > finalAmount
      ? originalAmount
      : finalAmount

  let priceStr = `${finalOrigAmount.toFixed(2)} ${currencyUpper}`
  let salePriceStr: string | undefined

  if (finalAmount < finalOrigAmount) {
    priceStr = `${finalOrigAmount.toFixed(2)} ${currencyUpper}`
    salePriceStr = `${finalAmount.toFixed(2)} ${currencyUpper}`
  } else {
    priceStr = `${finalAmount.toFixed(2)} ${currencyUpper}`
  }

  // 7. Brand Resolution
  const brand = getProductBrand(product)

  // 8. Unique Product Identifiers (GTIN & MPN)
  const gtin =
    normalizeGtin(variantMerchant.gtin) ||
    normalizeGtin(merchant.gtin) ||
    normalizeGtin(variant.barcode) ||
    normalizeGtin(variant.ean) ||
    normalizeGtin(variant.upc) ||
    normalizeGtin(variant.metadata?.gtin) ||
    normalizeGtin(variant.metadata?.barcode) ||
    normalizeGtin(product.metadata?.gtin) ||
    normalizeGtin(product.metadata?.barcode) ||
    normalizeGtin(variant.sku) ||
    normalizeGtin(product.metadata?.woo_sku)

  // Extract MPN from metadata specifications if available
  const specs = (product.metadata?.specifications || {}) as Record<string, unknown>
  const specPartNo = Array.isArray(specs["Part Number"])
    ? specs["Part Number"][0]
    : specs["Part Number"]
  const specModel = Array.isArray(specs["Model"]) ? specs["Model"][0] : specs["Model"]

  // Extract MPN from title if in parentheses (e.g. "HP 250 G7 (6MQ60ES)")
  let titleMpn: string | undefined
  const titleMatch = (product.title || "").match(/\(([A-Z0-9#\-_/]{4,})\)/i)
  if (titleMatch) {
    titleMpn = titleMatch[1]
  }

  const mpn =
    normalizeMpn(variantMerchant.mpn) ||
    normalizeMpn(merchant.mpn) ||
    normalizeMpn(variant.metadata?.mpn) ||
    normalizeMpn(variant.metadata?.manufacturer_mpn) ||
    normalizeMpn(variant.metadata?.part_number) ||
    normalizeMpn(product.metadata?.mpn) ||
    normalizeMpn(product.metadata?.manufacturer_mpn) ||
    normalizeMpn(product.metadata?.part_number) ||
    normalizeMpn(specPartNo) ||
    normalizeMpn(specModel) ||
    (gtin !== variant.sku ? normalizeMpn(variant.sku) : undefined) ||
    (gtin !== product.metadata?.woo_sku ? normalizeMpn(product.metadata?.woo_sku) : undefined) ||
    normalizeMpn(titleMpn)

  // 9. Categories and Product Type
  const categoryNames = (product.categories || []).map((c: any) => c.name)
  const productType =
    (categoryNames.length > 0
      ? categoryNames.join(" > ")
      : (product.collection?.title as string) || undefined)

  const googleCategory =
    (cleanDescription(merchant.google_product_category as string) || undefined) ||
    (product.metadata?.google_product_category as string)

  // 10. Condition
  const condition =
    (variant.metadata?.condition as any) ||
    (product.metadata?.condition as any) ||
    "new"

  return {
    id: variant.id,
    title,
    description,
    link,
    image_link: primaryImage,
    additional_image_link:
      additionalImages.length > 0 ? additionalImages : undefined,
    availability,
    price: priceStr,
    sale_price: salePriceStr,
    item_group_id: product.id,
    condition,
    brand,
    gtin,
    mpn,
    identifier_exists: (variantMerchant.identifier_exists === "yes" || variantMerchant.identifier_exists === "no"
      ? variantMerchant.identifier_exists
      : merchant.identifier_exists === "yes" || merchant.identifier_exists === "no"
        ? merchant.identifier_exists
        : gtin || (brand && mpn) ? "yes" : "no"),
    google_product_category: googleCategory,
    product_type: productType,
    custom_label_0: product.collection?.title || undefined,
    custom_label_1: brand || undefined,
    custom_label_2: availability === "in_stock" ? "In Stock" : "Out of Stock",
  }
}
