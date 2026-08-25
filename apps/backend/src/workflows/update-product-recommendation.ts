import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../modules/product-recommendation"
import ProductRecommendationModuleService from "../modules/product-recommendation/service"
import { UpdateProductRecommendationInput } from "../modules/product-recommendation/types"

export const updateProductRecommendationStep = createStep(
  "update-product-recommendation",
  async (input: UpdateProductRecommendationInput, { container }) => {
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )

    const prevRec = await recService
      .retrieveProductRecommendation(input.id)
      .catch(() => null)

    if (!prevRec) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Recommendation with ID "${input.id}" not found.`
      )
    }

    const updatePayload: any = { id: input.id }
    if (input.type !== undefined) updatePayload.type = input.type
    if (input.priority !== undefined) updatePayload.priority = input.priority
    if (input.position !== undefined) updatePayload.position = input.position
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active
    if (input.start_at !== undefined) updatePayload.start_at = input.start_at
    if (input.end_at !== undefined) updatePayload.end_at = input.end_at
    if (input.source !== undefined) updatePayload.source = input.source
    if (input.metadata !== undefined) updatePayload.metadata = input.metadata

    const updated = await recService.updateProductRecommendations([
      updatePayload,
    ])

    return new StepResponse(updated[0], prevRec)
  },
  async (prevRec: any, { container }) => {
    if (!prevRec) return
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )
    await recService.updateProductRecommendations([prevRec])
  }
)

export const updateProductRecommendationWorkflow = createWorkflow(
  "update-product-recommendation",
  (input: UpdateProductRecommendationInput) => {
    const recommendation = updateProductRecommendationStep(input)
    return new WorkflowResponse(recommendation)
  }
)
