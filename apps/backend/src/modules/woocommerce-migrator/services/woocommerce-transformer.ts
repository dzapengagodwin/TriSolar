import { ProductStatus } from "@medusajs/framework/utils"
import { WooCategory, WooProduct, WooTag, WooVariation } from "./woocommerce-client"
import {
  extractBrandFromProduct,
  NormalizedBrand,
} from "../../brand/utils/brand-normalizer"

export interface MedusaCategoryPayload {
  name: string
  is_active: boolean
  handle?: string
  parent_category_id?: string | null
  description?: string
  metadata?: Record<string, any>
  wc_id?: number
  wc_parent_id?: number
}

export interface MedusaCollectionPayload {
  title: string
  handle: string
}

export interface MedusaProductPayload {
  title: string
  handle: string
  subtitle?: string
  description?: string
  status: ProductStatus
  weight?: number
  thumbnail?: string
  images?: { url: string }[]
  options: { title: string; values: string[] }[]
  variants: {
    title: string
    sku?: string
    options: Record<string, string>
    prices: { amount: number; currency_code: string }[]
    weight?: number
    manage_inventory?: boolean
    metadata?: Record<string, any>
  }[]
  category_ids?: string[]
  collection_id?: string
  sales_channels?: { id: string }[]
  brand?: NormalizedBrand | null
  metadata?: Record<string, any>
}

export class WooCommerceTransformer {
  private formatImageUrl(src: string): string {
    return src || ""
  }

