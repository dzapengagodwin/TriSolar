import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../../../../../../modules/product-recommendation"
import ProductRecommendationModuleService from "../../../../../../modules/product-recommendation/service"
import { updateProductRecommendationWorkflow } from "../../../../../../workflows/update-product-recommendation"
import { deleteProductRecommendationWorkflow } from "../../../../../../workflows/delete-product-recommendation"
import { RecommendationType, RecommendationSource } from "../../../../../../modules/product-recommendation/types"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, rec_id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const rec = await recService
    .retrieveProductRecommendation(rec_id)
    .catch(() => null)

  if (!rec || rec.product_id !== id) {
    return res
      .status(404)
      .json({ message: `Recommendation with ID "${rec_id}" not found for product "${id}".` })
  }

  // Enrich with recommended product
  let recommendedProduct: any = null
  if (rec.recommended_product_id) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "collection.id",
        "collection.title",
        "categories.id",
        "categories.name",
      ],
      filters: { id: rec.recommended_product_id },
    })
    recommendedProduct = products?.[0] || null
  }

  return res.status(200).json({
    recommendation: {
      ...rec,
      recommended_product: recommendedProduct,
    },
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, rec_id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )

  const existing = await recService
    .retrieveProductRecommendation(rec_id)
    .catch(() => null)

  if (!existing || existing.product_id !== id) {
    return res
      .status(404)
      .json({ message: `Recommendation with ID "${rec_id}" not found for product "${id}".` })
  }

  const {
    type,
    priority,
    position,
    is_active,
    start_at,
    end_at,
    source,
    metadata,
  } = req.body as {
    type?: RecommendationType
    priority?: number
    position?: number
    is_active?: boolean
    start_at?: string | null
    end_at?: string | null
    source?: RecommendationSource
    metadata?: Record<string, unknown> | null
  }

  try {
    const { result: recommendation } =
      await updateProductRecommendationWorkflow(req.scope).run({
        input: {
          id: rec_id,
          type,
          priority,
          position,
          is_active,
          start_at: start_at !== undefined ? (start_at ? new Date(start_at) : null) : undefined,
          end_at: end_at !== undefined ? (end_at ? new Date(end_at) : null) : undefined,
          source,
          metadata,
        },
      })

    return res.status(200).json({ recommendation })
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Failed to update product recommendation",
    })
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, rec_id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )

  const existing = await recService
    .retrieveProductRecommendation(rec_id)
    .catch(() => null)

  if (!existing || existing.product_id !== id) {
    return res
      .status(404)
      .json({ message: `Recommendation with ID "${rec_id}" not found for product "${id}".` })
  }

  const { result } = await deleteProductRecommendationWorkflow(req.scope).run({
    input: {
      id: rec_id,
    },
  })

  return res.status(200).json({
    id: result.id,
    object: "product_recommendation",
    deleted: true,
  })
}
