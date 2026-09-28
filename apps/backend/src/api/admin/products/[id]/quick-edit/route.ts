import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { quickEditProductWorkflow } from "../../../../../workflows/quick-edit-product"

export const AUTHENTICATE = true

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const body = req.body as {
    title?: string
    status?: "published" | "draft" | "proposed" | "rejected"
    regular_price?: number
    sale_price?: number | null
    stock_status?: "instock" | "outofstock" | "onbackorder"
    stock_quantity?: number
    brand_id?: string | null
    category_ids?: string[]
    collection_id?: string | null
  }

  const { result } = await quickEditProductWorkflow(req.scope).run({
    input: {
      id,
      ...body,
    },
  })

  return res.status(200).json({
    message: "Product updated successfully",
    product: result.product,
  })
}
