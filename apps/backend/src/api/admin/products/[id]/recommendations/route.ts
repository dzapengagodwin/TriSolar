import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../../../../../modules/product-recommendation"
import ProductRecommendationModuleService from "../../../../../modules/product-recommendation/service"
import { createProductRecommendationWorkflow } from "../../../../../workflows/create-product-recommendation"
import { RecommendationType, RecommendationSource } from "../../../../../modules/product-recommendation/types"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const limit = Math.max(1, Number(req.query.limit) || 50)
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const type = req.query.type as RecommendationType | undefined
  const isActive =
    req.query.is_active !== undefined
      ? req.query.is_active === "true"
      : undefined

  const filters: any = { product_id: id }
  if (type) filters.type = type
  if (isActive !== undefined) filters.is_active = isActive

  const [recommendations, count] =
    await recService.listAndCountProductRecommendations(filters, {
      order: { priority: "DESC", position: "ASC", created_at: "ASC" },
      take: limit,
      skip: offset,
    })

  // Enrich recommendations with target product details using Medusa Query Graph
  const targetProductIds = recommendations.map((r: any) => r.recommended_product_id)
  let productsMap = new Map<string, any>()

  if (targetProductIds.length > 0) {
    const { data: targetProducts } = await query.graph({
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
      filters: {
        id: targetProductIds,
      },
    })
    productsMap = new Map(targetProducts.map((p: any) => [p.id, p]))
  }

  const enriched = recommendations.map((rec: any) => ({
    ...rec,
    recommended_product: productsMap.get(rec.recommended_product_id) || null,
  }))

  return res.status(200).json({
    recommendations: enriched,
    count,
    offset,
    limit,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const {
    recommended_product_id,
    type,
    priority,
    position,
    is_active,
    start_at,
    end_at,
    source,
    metadata,
  } = req.body as {
    recommended_product_id: string
    type?: RecommendationType
    priority?: number
    position?: number
    is_active?: boolean
    start_at?: string | null
    end_at?: string | null
    source?: RecommendationSource
    metadata?: Record<string, unknown> | null
  }

  if (!recommended_product_id) {
    return res.status(400).json({
      message: "recommended_product_id is required",
    })
  }

  if (id === recommended_product_id) {
    return res.status(400).json({
      message: "A product cannot be recommended to itself",
    })
  }

  try {
    const { result: recommendation } =
      await createProductRecommendationWorkflow(req.scope).run({
        input: {
          product_id: id,
          recommended_product_id,
          type: type || "related",
          priority: priority ?? 0,
          position,
          is_active: is_active ?? true,
          start_at: start_at ? new Date(start_at) : null,
          end_at: end_at ? new Date(end_at) : null,
          source: source || "manual",
          metadata: metadata || null,
        },
      })

    return res.status(201).json({ recommendation })
  } catch (error: any) {
    const isConflict =
      error.message?.includes("unique") ||
      error.message?.includes("duplicate") ||
      error.code === "23505"

    if (isConflict) {
      return res.status(409).json({
        message: `This product is already configured as a ${type || "related"} recommendation for this product.`,
      })
    }

    return res.status(error.status || 500).json({
      message: error.message || "Failed to create product recommendation",
    })
  }
}
