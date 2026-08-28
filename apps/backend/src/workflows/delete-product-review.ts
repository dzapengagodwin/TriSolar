import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteProductReviewStep, DeleteProductReviewInput } from "./steps/delete-product-review"

export { DeleteProductReviewInput }

export const deleteProductReviewWorkflow = createWorkflow(
  "delete-product-review",
  (input: DeleteProductReviewInput) => {
    const result = deleteProductReviewStep(input)
    return new WorkflowResponse(result)
  }
)
