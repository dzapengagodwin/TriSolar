import ProductRecommendationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_RECOMMENDATION_MODULE = "productRecommendation"

export default Module(PRODUCT_RECOMMENDATION_MODULE, {
  service: ProductRecommendationModuleService,
})
