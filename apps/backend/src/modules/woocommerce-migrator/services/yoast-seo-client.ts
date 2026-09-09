import { MedusaError } from "@medusajs/framework/utils"

// -------------------------------------------------------------------
// Types returned from the WordPress REST API with Yoast SEO active
// -------------------------------------------------------------------

export interface YoastRobots {
  index?: "index" | "noindex"
  follow?: "follow" | "nofollow"
  "max-snippet"?: string
  "max-image-preview"?: string
  "max-video-preview"?: string
}

export interface YoastOgImage {
  url: string
  width?: number
  height?: number
  type?: string
}

export interface YoastHeadJson {
  title?: string
  description?: string
  robots?: YoastRobots
  canonical?: string
  og_locale?: string
  og_type?: string
  og_title?: string
  og_description?: string
  og_url?: string
  og_site_name?: string
  og_image?: YoastOgImage[]
  twitter_card?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  schema?: unknown
}

export interface WpRestProduct {
  id: number
  slug: string
  name: string
  type?: string
  status?: string
  yoast_head_json?: YoastHeadJson
  meta_data?: { key: string; value: unknown }[]
}

export interface WpRestPage {
  id: number
  slug: string
  title: { rendered: string }
  link: string
  status?: string
  yoast_head_json?: YoastHeadJson
}

export interface WpRestCategory {
  id: number
  slug: string
  name: string
  description?: string
  yoast_head_json?: YoastHeadJson
}

export interface WpRestBrand {
  id: number
  slug: string
  name: string
  description?: string
  yoast_head_json?: YoastHeadJson
}

// -------------------------------------------------------------------
// Normalized record emitted for each matched entity
// -------------------------------------------------------------------
export interface YoastSeoRecord {
  entitySlug: string
  entityTitle: string
  entityType: "product" | "category" | "brand" | "page"
  yoast: YoastHeadJson
  wpId: number
}

// -------------------------------------------------------------------
// YoastSeoClient
// Fetches Yoast SEO data from the WordPress REST API.
// Uses the same WooCommerce consumer key/secret for auth.
// Yoast SEO (free) automatically exposes `yoast_head_json` on every
// /wp-json/wp/v2/* and /wp-json/wc/v3/* endpoint without any plugin.
// -------------------------------------------------------------------
export class YoastSeoClient {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string

