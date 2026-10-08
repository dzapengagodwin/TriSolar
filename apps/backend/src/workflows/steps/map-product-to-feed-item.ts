import { ProductFeedConfig, ProductFeedItem } from "./types"
import { getProductBrand } from "./get-product-brand"
import { normalizeGtin } from "./normalize-gtin"

type FeedLocation = {
  id: string
  address?: { country_code?: string | null } | null
}

export type FeedProduct = {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  handle: string
  thumbnail?: string | null
  images?: Array<{ url: string }>
  categories?: Array<{ name: string; handle?: string }>
  collection?: { title?: string } | null
  brand?: { name?: string } | null
  metadata?: Record<string, unknown> | null
  variants?: FeedVariant[]
  sales_channels?: Array<{
    id: string
    stock_locations?: FeedLocation[]
  }>
}

type FeedVariant = {
  id: string
  title?: string | null
  barcode?: string | null
  ean?: string | null
  upc?: string | null
  manage_inventory?: boolean
  allow_backorder?: boolean
  metadata?: Record<string, unknown> | null
  options?: Array<{ value?: string | null }>
  prices?: Array<{
    amount: number
    currency_code: string
    price_list_id?: string | null
  }>
  calculated_price?: {
    calculated_amount?: number | null
    original_amount?: number | null
    currency_code?: string | null
  } | null
  inventory_items?: Array<{
    inventory?: {
      location_levels?: Array<{
        location_id?: string
        stocked_quantity?: number | null
        reserved_quantity?: number | null
      }>
    }
  }>
}

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
  product: FeedProduct,
  variant: FeedVariant,
  config: ProductFeedConfig
): ProductFeedItem {
  const currencyUpper = config.currency_code.toUpperCase()
  const merchant = (product.metadata?.google_merchant || {}) as Record<string, unknown>
  const variantMerchant = (variant.metadata?.google_merchant || {}) as Record<string, unknown>

  // 1. Title formatting (include variant options if not default)
  let title =
    cleanDescription(typeof merchant.title === "string" ? merchant.title : "") ||
    product.title ||
    ""
  const isDefaultVariant =
    !variant.title ||
    variant.title.toLowerCase() === "default" ||
    variant.title.toLowerCase() === "default variant" ||
    variant.title.toLowerCase() === "default value"

  if (!merchant.title && !isDefaultVariant && variant.title) {
    title = `${product.title} - ${variant.title}`
  } else if (!merchant.title && variant.options && variant.options.length > 0) {
    const optValues = variant.options
      .map((opt) => opt.value)
      .filter(
        (val): val is string =>
          typeof val === "string" &&
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
    cleanDescription(product.subtitle)

  // 3. Link generation
  const baseStorefrontUrl = config.storefront_url.replace(/\/+$/, "")
  const link = `${baseStorefrontUrl}/product/${encodeURIComponent(product.handle)}`

  // 4. Primary and additional images
  const variantImage = cleanString(variant.metadata?.image)
  const primaryImage =
    variantImage ||
    product.thumbnail ||
    product.images?.[0]?.url ||
    ""

  const additionalImages: string[] = (product.images || [])
    .map((img) => img.url)
    .filter(
      (url, index, images) =>
        url !== primaryImage && images.indexOf(url) === index
    )
    .slice(0, 10)

  // 5. Availability is limited to stock locations serving this country and channel.
  const targetLocationIds = new Set(
    (product.sales_channels || [])
      .flatMap((channel) =>
        (channel.stock_locations || [])
          .filter(
            (location) =>
              location.address?.country_code?.toLowerCase() ===
              config.country_code.toLowerCase()
          )
          .map((location) => location.id)
      )
  )
  const availabilityDate =
    cleanString(variant.metadata?.availability_date) ||
    cleanString(product.metadata?.availability_date)
  const availabilityOverride =
    variant.metadata?.availability || product.metadata?.availability

  let availability: ProductFeedItem["availability"] = "out_of_stock"
  if (variant.manage_inventory === false) {
    availability = "in_stock"
  } else if (availabilityOverride === "preorder") {
    availability = "preorder"
  } else if (availabilityOverride === "backorder") {
    availability = "backorder"
  } else {
    const availableStock = (variant.inventory_items || []).reduce(
      (total, item) =>
        total +
        (item.inventory?.location_levels || [])
          .filter((level) => targetLocationIds.has(level.location_id || ""))
          .reduce(
            (locationTotal, level) =>
              locationTotal +
              (level.stocked_quantity || 0) -
              (level.reserved_quantity || 0),
            0
          ),
      0
    )

    if (availableStock > 0) {
      availability = "in_stock"
    } else if (variant.allow_backorder) {
      availability = "backorder"
    }
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
        : null

    const origAmount =
      typeof calcObj.original_amount === "number"
        ? calcObj.original_amount
        : calcAmount

    if (
      calcAmount !== null &&
      (!calcObj.currency_code || calcObj.currency_code.toUpperCase() === currencyUpper)
    ) {
      currentAmount = calcAmount
      originalAmount = origAmount
    }
  }

  // Fallback to variant.prices matching currency
  if (currentAmount === null && variant.prices && variant.prices.length > 0) {
    const matchingPrice = variant.prices.find(
      (p) =>
        (p.currency_code || "").toUpperCase() === currencyUpper &&
        !p.price_list_id
    )

    if (matchingPrice && typeof matchingPrice.amount === "number") {
      currentAmount = matchingPrice.amount
      originalAmount = matchingPrice.amount
    }
  }

  const finalAmount = currentAmount
  const finalOrigAmount =
    originalAmount !== null && finalAmount !== null && originalAmount > finalAmount
      ? originalAmount
      : finalAmount

  let priceStr = finalAmount === null ? "" : `${finalAmount.toFixed(2)} ${currencyUpper}`
  let salePriceStr: string | undefined

  if (finalAmount !== null && finalOrigAmount !== null && finalAmount < finalOrigAmount) {
    priceStr = `${finalOrigAmount.toFixed(2)} ${currencyUpper}`
    salePriceStr = `${finalAmount.toFixed(2)} ${currencyUpper}`
  }

  // 7. Brand Resolution
  const brand = getProductBrand(product)

  // 8. Unique Product Identifiers (GTIN & MPN)
  const allowProductIdentifiers = !product.variants || product.variants.length === 1
  const gtin =
    normalizeGtin(variantMerchant.gtin) ||
    normalizeGtin(variant.barcode) ||
    normalizeGtin(variant.ean) ||
    normalizeGtin(variant.upc) ||
    normalizeGtin(variant.metadata?.gtin) ||
    normalizeGtin(variant.metadata?.barcode) ||
    (allowProductIdentifiers
      ? normalizeGtin(merchant.gtin) ||
        normalizeGtin(product.metadata?.gtin) ||
        normalizeGtin(product.metadata?.barcode)
      : undefined)

  const mpn =
    normalizeMpn(variantMerchant.mpn) ||
    normalizeMpn(variant.metadata?.mpn) ||
    normalizeMpn(variant.metadata?.manufacturer_mpn) ||
    normalizeMpn(variant.metadata?.part_number) ||
    (allowProductIdentifiers
      ? normalizeMpn(merchant.mpn) ||
        normalizeMpn(product.metadata?.mpn) ||
        normalizeMpn(product.metadata?.manufacturer_mpn) ||
        normalizeMpn(product.metadata?.part_number)
      : undefined)

  const googleCategory =
    (typeof merchant.google_product_category === "string"
      ? cleanDescription(merchant.google_product_category)
      : "") ||
    (typeof product.metadata?.google_product_category === "string"
      ? cleanDescription(product.metadata.google_product_category)
      : "") ||
    undefined

  // 10. Condition
  const conditionValue = variant.metadata?.condition || product.metadata?.condition
  const condition: ProductFeedItem["condition"] =
    conditionValue === "refurbished" || conditionValue === "used"
      ? conditionValue
      : "new"

  const requestedIdentifierExists =
    variantMerchant.identifier_exists === "yes" ||
    variantMerchant.identifier_exists === "no"
      ? variantMerchant.identifier_exists
      : merchant.identifier_exists === "yes" || merchant.identifier_exists === "no"
        ? merchant.identifier_exists
        : undefined

  return {
    id: variant.id,
    title,
    description,
    link,
    image_link: primaryImage,
    additional_image_link:
      additionalImages.length > 0 ? additionalImages : undefined,
    availability,
    availability_date: availabilityDate,
    price: priceStr,
    sale_price: salePriceStr,
    item_group_id: product.id,
    condition,
    brand,
    gtin,
    mpn,
    identifier_exists: requestedIdentifierExists || (gtin || (brand && mpn) ? "yes" : "no"),
    google_product_category: googleCategory,
    custom_label_0: product.collection?.title || undefined,
    custom_label_1: brand || undefined,
    custom_label_2:
      availability === "in_stock"
        ? "In Stock"
        : availability === "out_of_stock"
          ? "Out of Stock"
          : availability === "backorder"
            ? "Backorder"
            : "Preorder",
  }
}
