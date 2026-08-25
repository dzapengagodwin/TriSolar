export type RecommendationType =
  | "upsell"
  | "cross_sell"
  | "related"
  | "accessory"
  | "alternative"

export type RecommendationSource = "manual" | "rule" | "ai" | "behavioral"

export interface ProductRecommendationDTO {
  id: string
  product_id: string
  recommended_product_id: string
  type: RecommendationType
  priority: number
  position: number
  is_active: boolean
  start_at: Date | string | null
  end_at: Date | string | null
  source: RecommendationSource
  metadata: Record<string, unknown> | null
  created_at: Date | string
  updated_at: Date | string
}

export interface CreateProductRecommendationInput {
  product_id?: string
  recommended_product_id: string
  type?: RecommendationType
  priority?: number
  position?: number
  is_active?: boolean
  start_at?: Date | string | null
  end_at?: Date | string | null
  source?: RecommendationSource
  metadata?: Record<string, unknown> | null
}

export interface UpdateProductRecommendationInput {
  id: string
  type?: RecommendationType
  priority?: number
  position?: number
  is_active?: boolean
  start_at?: Date | string | null
  end_at?: Date | string | null
  source?: RecommendationSource
  metadata?: Record<string, unknown> | null
}

export interface ReorderRecommendationsInput {
  product_id: string
  type: RecommendationType
  ordered_ids: string[]
}

export interface RecommendationFilterParams {
  product_id?: string
  recommended_product_id?: string
  type?: RecommendationType
  is_active?: boolean
  source?: RecommendationSource
}
