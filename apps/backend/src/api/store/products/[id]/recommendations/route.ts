import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RECOMMENDATION_MODULE } from "../../../../../modules/product-recommendation"
import ProductRecommendationModuleService from "../../../../../modules/product-recommendation/service"
import { RecommendationType } from "../../../../../modules/product-recommendation/types"

export const AUTHENTICATE = false

const ACCESSORY_KEYWORDS = [
  "mouse",
  "keyboard",
  "headset",
  "earbuds",
  "bag",
  "backpack",
  "case",
  "cover",
  "charger",
  "cable",
  "stand",
  "hub",
  "adapter",
  "mousepad",
  "stylus",
  "accessory",
]

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const recService: ProductRecommendationModuleService = req.scope.resolve(
    PRODUCT_RECOMMENDATION_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const type = req.query.type as RecommendationType | undefined
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const includeFallback = req.query.fallback !== "false"

  // 1. Fetch active, scheduled manual/rule recommendations from the module
  let activeRecs: any[] = []
  try {
    activeRecs = await recService.listActiveRecommendations(id, type, {
      limit,
      offset,
    })
  } catch (err) {
    // If id is not found or error, continue with fallback
  }

  const recommendedProductIds = activeRecs.map((r: any) => r.recommended_product_id)
  let products: any[] = []

  if (recommendedProductIds.length > 0) {
    const { data: matchedProducts } = await query.graph({
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
        "variants.calculated_price.*",
      ],
      filters: {
        id: recommendedProductIds,
        status: "published",
      },
    })

    // Maintain recommendation order (priority DESC, position ASC)
    const productMap = new Map(matchedProducts.map((p: any) => [p.id, p]))

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
  }

  // 2. Intelligent Catalog Fallback if configured recommendations < limit
  if (includeFallback && products.length < limit) {
    try {
      const excludedIds = [id, ...products.map((p) => p.id)]
      const remainingLimit = limit - products.length

      if (type === "accessory") {
        // Find published products matching accessory keywords or categories
        const { data: allPublished } = await query.graph({
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
            "variants.calculated_price.*",
          ],
          filters: {
            id: { $nin: excludedIds },
            status: "published",
          },
          pagination: { take: 50 },
        })

        // Prioritize items with accessory keywords in title or handle
        const matchingAccessories = allPublished.filter((p: any) => {
          const text = `${p.title || ""} ${p.handle || ""} ${p.subtitle || ""}`.toLowerCase()
          return ACCESSORY_KEYWORDS.some((kw) => text.includes(kw))
        })

        const candidates =
          matchingAccessories.length > 0 ? matchingAccessories : allPublished

        candidates.slice(0, remainingLimit).forEach((p: any) => {
          products.push({
            ...p,
            recommendation: {
              id: `fallback_${p.id}`,
              type: "accessory",
              priority: -1,
              position: 999,
              source: "rule",
            },
          })
        })
      } else {
        // Fallback for general related / upsell items
        const { data: sourceProducts } = await query.graph({
          entity: "product",
          fields: ["id", "collection_id", "categories.id"],
          filters: { id },
        })

        const sourceProd = sourceProducts?.[0]
        const fallbackFilters: any = {
          id: { $nin: excludedIds },
          status: "published",
        }

        if (sourceProd?.collection_id) {
          fallbackFilters.collection_id = sourceProd.collection_id
        }

        const { data: fallbackProducts } = await query.graph({
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
            "variants.calculated_price.*",
          ],
          filters: fallbackFilters,
          pagination: { take: remainingLimit },
        })

        fallbackProducts.forEach((p: any) => {
          products.push({
            ...p,
            recommendation: {
              id: `fallback_${p.id}`,
              type: type || "related",
              priority: -1,
              position: 999,
              source: "rule",
            },
          })
        })
      }
    } catch {
      // Ignore fallback errors and return matched products
    }
  }

  return res.status(200).json({
    products,
    count: products.length,
    limit,
    offset,
  })
}
