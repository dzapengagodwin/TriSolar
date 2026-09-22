import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export const AUTHENTICATE = true

// GET /admin/products/:id/reviews — fetch all reviews for a product (all statuses)
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const [reviews, count] = await reviewModuleService.listAndCountReviews(
    { product_id: id },
    { order: { created_at: "DESC" }, take: 100 }
  )

  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1))
    : 0

  res.json({
    reviews,
    count,
    average_rating: averageRating,
  })
}

