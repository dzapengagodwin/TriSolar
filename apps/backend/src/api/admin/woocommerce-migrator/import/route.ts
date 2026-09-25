import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importWooCommerceProductsWorkflow } from "../../../../workflows/import-woocommerce-products"

interface ImportRequestBody {
  wooUrl?: string
  consumerKey?: string
  consumerSecret?: string
  currencyCode?: string
  importCategories?: boolean
  importTags?: boolean
  publishProducts?: boolean
  createPriceList?: boolean
  skipVariants?: boolean
  createdAfter?: string
  createdBefore?: string
  jsonData?: {
    products?: any[]
    categories?: any[]
    tags?: any[]
  } | any[]
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as ImportRequestBody
    
    if (!body.jsonData) {
      if (!body.wooUrl || !body.consumerKey || !body.consumerSecret) {
        return res.status(400).json({ error: "wooUrl, consumerKey, and consumerSecret are required when jsonData is not provided" })
      }
    }
    
    if (body.currencyCode && !/^[a-z]{3}$/.test(body.currencyCode)) {
      return res.status(400).json({ error: "currencyCode must be a lowercase 3-letter string" })
    }

    const {
      wooUrl,
      consumerKey,
      consumerSecret,
      currencyCode = "usd",
      importCategories = true,
      importTags = false,
      publishProducts = true,
      createPriceList = false,
      skipVariants = true,
      createdAfter,
      createdBefore,
      jsonData,
    } = body

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
        skipVariants,
        createdAfter,
        createdBefore,
        jsonData,
      },
    })

    return res.status(200).json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
