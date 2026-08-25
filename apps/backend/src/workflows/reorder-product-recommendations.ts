import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_RECOMMENDATION_MODULE } from "../modules/product-recommendation"
import ProductRecommendationModuleService from "../modules/product-recommendation/service"
import { ReorderRecommendationsInput } from "../modules/product-recommendation/types"

export const reorderProductRecommendationsStep = createStep(
  "reorder-product-recommendations",
  async (input: ReorderRecommendationsInput, { container }) => {
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )

    // Capture previous positions for rollback
    const existingRecs = await recService.listProductRecommendations({
      id: input.ordered_ids,
    })

    const previousPositions = existingRecs.map((r: any) => ({
      id: r.id,
      position: r.position,
    }))

    const updatedRecs = await recService.reorderRecommendations(
      input.product_id,
      input.type,
      input.ordered_ids
    )

    return new StepResponse(updatedRecs, previousPositions)
  },
  async (previousPositions: Array<{ id: string; position: number }>, { container }) => {
    if (!previousPositions || !previousPositions.length) return
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )
    await recService.updateProductRecommendations(previousPositions)
  }
)

export const reorderProductRecommendationsWorkflow = createWorkflow(
  "reorder-product-recommendations",
  (input: ReorderRecommendationsInput) => {
    const recommendations = reorderProductRecommendationsStep(input)
    return new WorkflowResponse(recommendations)
  }
)
