import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../../modules/product-review/service"
import { updateProductReviewWorkflow } from "../../../../../../workflows/update-product-review"
import { deleteProductReviewWorkflow } from "../../../../../../workflows/delete-product-review"

export const AUTHENTICATE = true

// POST /admin/products/:id/reviews/:reviewId — update review status or details
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { id: productId, reviewId } = req.params
  const { status } = req.body as { status?: "approved" | "pending" | "rejected" }

  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const review = await reviewModuleService.retrieveReview(reviewId)
  if (!review || review.product_id !== productId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Review with id ${reviewId} not found for product ${productId}`
    )
  }

  const { result } = await updateProductReviewWorkflow(req.scope).run({
    input: {
      id: reviewId,
      ...(status ? { status } : {}),
    },
  })

  res.json({ review: result })
}

// DELETE /admin/products/:id/reviews/:reviewId — delete a review
export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { id: productId, reviewId } = req.params

  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const review = await reviewModuleService.retrieveReview(reviewId)
  if (!review || review.product_id !== productId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Review with id ${reviewId} not found for product ${productId}`
    )
  }

  await deleteProductReviewWorkflow(req.scope).run({
    input: { reviewId },
  })

  res.json({
    id: reviewId,
    object: "review",
    deleted: true,
  })
}