  private parsePrice(val?: string | number | null): number {
    if (val === undefined || val === null || val === "") return 0
    const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, "").replace(/[^0-9.-]/g, ""))
    if (isNaN(num)) return 0
    return Math.round(num * 100) / 100
  }

  private cleanHtml(html?: string): string {
    if (!html) return ""

    let text = html
      // Replace list items with clean bullet points
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      // Replace block tags with line breaks
      .replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      // Strip all remaining HTML tags
      .replace(/<[^>]+>/g, "")
      // Decode HTML entities
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      .replace(/&hellip;/g, "...")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8216;/g, "'")
      .replace(/&#8230;/g, "...")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&trade;/g, "")
      .replace(/&reg;/g, "")
      .replace(/&copy;/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&#8217;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Clean up multiple line breaks
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    return text
  }

  public sanitizeHandle(input?: string): string {
    if (!input) return ""

    let text = input
    try {
      text = decodeURIComponent(input)
    } catch {
      // ignore
    }

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics/accents
      .replace(/[″”"']/g, "") // remove inch / quote marks
      .replace(/²|²/g, "2")
      .replace(/³|³/g, "3")
      .replace(/[^a-z0-9]+/g, "-") // replace special chars with -
      .replace(/-{2,}/g, "-") // collapse multiple hyphens
      .replace(/^-+|-+$/g, "") // strip leading and trailing hyphens
  }

  transformCategories(
    wooCategories: WooCategory[],
    categoryMap: Map<number, string> = new Map()
  ): MedusaCategoryPayload[] {
    return wooCategories
      .filter((cat) => cat.name && cat.name.toLowerCase() !== "uncategorized")
      .map((cat) => {
        const imageUrl = cat.image?.src || null
        const cleanDesc = this.cleanHtml(cat.description || "")

        return {
          name: cat.name,
          is_active: true,
          handle: this.sanitizeHandle(cat.slug || cat.name) || `cat-${cat.id}`,
          parent_category_id:
            cat.parent && cat.parent > 0
              ? categoryMap.get(cat.parent) || null
              : null,
          description: cleanDesc || undefined,
          metadata: {
            woo_category_id: cat.id,
            woo_parent_id: cat.parent || 0,
            image_url: imageUrl,
            image_alt: cat.image?.alt || cat.name || "",
            image_name: cat.image?.name || "",
          },
          wc_id: cat.id,
          wc_parent_id: cat.parent || 0,
        }
      })
  }

  transformTags(wooTags: WooTag[]): MedusaCollectionPayload[] {
    return wooTags.map((tag) => ({
      title: tag.name,
      handle: this.sanitizeHandle(tag.slug || tag.name) || `tag-${tag.id}`,
    }))
  }

  transformProduct(
    product: WooProduct,
    variations: WooVariation[],
    currencyCode: string,
    categoryMap: Map<number, string>,
    brandImageMap: Map<string, string> = new Map()
  ): MedusaProductPayload {
    const status = product.status === "publish" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT

    const images = (product.images || []).map((img) => ({
      url: this.formatImageUrl(img.src),
    }))
    const thumbnail = images.length > 0 ? images[0].url : undefined
    const weight = product.weight ? parseFloat(product.weight) : undefined

    const category_ids = (product.categories || [])
      .map((cat) => categoryMap.get(cat.id))
      .filter((id): id is string => id !== undefined)

    // Clean description & short_description HTML markup separately
    const cleanShortDesc = this.cleanHtml(product.short_description || "")
    const cleanFullDesc = this.cleanHtml(product.description || "")

    // Keep description strictly as the full description (or fallback if empty)
    const description = cleanFullDesc || cleanShortDesc || ""

    const options: MedusaProductPayload["options"] = []
    const variants: MedusaProductPayload["variants"] = []

    const isVariable =
      product.type === "variable" &&
      variations &&
      variations.length > 0

    if (isVariable) {
      const variationAttrs = (product.attributes || []).filter(
        (attr) => attr.variation === true
      )

      if (variationAttrs.length > 0) {
        for (const attr of variationAttrs) {
          options.push({
            title: attr.name,
            values: attr.options && attr.options.length > 0 ? attr.options : ["Default"],
          })
        }

        for (const variation of variations) {
          const regularPrice = this.parsePrice(variation.regular_price)
          const salePrice = this.parsePrice(variation.sale_price)
          const effectivePrice = this.parsePrice(
            variation.price && variation.price !== ""
              ? variation.price
              : variation.regular_price || product.price || product.regular_price
          )
          const priceAmount = effectivePrice > 0 ? effectivePrice : regularPrice

          const variantOptions: Record<string, string> = {}

          for (const opt of options) {
            const matchedAttr = (variation.attributes || []).find(
              (a) => a.name.toLowerCase() === opt.title.toLowerCase()
            )
            variantOptions[opt.title] = matchedAttr?.option || opt.values[0] || "Default"
          }

          variants.push({
            title: Object.values(variantOptions).join(" / ") || "Variant",
            sku: variation.sku || undefined,
            options: variantOptions,
            prices: [{ amount: priceAmount, currency_code: currencyCode.toLowerCase() }],
            weight: variation.weight ? parseFloat(variation.weight) : weight,
            manage_inventory: variation.manage_stock,
            metadata: {
              stock_quantity: variation.stock_quantity,
              stock_status: variation.stock_status,
            },
          })
        }
      }
    }

    // Fallback for simple products or variable products without valid variation options
    if (variants.length === 0) {
      options.length = 0
      options.push({
        title: "Default Option",
        values: ["Default Value"],
      })

      const regularPrice = this.parsePrice(product.regular_price)
      const salePrice = this.parsePrice(product.sale_price)
      const effectivePrice = this.parsePrice(
        product.price && product.price !== ""
          ? product.price
          : product.regular_price
      )
      const priceAmount = effectivePrice > 0 ? effectivePrice : regularPrice

      variants.push({
        title: "Default Variant",
        sku: product.sku || undefined,
        options: {
          "Default Option": "Default Value",
        },
        prices: [{ amount: priceAmount, currency_code: currencyCode.toLowerCase() }],
        weight,
        manage_inventory: product.manage_stock,
        metadata: {
          stock_quantity: product.stock_quantity,
          stock_status: product.stock_status,
        },
      })
    }

    // Resolve brand logo: look up the brand attribute option value in the
    // brandImageMap (keyed by slug and lowercased name) fetched from WooCommerce
    // attribute terms. This is the actual brand logo, not the product image.
    const BRAND_ATTR_NAMES = ["brand", "brands", "manufacturer", "make"]
    let brandLogoFromAttr: string | null = null
    for (const attr of product.attributes || []) {
      if (BRAND_ATTR_NAMES.includes(attr.name.toLowerCase().trim())) {
        for (const option of attr.options || []) {
          const key = option.toLowerCase()
          const slugKey = key.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
          const logo = brandImageMap.get(key) || brandImageMap.get(slugKey) || null
          if (logo) {
            brandLogoFromAttr = logo
            break
          }
        }
        if (brandLogoFromAttr) break
      }
    }

    const brand = extractBrandFromProduct({
      title: product.name,
      attributes: product.attributes,
      categories: product.categories,
      tags: product.tags,
      logo: brandLogoFromAttr,
    })

    const handle =
      this.sanitizeHandle(product.slug) ||
      this.sanitizeHandle(product.name) ||
      `product-${product.id}`

    const specAttributes = (product.attributes || []).filter(
      (attr) => !attr.variation && attr.options && attr.options.length > 0
    )
    const specifications: Record<string, string[]> = {}
    for (const attr of specAttributes) {
      specifications[attr.name] = attr.options || []
    }

    const dimensions = product.dimensions ? {
      length: product.dimensions.length ? parseFloat(String(product.dimensions.length)) : undefined,
      width: product.dimensions.width ? parseFloat(String(product.dimensions.width)) : undefined,
      height: product.dimensions.height ? parseFloat(String(product.dimensions.height)) : undefined,
    } : undefined

    return {
      title: product.name,
      handle,
      subtitle: cleanShortDesc ? cleanShortDesc.slice(0, 255) : undefined,
      description,
      status,
      weight,
      thumbnail,
      images,
      options,
      variants,
      category_ids,
      brand,
      metadata: {
        woo_product_id: product.id,
        woo_sku: product.sku || "",
        woo_regular_price: product.regular_price || null,
        woo_sale_price: product.sale_price || null,
        brand_name: brand?.name || "",
        brand_handle: brand?.handle || "",
        short_description: cleanShortDesc,
        woo_tags: (product.tags || []).map((t) => t.name),
        specifications,
        dimensions,
      },
    }
  }

  transformProducts(
    products: WooProduct[],
    variationsMap: Map<number, WooVariation[]>,
    currencyCode: string,
    categoryMap: Map<number, string>,
    brandImageMap: Map<string, string> = new Map()
  ): MedusaProductPayload[] {
    return products.map((product) => {
      const variations = variationsMap.get(product.id) || []
      return this.transformProduct(product, variations, currencyCode, categoryMap, brandImageMap)
    })
  }
}

