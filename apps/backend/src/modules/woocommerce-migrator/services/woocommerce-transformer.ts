import { ProductStatus } from "@medusajs/framework/utils"
import { WooCategory, WooProduct, WooTag, WooVariation } from "./woocommerce-client"

export interface MedusaCategoryPayload {
  name: string
  is_active: boolean
  handle?: string
}

export interface MedusaCollectionPayload {
  title: string
  handle: string
}

export interface MedusaProductPayload {
  title: string
  handle: string
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
  metadata?: Record<string, any>
}

export class WooCommerceTransformer {
  private formatImageUrl(src: string): string {
    if (!src) return ""
    if (src.startsWith("http://localhost") || src.includes("/store/image-proxy")) {
      return src
    }
    // Respect configured backend URL or fallback to localhost:9000
    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    return `${backendUrl}/store/image-proxy?url=${encodeURIComponent(src)}`
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

  transformCategories(wooCategories: WooCategory[]): MedusaCategoryPayload[] {
    return wooCategories
      .filter((cat) => cat.name.toLowerCase() !== "uncategorized")
      .map((cat) => ({
        name: cat.name,
        is_active: true,
        handle: cat.slug,
      }))
  }

  transformTags(wooTags: WooTag[]): MedusaCollectionPayload[] {
    return wooTags.map((tag) => ({
      title: tag.name,
      handle: tag.slug,
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

    // Clean description HTML markup
    const description = this.cleanHtml(product.description || product.short_description || "")

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
          const priceAmount = variation.price
            ? Math.round(parseFloat(variation.price) * 100)
            : product.price
            ? Math.round(parseFloat(product.price) * 100)
            : 0

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

      const priceAmount = product.price
        ? Math.round(parseFloat(product.price) * 100)
        : product.regular_price
        ? Math.round(parseFloat(product.regular_price) * 100)
        : 0

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

    return {
      title: product.name,
      handle: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      status,
      weight,
      thumbnail,
      images,
      options,
      variants,
      category_ids,
      collection_id,
      metadata: {
        woo_product_id: product.id,
        woo_sku: product.sku || "",
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
