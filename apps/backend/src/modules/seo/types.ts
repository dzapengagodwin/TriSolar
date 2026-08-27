export type SeoMetadataDTO = {
  id: string
  entity_type: string
  entity_id: string
  meta_title?: string | null
  meta_description?: string | null
  focus_keyphrase?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  robots_index: boolean
  robots_follow: boolean
  metadata?: Record<string, unknown> | null
  created_at: string | Date
  updated_at: string | Date
}

export type UpsertSeoMetadataInput = {
  meta_title?: string | null
  meta_description?: string | null
  focus_keyphrase?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  robots_index?: boolean
  robots_follow?: boolean
  metadata?: Record<string, unknown> | null
}

export type SeoCheckCategory = "critical" | "quality" | "ecommerce" | "technical"
export type SeoCheckStatus = "pass" | "warn" | "fail"

export type SeoCheck = {
  id: string
  title: string
  category: SeoCheckCategory
  status: SeoCheckStatus
  score: number
  maxScore: number
  message: string
  recommendation?: string
}

export type SeoAnalysisResult = {
  score: number // 0 to 100
  status: "good" | "ok" | "poor"
  criticalCount: number
  warningCount: number
  passCount: number
  checks: SeoCheck[]
}

export type ProductSeoAnalysisInput = {
  product: {
    id: string
    title?: string | null
    subtitle?: string | null
    description?: string | null
    handle?: string | null
    thumbnail?: string | null
    images?: Array<{ url: string }> | null
    brand?: { name?: string | null } | null
    metadata?: Record<string, unknown> | null
    variants?: Array<{
      id: string
      sku?: string | null
      barcode?: string | null
      calculated_price?: Record<string, unknown> | null
      prices?: Array<{ amount?: number; currency_code?: string }> | null
      inventory_quantity?: number | null
      manage_inventory?: boolean
      allow_backorder?: boolean
    }> | null
  }
  seo?: Partial<UpsertSeoMetadataInput> | null
  storefrontUrl?: string
  countryCode?: string
}
