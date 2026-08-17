import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importWooCommerceProductsWorkflow } from "../../../../workflows/import-woocommerce-products"

export const AUTHENTICATE = false
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const {
      wooUrl,
      consumerKey,
      consumerSecret,
      currencyCode = "usd",
      importCategories = true,
      importTags = false,
      publishProducts = false,
      createPriceList = false,
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
        createPriceList,
        jsonData,
      },
    })

    return res.status(200).json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
