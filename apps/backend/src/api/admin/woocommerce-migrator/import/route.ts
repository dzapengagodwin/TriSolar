import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importWooCommerceProductsWorkflow } from "../../../../workflows/import-woocommerce-products"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const {
      wooUrl,
      consumerKey,
      consumerSecret,
      currencyCode = "usd",
      importCategories = true,
      importTags = true,
      publishProducts = false,
      jsonData,
    } = req.body as any

    const { result } = await importWooCommerceProductsWorkflow(req.scope).run({
      input: {
        wooUrl,
        consumerKey,
        consumerSecret,
        currencyCode,
        importCategories,
        importTags,
        publishProducts,
        jsonData,
      },
    })

    return res.status(200).json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
