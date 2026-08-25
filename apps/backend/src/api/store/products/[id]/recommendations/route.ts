import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../../../../../modules/product-recommendation"
import ProductRecommendationModuleService from "../../../../../modules/product-recommendation/service"
import { RecommendationType } from "../../../../../modules/product-recommendation/types"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const type = req.query.type as RecommendationType | undefined
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
  const offset = Math.max(0, Number(req.query.offset) || 0)

  // 1. Fetch active, scheduled recommendations from database
  let activeRecs: any[] = []
  try {
    activeRecs = await recService.listActiveRecommendations(id, type, {
      limit,
      offset,
    })
  } catch (err: any) {
    console.error("Error listing active recommendations:", err)
    return res.status(200).json({
      products: [],
      count: 0,
      limit,
      offset,
    })
  }

  const recommendedProductIds = activeRecs.map(
    (r: any) => r.recommended_product_id
  )
  const products: any[] = []

  if (recommendedProductIds.length > 0) {
    try {
      const graphOptions: any = {
        entity: "product",
        fields: [
          "id",
          "title",
          "handle",
          "subtitle",
          "description",
          "thumbnail",
          "status",
          "collection.id",
          "collection.title",
          "categories.id",
          "categories.name",
          "variants.id",
          "variants.title",
          "variants.sku",
          "variants.prices.*",
        ],
        filters: {
          id: recommendedProductIds,
        },
      }

      if (req.query.currency_code || req.query.region_id) {
        graphOptions.context = {
          currency_code: req.query.currency_code,
          region_id: req.query.region_id,
        }
      }

      const { data: matchedProducts } = await query.graph(graphOptions)

      const productMap = new Map(
        (matchedProducts || []).map((p: any) => [p.id, p])
      )

      activeRecs.forEach((rec: any) => {
        const prod = productMap.get(rec.recommended_product_id)
        if (prod) {
          products.push({
            ...prod,
            recommendation: {
              id: rec.id,
              type: rec.type,
              priority: rec.priority,
              position: rec.position,
              source: rec.source,
            },
          })
        }
      })
    } catch (graphError: any) {
      console.error("Error in query.graph for recommendations:", graphError)
    }
  }

  return res.status(200).json({
    products,
    count: products.length,
    limit,
    offset,
  })
}
