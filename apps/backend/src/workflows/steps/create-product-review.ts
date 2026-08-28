import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type CreateProductReviewInput = {
  product_id: string
  customer_id: string
  order_id: string
  rating: number
  title?: string | null
  content: string
  first_name: string
  last_name: string
  status?: "pending" | "approved" | "rejected"
}

export const createProductReviewStep = createStep(
  "create-product-review",
  async (input: CreateProductReviewInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)

    const review = await reviewModuleService.createReviews(input)

    return new StepResponse(review, review.id)
  },
  async (reviewId: string, { container }) => {
    if (!reviewId) return
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)
    await reviewModuleService.deleteReviews(reviewId)
  }
)
