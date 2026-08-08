import { MedusaError } from "@medusajs/framework/utils"

export interface WooImage {
  id: number
  src: string
  name: string
  alt: string
}

export interface WooAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface WooProductDimensions {
  length: string
  width: string
  height: string
}

export interface WooCategory {
  id: number
  name: string
  slug: string
}

export interface WooTag {
  id: number
  name: string
  slug: string
}

export interface WooVariation {
  id: number
  sku: string
  price: string
  regular_price: string
  sale_price: string
  attributes: {
    id: number
    name: string
    option: string
  }[]
  image?: WooImage
  stock_quantity: number | null
  stock_status: "instock" | "outofstock" | "onbackorder"
  manage_stock: boolean
  weight: string
  dimensions: WooProductDimensions
}

export interface WooProduct {
  id: number
  name: string
  slug: string
  type: "simple" | "variable" | "grouped" | "external"
  status: "publish" | "draft" | "pending" | "private"
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  categories: { id: number, name: string, slug: string }[]
  tags: { id: number, name: string, slug: string }[]
  images: WooImage[]
  attributes: WooAttribute[]
  weight: string
  dimensions: WooProductDimensions
  stock_quantity: number | null
  stock_status: "instock" | "outofstock" | "onbackorder"
  manage_stock: boolean
  variations: number[]
}

export class WooCommerceClient {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string

  constructor(baseUrl: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.consumerKey = consumerKey
    this.consumerSecret = consumerSecret
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64")
  }

  private async fetchAll<T>(endpoint: string): Promise<T[]> {
    let page = 1
    const allData: T[] = []
    
    while (true) {
      const url = new URL(`${this.baseUrl}/wp-json/wc/v3/${endpoint}`)
      url.searchParams.append("per_page", "100")
      url.searchParams.append("page", page.toString())

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: this.getAuthHeader()
        }
      })

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to fetch ${endpoint}: ${response.statusText}`
        )
      }

      const data = await response.json() as T[]
      if (!data || data.length === 0) {
        break
      }

      allData.push(...data)
      page++
    }

    return allData
  }

  async testConnection(): Promise<{ success: boolean, storeName?: string, error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wc/v3`, {
        headers: {
          Authorization: this.getAuthHeader()
        }
      })

      if (!response.ok) {
        return { success: false, error: response.statusText }
      }

      const data = await response.json()
      return { success: true, storeName: data.name }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async fetchAllProducts(): Promise<WooProduct[]> {
    return this.fetchAll<WooProduct>("products")
  }

  async fetchAllCategories(): Promise<WooCategory[]> {
    return this.fetchAll<WooCategory>("products/categories")
  }

  async fetchAllTags(): Promise<WooTag[]> {
    return this.fetchAll<WooTag>("products/tags")
  }

  async fetchProductVariations(productId: number): Promise<WooVariation[]> {
    return this.fetchAll<WooVariation>(`products/${productId}/variations`)
  }
}
