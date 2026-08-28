import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductReviewStep, CreateProductReviewInput } from "./steps/create-product-review"

export { CreateProductReviewInput }

export const createProductReviewWorkflow = createWorkflow(
  "create-product-review",
  (input: CreateProductReviewInput) => {
    const review = createProductReviewStep(input)
    return new WorkflowResponse(review)
  }
)
