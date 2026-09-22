import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductReviewStep, UpdateProductReviewInput } from "./steps/update-product-review"

export { UpdateProductReviewInput }

export const updateProductReviewWorkflow = createWorkflow(
  "update-product-review",
  (input: UpdateProductReviewInput) => {
    const review = updateProductReviewStep(input)
    return new WorkflowResponse(review)
  }
)

