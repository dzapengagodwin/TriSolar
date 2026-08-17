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
    if (typeof val === "number") return val
    const cleaned = String(val).replace(/,/g, "").replace(/[^0-9.-]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
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
      .filter((cat) => cat.name.toLowerCase() !== "uncategorized")
      .map((cat) => ({
        name: cat.name,
        is_active: true,
        handle: this.sanitizeHandle(cat.slug || cat.name) || `cat-${cat.id}`,
        parent_category_id:
          cat.parent && cat.parent > 0
            ? categoryMap.get(cat.parent) || null
            : null,
        wc_id: cat.id,
        wc_parent_id: cat.parent || 0,
      }))
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
    collectionMap: Map<number, string>
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

    const collection_id =
      product.tags && product.tags.length > 0
        ? collectionMap.get(product.tags[0].id)
        : undefined

    // Clean description & short_description HTML markup separately
    const cleanShortDesc = this.cleanHtml(product.short_description || "")
    const cleanFullDesc = this.cleanHtml(product.description || "")

    // Keep description strictly as the full description (or fallback if empty)
    const description = cleanFullDesc || cleanShortDesc || ""

    // Store non-variation specs/attributes in metadata
    const metadataAttributes: Record<string, string[]> = {}
    if (product.attributes && product.attributes.length > 0) {
      for (const attr of product.attributes) {
        metadataAttributes[attr.name] = attr.options || []
      }
    }

    const options: MedusaProductPayload["options"] = []
    const variants: MedusaProductPayload["variants"] = []

    const isVariable =
      product.type === "variable" &&
      variations &&
      variations.length > 0

    if (isVariable) {
      const variationAttrs = (product.attributes || []).filter(
        (attr) => attr.variation || (attr.options && attr.options.length > 0)
      )

      if (variationAttrs.length > 0) {
        for (const attr of variationAttrs) {
          options.push({
            title: attr.name,
            values: attr.options && attr.options.length > 0 ? attr.options : ["Default"],
          })
        }

        for (const variation of variations) {
          const priceAmount = variation.price && variation.price !== ""
            ? this.parsePrice(variation.price)
            : this.parsePrice(product.price || product.regular_price)

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

      const priceAmount = this.parsePrice(product.price || product.regular_price)

      variants.push({
        title: "Default Variant",
        sku: product.sku || undefined,
        options: {
          "Default Option": "Default Value",
        },
        prices: [{ amount: priceAmount, currency_code: currencyCode.toLowerCase() }],
        weight,
        manage_inventory: product.manage_stock,
      })
    }

    const brand = extractBrandFromProduct({
      title: product.name,
      attributes: product.attributes,
      categories: product.categories,
      tags: product.tags,
    })

    const handle =
      this.sanitizeHandle(product.slug) ||
      this.sanitizeHandle(product.name) ||
      `product-${product.id}`

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
      collection_id,
      brand,
      metadata: {
        woo_product_id: product.id,
        woo_sku: product.sku || "",
        brand_name: brand?.name || "",
        brand_handle: brand?.handle || "",
        short_description: cleanShortDesc,
        woo_attributes: metadataAttributes,
      },
    }
  }

  transformProducts(
    products: WooProduct[],
    variationsMap: Map<number, WooVariation[]>,
    currencyCode: string,
    categoryMap: Map<number, string>,
    collectionMap: Map<number, string>
  ): MedusaProductPayload[] {
    return products.map((product) => {
      const variations = variationsMap.get(product.id) || []
      return this.transformProduct(product, variations, currencyCode, categoryMap, collectionMap)
    })
  }
}
