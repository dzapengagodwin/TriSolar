import { InjectManager, MedusaService, MedusaContext } from "@medusajs/framework/utils"
import Review from "./models/review"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@medusajs/framework/mikro-orm/knex"

class ProductReviewModuleService extends MedusaService({
  Review,
}) {
  @InjectManager()
  async getAverageRating(
    productId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<number> {
    const result = await sharedContext?.manager?.execute(
      `SELECT AVG(rating) as average FROM review WHERE product_id = '${productId}' AND status = 'approved'`
    )

    return parseFloat(parseFloat(result?.[0]?.average ?? 0).toFixed(2))
  }

  @InjectManager()
  async hasCustomerReviewed(
    customerId: string,
    productId: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<boolean> {
    const result = await sharedContext?.manager?.execute(
      `SELECT COUNT(*) as count FROM review WHERE customer_id = '${customerId}' AND product_id = '${productId}'`
    )
    return parseInt(result?.[0]?.count ?? 0, 10) > 0
  }
}

export default ProductReviewModuleService
