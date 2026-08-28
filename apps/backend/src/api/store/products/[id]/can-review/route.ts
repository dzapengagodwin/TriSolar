import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const AUTHENTICATE = false

// GET /store/products/:id/can-review
// Returns eligibility info so the storefront can conditionally show the review form.
// Authenticated customers get a full check; guests get { canReview: false, reason: "unauthenticated" }.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId } = req.params
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.json({ canReview: false, reason: "unauthenticated" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  // Check for duplicate review
  const alreadyReviewed = await reviewModuleService.hasCustomerReviewed(
    customerId,
    productId
  )

  if (alreadyReviewed) {
    const [existingReview] = await reviewModuleService.listReviews({
      customer_id: customerId,
      product_id: productId,
    })
    return res.json({
      canReview: false,
      reason: "already_reviewed",
      existingReview,
    })
  }

  // Check purchase history
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { customer_id: customerId, status: ["completed", "delivered"] },
    fields: ["id", "items.*", "items.product_id"],
  })

  const hasPurchased = orders?.some((order: any) =>
    order.items?.some((item: any) => item.product_id === productId)
  )

  if (!hasPurchased) {
    return res.json({ canReview: false, reason: "not_purchased" })
  }

  return res.json({ canReview: true })
}
