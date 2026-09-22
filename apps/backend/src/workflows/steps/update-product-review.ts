import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type UpdateProductReviewInput = {
  id: string
  status?: "pending" | "approved" | "rejected"
  title?: string | null
  content?: string
  rating?: number
}

export const updateProductReviewStep = createStep(
  "update-product-review",
  async (input: UpdateProductReviewInput, { container }) => {
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)

    const [existing] = await reviewModuleService.listReviews({ id: input.id })

    const { id, ...data } = input
    const [updated] = await reviewModuleService.updateReviews([
      {
        id,
        ...data,
      },
    ])

    return new StepResponse(updated, existing)
  },
  async (existing, { container }) => {
    if (!existing) return
    const reviewModuleService: ProductReviewModuleService =
      container.resolve(PRODUCT_REVIEW_MODULE)
    await reviewModuleService.updateReviews([
      {
        id: existing.id,
        status: existing.status,
        title: existing.title,
        content: existing.content,
        rating: existing.rating,
      },
    ])
  }
)

