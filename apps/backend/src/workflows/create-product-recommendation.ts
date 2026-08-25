import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../modules/product-recommendation"
import ProductRecommendationModuleService from "../modules/product-recommendation/service"
import { CreateProductRecommendationInput } from "../modules/product-recommendation/types"

export const validateRecommendationStep = createStep(
  "validate-recommendation",
  async (input: CreateProductRecommendationInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Self-recommendation check
    if (input.product_id === input.recommended_product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A product cannot be recommended to itself."
      )
    }

    // 2. Validate product_id existence
    const { data: sourceProducts } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: input.product_id },
    })

    if (!sourceProducts || sourceProducts.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Source product with ID "${input.product_id}" not found.`
      )
    }

    // 3. Validate recommended_product_id existence
    const { data: targetProducts } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: input.recommended_product_id },
    })

    if (!targetProducts || targetProducts.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Recommended product with ID "${input.recommended_product_id}" not found.`
      )
    }

    return new StepResponse(input)
  }
)

export const createProductRecommendationStep = createStep(
  "create-product-recommendation",
  async (input: CreateProductRecommendationInput, { container }) => {
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )

    // Calculate auto-position if not explicitly provided
    let position = input.position
    if (position === undefined) {
      const existing = await recService.listProductRecommendations({
        product_id: input.product_id,
        type: input.type || "related",
      })
      position = existing.length
    }

    const recommendation = await (recService as any).createProductRecommendations({
      product_id: input.product_id,
      recommended_product_id: input.recommended_product_id,
      type: input.type || "related",
      priority: input.priority || 0,
      position,
      is_active: input.is_active !== undefined ? input.is_active : true,
      start_at: input.start_at || null,
      end_at: input.end_at || null,
      source: input.source || "manual",
      metadata: input.metadata || null,
    })

    return new StepResponse(recommendation, recommendation.id)
  },
  async (recommendationId: string, { container }) => {
    if (!recommendationId) return
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )
    await recService.deleteProductRecommendations([recommendationId])
  }
)

export const createProductRecommendationWorkflow = createWorkflow(
  "create-product-recommendation",
  (input: CreateProductRecommendationInput) => {
    const validatedInput = validateRecommendationStep(input)
    const recommendation = createProductRecommendationStep(validatedInput)
    return new WorkflowResponse(recommendation)
  }
)
