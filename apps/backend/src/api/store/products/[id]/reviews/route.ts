import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"
import { createProductReviewWorkflow } from "../../../../../workflows/create-product-review"

// GET /store/products/:id/reviews — public, returns approved reviews
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const [reviews, averageRating] = await Promise.all([
    reviewModuleService.listReviews(
      { product_id: id, status: "approved" },
      { order: { created_at: "DESC" }, take: 50 }
    ),
    reviewModuleService.getAverageRating(id),
  ])

  res.json({ reviews, count: reviews.length, average_rating: averageRating })
}

// POST /store/products/:id/reviews — requires auth + verified purchase
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId } = req.params
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You must be logged in to leave a review"
    )
  }

  const { rating, title, content, first_name, last_name } = req.body as {
    rating: number
    title?: string
    content: string
    first_name: string
    last_name: string
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Rating must be between 1 and 5"
    )
  }

  if (!content?.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Review content is required")
  }

  if (!first_name?.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "First name is required")
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
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "You have already reviewed this product"
    )
  }

  // Verify the customer has a completed order containing this product
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { customer_id: customerId, status: ["completed", "delivered"] },
    fields: ["id", "items.*", "items.product_id"],
  })

  const purchaseOrder = (orders as Array<{ id: string; items?: Array<{ product_id: string }> }>)
    ?.find((order) =>
      order.items?.some((item) => item.product_id === productId)
    )

  if (!purchaseOrder) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "You can only review products you have purchased and received"
    )
  }

  const { result: review } = await createProductReviewWorkflow(req.scope).run({
    input: {
      product_id: productId,
      customer_id: customerId,
      order_id: purchaseOrder.id,
      rating: Math.round(rating),
      title: title?.trim() || null,
      content: content.trim(),
      first_name: first_name.trim(),
      last_name: (last_name || "").trim(),
      status: "approved",
    },
  })

  res.json({ review })
}
