import { HttpTypes } from "@medusajs/types"
import { getProductCanonicalUrl } from "@lib/seo/canonical"
import { SITE_NAME, DEFAULT_CURRENCY_CODE } from "@lib/seo/constants"
import { SeoMetadataDTO } from "@lib/data/seo"

type ProductJsonLdProps = {
  product: HttpTypes.StoreProduct
  countryCode?: string
  currencyCode?: string
  seo?: Partial<SeoMetadataDTO> | null
}

type ExtendedVariant = HttpTypes.StoreProductVariant & {
  prices?: Array<{ amount?: number; currency_code?: string }>
  inventory_items?: Array<{
    inventory?: {
      location_levels?: Array<{
        stocked_quantity?: number
        reserved_quantity?: number
      }>
    }
  }>
}

type ExtendedProduct = HttpTypes.StoreProduct & {
  brand?: { name?: string }
}

/**
 * Strips HTML tags and collapses whitespace
 */
function stripHtml(raw?: string | null): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Emits Google-compliant Schema.org Product and Variant Offers JSON-LD Structured Data
 */
export default function ProductJsonLd({
  product,
  countryCode = "zw",
  currencyCode = DEFAULT_CURRENCY_CODE,
  seo,
}: ProductJsonLdProps) {
  if (!product || !product.id) return null

  const canonicalUrl = getProductCanonicalUrl(product.handle, countryCode)

  const currencyUpper = currencyCode.toUpperCase()

  // Collect image URLs
  const images: string[] = []
  if (seo?.og_image && seo.og_image.trim()) {
    images.push(seo.og_image.trim())
  }
  if (product.thumbnail && !images.includes(product.thumbnail)) {
    images.push(product.thumbnail)
  }
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.url && !images.includes(img.url)) {
        images.push(img.url)
      }
    }
  }

  // Extract brand conditionally
  const extProduct = product as ExtendedProduct
  const metaBrand =
    (product.metadata?.brand as string | undefined) ||
    (product.metadata?.make as string | undefined) ||
    (product.metadata?.manufacturer as string | undefined) ||
    extProduct.brand?.name

  // Map variants to Schema.org Offer objects
  const variants = (product.variants || []) as ExtendedVariant[]
  const offers = variants
    .map((variant) => {
      // Calculate price
      let amount: number | null = null
      if (variant.calculated_price) {
        const calc = variant.calculated_price as unknown as Record<string, unknown>
        if (typeof calc.calculated_amount === "number") {
          amount = calc.calculated_amount
        } else if (typeof calc.amount === "number") {
          amount = calc.amount
        }
      }

      const variantPrices = variant.prices
      if (amount === null && variantPrices && variantPrices.length > 0) {
        const matching =
          variantPrices.find(
            (p) => (p.currency_code || "").toUpperCase() === currencyUpper
          ) || variantPrices[0]
        if (matching && typeof matching.amount === "number") {
          amount = matching.amount
        }
      }

      if (amount === null) return null

      // Check stock availability
      let isAvailable = true
      if (variant.manage_inventory && !variant.allow_backorder) {
        const invLevels =
          variant.inventory_items?.flatMap(
            (i) => i.inventory?.location_levels || []
          ) || []
        if (invLevels.length > 0) {
          const totalStock = invLevels.reduce(
            (sum, l) =>
              sum + ((l.stocked_quantity || 0) - (l.reserved_quantity || 0)),
            0
          )
          isAvailable = totalStock > 0
        }
      }

      const offerObj: Record<string, unknown> = {
        "@type": "Offer",
        price: amount.toFixed(2),
        priceCurrency: currencyUpper,
        priceValidUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
        availability: isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        url: canonicalUrl,
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      }

      if (variant.sku && variant.sku.trim()) {
        offerObj.sku = variant.sku.trim()
      }

      const barcode = variant.barcode || (variant.metadata?.gtin as string)
      if (barcode && barcode.trim()) {
        offerObj.gtin = barcode.trim()
      }

      return offerObj
    })
    .filter(Boolean)

  const primaryVariant = variants[0]

  // Construct main Product Schema object strictly avoiding empty or null values
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: stripHtml(
      seo?.meta_description || product.description || product.subtitle || product.title
    ),
    url: canonicalUrl,
  }

  if (images.length > 0) {
    productSchema.image = images
  }

  if (metaBrand && metaBrand.trim()) {
    productSchema.brand = {
      "@type": "Brand",
      name: metaBrand.trim(),
    }
  }

  if (primaryVariant?.sku && primaryVariant.sku.trim()) {
    productSchema.sku = primaryVariant.sku.trim()
    productSchema.mpn = primaryVariant.sku.trim()
  }

  const primaryBarcode =
    primaryVariant?.barcode || (primaryVariant?.metadata?.gtin as string)
  if (primaryBarcode && primaryBarcode.trim()) {
    productSchema.gtin = primaryBarcode.trim()
  }

  if (product.categories && product.categories.length > 0) {
    productSchema.category = product.categories.map((c) => c.name).join(" > ")
  }

  if (offers.length > 0) {
    productSchema.offers = offers.length === 1 ? offers[0] : offers
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productSchema),
      }}
    />
  )
}
