import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type DeleteProductReviewInput = {
  reviewId: string
}

export const deleteProductReviewStep = createStep(
  "delete-product-review",
  async ({ reviewId }: DeleteProductReviewInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)

    const [existing] = await reviewModuleService.listReviews({ id: reviewId })

    await reviewModuleService.deleteReviews(reviewId)

    return new StepResponse({ deleted: true, id: reviewId }, existing)
  },
  async (existing, { container }) => {
    if (!existing) return
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)
    await reviewModuleService.createReviews(existing)
  }
)