  constructor(baseUrl: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "")
    this.consumerKey = consumerKey.trim()
    this.consumerSecret = consumerSecret.trim()
  }

  private getAuthHeader(): string {
    return (
      "Basic " +
      Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString(
        "base64"
      )
    )
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: this.getAuthHeader(),
      "User-Agent":
        "Mozilla/5.0 (compatible; LaptopZone-SEO-Migrator/1.0)",
      Accept: "application/json",
    }
  }

  private appendAuth(url: URL): void {
    if (!url.searchParams.has("consumer_key")) {
      url.searchParams.set("consumer_key", this.consumerKey)
    }
    if (!url.searchParams.has("consumer_secret")) {
      url.searchParams.set("consumer_secret", this.consumerSecret)
    }
  }

  private async fetchAllWcV3<T>(
    endpoint: string,
    extra?: Record<string, string>
  ): Promise<T[]> {
    const all: T[] = []
    let page = 1

    while (true) {
      const url = new URL(`${this.baseUrl}/wp-json/wc/v3/${endpoint}`)
      url.searchParams.set("per_page", "100")
      url.searchParams.set("page", String(page))
      if (extra) {
        for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v)
      }
      this.appendAuth(url)

      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 25000)
      try {
        const res = await fetch(url.toString(), {
          headers: this.getHeaders(),
          signal: ctrl.signal,
        })
        if (!res.ok) break
        const data = (await res.json()) as T[]
        if (!Array.isArray(data) || data.length === 0) break
        all.push(...data)
        page++
      } catch {
        break
      } finally {
        clearTimeout(timer)
      }
    }

    return all
  }

  private async fetchAllWpV2<T>(
    endpoint: string,
    extra?: Record<string, string>
  ): Promise<T[]> {
    const all: T[] = []
    let page = 1

    while (true) {
      const url = new URL(`${this.baseUrl}/wp-json/wp/v2/${endpoint}`)
      url.searchParams.set("per_page", "100")
      url.searchParams.set("page", String(page))
      // Request Yoast head JSON explicitly
      url.searchParams.set("_fields", "id,slug,name,title,link,status,yoast_head_json,description")
      if (extra) {
        for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v)
      }
      this.appendAuth(url)

      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 25000)
      try {
        const res = await fetch(url.toString(), {
          headers: this.getHeaders(),
          signal: ctrl.signal,
        })
        if (!res.ok) break
        const data = (await res.json()) as T[]
        if (!Array.isArray(data) || data.length === 0) break
        all.push(...data)
        page++
      } catch {
        break
      } finally {
        clearTimeout(timer)
      }
    }

    return all
  }

  /**
   * Test that the WP site is reachable and Yoast fields are present
   */
  async testConnection(): Promise<{ success: boolean; yoastDetected: boolean; error?: string }> {
    try {
      const url = new URL(`${this.baseUrl}/wp-json/wc/v3/products`)
      url.searchParams.set("per_page", "1")
      url.searchParams.set("_fields", "id,slug,yoast_head_json")
      this.appendAuth(url)

      const ctrl = new AbortController()
      setTimeout(() => ctrl.abort(), 10000)
      const res = await fetch(url.toString(), { headers: this.getHeaders() })

      if (!res.ok) {
        const body = await res.text()
        if (res.status === 403 || body.includes("Just a moment") || body.includes("Cloudflare")) {
          return {
            success: false,
            yoastDetected: false,
            error: "Cloudflare WAF is blocking REST API requests. Allow /wp-json/ in your Cloudflare firewall rules.",
          }
        }
        return { success: false, yoastDetected: false, error: `${res.status} ${res.statusText}` }
      }

      const data = (await res.json()) as any[]
      const yoastDetected =
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0]?.yoast_head_json === "object" &&
        data[0]?.yoast_head_json !== null

      return { success: true, yoastDetected }
    } catch (err: any) {
      return { success: false, yoastDetected: false, error: err.message }
    }
  }

  /**
   * Fetch Yoast SEO data for all WooCommerce products
   */
  async fetchProductSeoRecords(): Promise<YoastSeoRecord[]> {
    const items = await this.fetchAllWcV3<WpRestProduct>("products", {
      status: "publish",
      _fields: "id,slug,name,status,yoast_head_json",
    })

    return items
      .filter((p) => p.yoast_head_json && typeof p.yoast_head_json === "object")
      .map((p) => ({
        entitySlug: p.slug,
        entityTitle: p.name,
        entityType: "product" as const,
        yoast: p.yoast_head_json!,
        wpId: p.id,
      }))
  }

  /**
   * Fetch Yoast SEO data for all WooCommerce product categories
   */
  async fetchCategorySeoRecords(): Promise<YoastSeoRecord[]> {
    const items = await this.fetchAllWcV3<WpRestCategory>("products/categories", {
      hide_empty: "false",
      _fields: "id,slug,name,description,yoast_head_json",
    })

    return items
      .filter((c) => c.yoast_head_json && typeof c.yoast_head_json === "object")
      .map((c) => ({
        entitySlug: c.slug,
        entityTitle: c.name,
        entityType: "category" as const,
        yoast: c.yoast_head_json!,
        wpId: c.id,
      }))
  }

  /**
   * Fetch Yoast SEO data for WooCommerce brands
   * Tries the /wc/v3/brands endpoint (YITH / WooCommerce Brands plugins),
   * then falls back to product attribute terms (pa_brand).
   */
  async fetchBrandSeoRecords(): Promise<YoastSeoRecord[]> {
    // Strategy 1: dedicated brands taxonomy endpoint
    try {
      const brands = await this.fetchAllWcV3<WpRestBrand>("brands", {
        _fields: "id,slug,name,description,yoast_head_json",
      })
      if (brands.length > 0) {
        return brands
          .filter((b) => b.yoast_head_json && typeof b.yoast_head_json === "object")
          .map((b) => ({
            entitySlug: b.slug,
            entityTitle: b.name,
            entityType: "brand" as const,
            yoast: b.yoast_head_json!,
            wpId: b.id,
          }))
      }
    } catch {
      // Non-fatal — fall through to attribute terms
    }

    // Strategy 2: global attribute terms (pa_brand)
    try {
      const attributes = await this.fetchAllWcV3<any>("products/attributes")
      const BRAND_SLUGS = ["brand", "brands", "manufacturer", "make", "pa_brand", "pa_brands"]
      const brandAttr = attributes.find((a: any) =>
        BRAND_SLUGS.includes(a.slug?.toLowerCase()) ||
        BRAND_SLUGS.includes(a.name?.toLowerCase())
      )
      if (brandAttr) {
        const terms = await this.fetchAllWcV3<WpRestBrand>(
          `products/attributes/${brandAttr.id}/terms`,
          { _fields: "id,slug,name,yoast_head_json" }
        )
        return terms
          .filter((t) => t.yoast_head_json && typeof t.yoast_head_json === "object")
          .map((t) => ({
            entitySlug: t.slug,
            entityTitle: t.name,
            entityType: "brand" as const,
            yoast: t.yoast_head_json!,
            wpId: t.id,
          }))
      }
    } catch {
      // Non-fatal
    }

    return []
  }

  /**
   * Fetch Yoast SEO data for all WordPress static pages
   */
  async fetchPageSeoRecords(): Promise<YoastSeoRecord[]> {
    const items = await this.fetchAllWpV2<WpRestPage>("pages", {
      status: "publish",
    })

    return items
      .filter((p) => p.yoast_head_json && typeof p.yoast_head_json === "object")
      .map((p) => ({
        entitySlug: p.slug,
        entityTitle:
          typeof p.title === "object" ? (p as any).title.rendered || p.slug : p.slug,
        entityType: "page" as const,
        yoast: p.yoast_head_json!,
        wpId: p.id,
      }))
  }
}
