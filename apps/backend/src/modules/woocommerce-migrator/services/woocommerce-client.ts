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
  parent?: number
  description?: string
  image?: WooImage | null
  count?: number
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
  categories: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string }[]
  images: WooImage[]
  attributes: WooAttribute[]
  weight: string
  dimensions: WooProductDimensions
  stock_quantity: number | null
  stock_status: "instock" | "outofstock" | "onbackorder"
  manage_stock: boolean
  variations: number[]
}

/** A global product attribute registered in WooCommerce (e.g. "Brand", "Color") */
export interface WooGlobalAttribute {
  id: number
  name: string
  slug: string
  type: string
  order_by: string
  has_archives: boolean
}

/** A single term of a global product attribute, which may carry a logo image */
export interface WooAttributeTerm {
  id: number
  name: string
  slug: string
  description: string
  menu_order: number
  count: number
  image?: {
    id: number
    src: string
    name: string
    alt: string
  } | null
}

export class WooCommerceClient {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string

  constructor(baseUrl: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.consumerKey = consumerKey.trim()
    this.consumerSecret = consumerSecret.trim()
  }

  private getAuthHeader(): string {
    return "Basic " + Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64")
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: this.getAuthHeader(),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
    }
  }

  private appendAuthQueryParams(url: URL): void {
    if (this.consumerKey && !url.searchParams.has("consumer_key")) {
      url.searchParams.append("consumer_key", this.consumerKey)
    }
    if (this.consumerSecret && !url.searchParams.has("consumer_secret")) {
      url.searchParams.append("consumer_secret", this.consumerSecret)
    }
  }

  private async fetchAll<T>(endpoint: string): Promise<T[]> {
    let page = 1
    const allData: T[] = []

    while (true) {
      const url = new URL(`${this.baseUrl}/wp-json/wc/v3/${endpoint}`)
      url.searchParams.append("per_page", "100")
      url.searchParams.append("page", page.toString())
      this.appendAuthQueryParams(url)

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const text = await response.text()
        if (response.status === 403 || text.includes("Just a moment") || text.includes("Cloudflare")) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Cloudflare / WAF security protection is blocking REST API requests. Allow /wp-json/ in Cloudflare WAF or toggle 'Use JSON file upload'."
          )
        }

        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to fetch ${endpoint} (${response.status} ${response.statusText})`
        )
      }

      const data = (await response.json()) as T[]
      if (!data || data.length === 0) {
        break
      }

      allData.push(...data)
      page++
    }

    return allData
  }

  async testConnection(): Promise<{ success: boolean; storeName?: string; error?: string }> {
    try {
      const url = new URL(`${this.baseUrl}/wp-json/wc/v3/products`)
      url.searchParams.append("per_page", "1")
      this.appendAuthQueryParams(url)

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const text = await response.text()
        if (response.status === 403 || text.includes("Just a moment") || text.includes("Cloudflare")) {
          return {
            success: false,
            error: "Cloudflare firewall is blocking automated API calls. Bypass /wp-json/ in Cloudflare or use JSON Upload mode.",
          }
        }
        return { success: false, error: `${response.status} ${response.statusText}` }
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        return { success: true, storeName: this.baseUrl }
      }

      return { success: true, storeName: data.name || this.baseUrl }
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

  /**
   * Fetches all global product attributes registered in WooCommerce.
   * Used to locate the brand/manufacturer attribute by name.
   */
  async fetchAllGlobalAttributes(): Promise<WooGlobalAttribute[]> {
    return this.fetchAll<WooGlobalAttribute>("products/attributes")
  }

  /**
   * Fetches all terms for a specific attribute (e.g. all brands with their logos).
   */
  async fetchAttributeTerms(attributeId: number): Promise<WooAttributeTerm[]> {
    return this.fetchAll<WooAttributeTerm>(`products/attributes/${attributeId}/terms`)
  }

  /**
   * Finds the brand attribute in WooCommerce and returns a map of
   * brand slug → logo image URL for every term that has an image set.
   * Returns an empty map if the brand attribute does not exist or has no images.
   */
  async fetchBrandTermImages(): Promise<Map<string, string>> {
    const brandImageMap = new Map<string, string>()

    try {
      const attributes = await this.fetchAllGlobalAttributes()

      // Match the brand attribute by common names / slugs
      const BRAND_ATTR_NAMES = ["brand", "brands", "manufacturer", "make", "pa_brand", "pa_brands", "pa_manufacturer"]
      const brandAttr = attributes.find((a) =>
        BRAND_ATTR_NAMES.includes(a.name.toLowerCase().trim()) ||
        BRAND_ATTR_NAMES.includes(a.slug.toLowerCase().trim())
      )

      if (!brandAttr) {
        return brandImageMap
      }

      const terms = await this.fetchAttributeTerms(brandAttr.id)

      for (const term of terms) {
        if (term.image?.src) {
          // Index by both slug and lowercased name so lookups are flexible
          brandImageMap.set(term.slug, term.image.src)
          brandImageMap.set(term.name.toLowerCase(), term.image.src)
        }
      }
    } catch {
      // Non-fatal — brand images are best-effort
    }

    return brandImageMap
  }
}

