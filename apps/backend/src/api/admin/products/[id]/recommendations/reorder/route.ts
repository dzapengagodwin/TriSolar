import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { reorderProductRecommendationsWorkflow } from "../../../../../../workflows/reorder-product-recommendations"
import { RecommendationType } from "../../../../../../modules/product-recommendation/types"

export const AUTHENTICATE = true

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { type = "related", ordered_ids } = req.body as {
    type?: RecommendationType
    ordered_ids: string[]
  }

  if (!Array.isArray(ordered_ids) || ordered_ids.length === 0) {
    return res.status(400).json({
      message: "ordered_ids must be a non-empty array of recommendation IDs",
    })
  }

  try {
    const { result: recommendations } =
      await reorderProductRecommendationsWorkflow(req.scope).run({
        input: {
          product_id: id,
          type,
          ordered_ids,
        },
      })

    return res.status(200).json({
      message: "Recommendations reordered successfully",
      recommendations,
    })
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message || "Failed to reorder recommendations",
    })
  }
}
