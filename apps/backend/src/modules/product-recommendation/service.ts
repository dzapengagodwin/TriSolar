import { MedusaService, MedusaError } from "@medusajs/framework/utils"
import ProductRecommendation from "./models/product-recommendation"
import {
  CreateProductRecommendationInput,
  RecommendationType,
} from "./types"

class ProductRecommendationModuleService extends MedusaService({
  ProductRecommendation,
}) {
  /**
   * Validate that product is not being recommended to itself
   */
  async validateNoSelfRecommendation(
    productId: string,
    recommendedProductId: string
  ): Promise<void> {
    if (productId === recommendedProductId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A product cannot be recommended to itself."
      )
    }
  }

  /**
   * Reorder recommendations for a specific product and type
   */
  async reorderRecommendations(
    productId: string,
    type: RecommendationType,
    orderedIds: string[]
  ): Promise<any[]> {
    if (!orderedIds || !orderedIds.length) {
      return []
    }

    const recommendations = await this.listProductRecommendations({
      id: orderedIds,
      product_id: productId,
      type,
    })

    const recMap = new Map(recommendations.map((r: any) => [r.id, r]))

    const updates: Array<{ id: string; position: number }> = []

    orderedIds.forEach((id, index) => {
      if (recMap.has(id)) {
        updates.push({
          id,
          position: index,
        })
      }
    })

    if (updates.length > 0) {
      await this.updateProductRecommendations(updates)
    }

    return this.listProductRecommendations(
      {
        product_id: productId,
        type,
      },
      {
        order: { position: "ASC", priority: "DESC" },
      }
    )
  }

  /**
   * List only active recommendations within valid scheduling windows (start_at <= now <= end_at)
   */
  async listActiveRecommendations(
    productId: string,
    type?: RecommendationType,
    options: { limit?: number; offset?: number } = {}
  ): Promise<any[]> {
    const filters: any = {
      product_id: productId,
      is_active: true,
    }

    if (type) {
      filters.type = type
    }

    const recommendations = await this.listProductRecommendations(filters, {
      order: { priority: "DESC", position: "ASC", created_at: "ASC" },
      take: options.limit || 50,
      skip: options.offset || 0,
    })

    const now = new Date()

    return recommendations.filter((rec: any) => {
      if (rec.start_at && new Date(rec.start_at) > now) {
        return false
      }
      if (rec.end_at && new Date(rec.end_at) < now) {
        return false
      }
      return true
    })
  }

  /**
   * Create or update batch recommendations with validation
   */
  async batchAssignRecommendations(
    productId: string,
    items: CreateProductRecommendationInput[]
  ): Promise<any[]> {
    const results: any[] = []

    for (const item of items) {
      await this.validateNoSelfRecommendation(
        productId,
        item.recommended_product_id
      )

      const existing = await this.listProductRecommendations({
        product_id: productId,
        recommended_product_id: item.recommended_product_id,
        type: item.type || "related",
      })

      if (existing && existing.length > 0) {
        const updated = await (this as any).updateProductRecommendations([
          {
            id: existing[0].id,
            priority:
              item.priority !== undefined
                ? item.priority
                : existing[0].priority,
            position:
              item.position !== undefined
                ? item.position
                : existing[0].position,
            is_active:
              item.is_active !== undefined
                ? item.is_active
                : existing[0].is_active,
            start_at:
              item.start_at !== undefined ? item.start_at : existing[0].start_at,
            end_at:
              item.end_at !== undefined ? item.end_at : existing[0].end_at,
            source: item.source || existing[0].source,
            metadata:
              item.metadata !== undefined
                ? item.metadata
                : existing[0].metadata,
          },
        ])
        results.push(updated[0])
      } else {
        const created = await (this as any).createProductRecommendations({
          product_id: productId,
          recommended_product_id: item.recommended_product_id,
          type: item.type || "related",
          priority: item.priority || 0,
          position: item.position || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
          start_at: item.start_at || null,
          end_at: item.end_at || null,
          source: item.source || "manual",
          metadata: item.metadata || null,
        })
        results.push(created)
      }
    }

    return results
  }
}

export default ProductRecommendationModuleService
