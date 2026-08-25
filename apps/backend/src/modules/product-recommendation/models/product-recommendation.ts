import { model } from "@medusajs/framework/utils"

export enum RecommendationType {
  UPSELL = "upsell",
  CROSS_SELL = "cross_sell",
  RELATED = "related",
  ACCESSORY = "accessory",
  ALTERNATIVE = "alternative",
}

export enum RecommendationSource {
  MANUAL = "manual",
  RULE = "rule",
  AI = "ai",
  BEHAVIORAL = "behavioral",
}

export const ProductRecommendation = model
  .define("product_recommendation", {
    id: model.id().primaryKey(),
    product_id: model.text().index("idx_product_rec_product_id"),
    recommended_product_id: model
      .text()
      .index("idx_product_rec_recommended_product_id"),
    type: model
      .enum(RecommendationType)
      .default(RecommendationType.RELATED)
      .index("idx_product_rec_type"),
    priority: model.number().default(0),
    position: model.number().default(0),
    is_active: model.boolean().default(true).index("idx_product_rec_is_active"),
    start_at: model.dateTime().nullable(),
    end_at: model.dateTime().nullable(),
    source: model
      .enum(RecommendationSource)
      .default(RecommendationSource.MANUAL),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      on: ["product_id", "recommended_product_id", "type"],
      unique: true,
      name: "idx_product_rec_unique_pair_type",
    },
    {
      on: ["product_id", "type", "is_active"],
      name: "idx_product_rec_lookup",
    },
  ])

export default ProductRecommendation
