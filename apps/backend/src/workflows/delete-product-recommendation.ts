import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../modules/product-recommendation"
import ProductRecommendationModuleService from "../modules/product-recommendation/service"

export type DeleteProductRecommendationInput = {
  id: string
}

export const deleteProductRecommendationStep = createStep(
  "delete-product-recommendation",
  async (input: DeleteProductRecommendationInput, { container }) => {
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

    await recService.deleteProductRecommendations([input.id])

    return new StepResponse({ id: input.id }, prevRec)
  },
  async (prevRec: any, { container }) => {
    if (!prevRec) return
    const recService: ProductRecommendationModuleService = container.resolve(
      PRODUCT_RECOMMENDATION_MODULE
    )
    await recService.createProductRecommendations(prevRec)
  }
)

export const deleteProductRecommendationWorkflow = createWorkflow(
  "delete-product-recommendation",
  (input: DeleteProductRecommendationInput) => {
    const deleted = deleteProductRecommendationStep(input)
    return new WorkflowResponse(deleted)
  }
)
