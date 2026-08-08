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
  images?: { url: string }[]
  options: { title: string, values: string[] }[]
  variants: {
    title: string
    sku?: string
    options: Record<string, string>
    prices: { amount: number, currency_code: string }[]
    weight?: number
    manage_inventory?: boolean
  }[]
  category_ids?: string[]
  collection_id?: string
  metadata?: Record<string, any>
}

export class WooCommerceTransformer {
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
    const images = product.images.map((img) => ({ url: img.src }))
    const weight = product.weight ? parseFloat(product.weight) : undefined
    
    const category_ids = product.categories
      .map((cat) => categoryMap.get(cat.id))
      .filter((id): id is string => id !== undefined)
      
    const collection_id = product.tags.length > 0 ? collectionMap.get(product.tags[0].id) : undefined

    const options = product.attributes.map((attr) => ({
      title: attr.name,
      values: attr.options,
    }))

    const variants: MedusaProductPayload["variants"] = []

    if (product.type === "simple") {
      const priceAmount = product.price ? Math.round(parseFloat(product.price) * 100) : 0
      
      variants.push({
        title: "Default Variant",
        sku: product.sku || undefined,
        options: { "Default Option": "Default Value" },
        prices: [{ amount: priceAmount, currency_code: currencyCode.toLowerCase() }],
        weight,
        manage_inventory: product.manage_stock,
      })
      
      if (options.length === 0) {
        options.push({ title: "Default Option", values: ["Default Value"] })
      }
    } else if (product.type === "variable") {
      for (const variation of variations) {
        const priceAmount = variation.price ? Math.round(parseFloat(variation.price) * 100) : 0
        const variantOptions: Record<string, string> = {}
        
        for (const attr of variation.attributes) {
          variantOptions[attr.name] = attr.option
        }

        variants.push({
          title: Object.values(variantOptions).join(" / ") || "Variant",
          sku: variation.sku || undefined,
          options: variantOptions,
          prices: [{ amount: priceAmount, currency_code: currencyCode.toLowerCase() }],
          weight: variation.weight ? parseFloat(variation.weight) : undefined,
          manage_inventory: variation.manage_stock,
        })
      }
    }

    return {
      title: product.name,
      handle: product.slug,
      description: product.description || product.short_description,
      status,
      weight,
      images,
      options,
      variants,
      category_ids,
      collection_id,
      metadata: {
        woo_product_id: product.id,
        woo_sku: product.sku,
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
