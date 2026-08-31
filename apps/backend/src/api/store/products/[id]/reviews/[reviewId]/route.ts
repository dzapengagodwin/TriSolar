import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../../modules/product-review/service"
import { deleteProductReviewWorkflow } from "../../../../../../workflows/delete-product-review"

// DELETE /store/products/:id/reviews/:reviewId — customer deletes their own review
export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { reviewId } = req.params
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You must be logged in to delete a review"
    )
  }

  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const [review] = await reviewModuleService.listReviews({ id: reviewId })

  if (!review) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Review not found")
  }

  if (review.customer_id !== customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You can only delete your own reviews"
    )
  }

  await deleteProductReviewWorkflow(req.scope).run({
    input: { reviewId },
  })

  res.json({ deleted: true, id: reviewId })
}
