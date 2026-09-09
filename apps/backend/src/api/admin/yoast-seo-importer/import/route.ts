import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importYoastSeoWorkflow } from "../../../../workflows/import-yoast-seo"

export const AUTHENTICATE = false

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const {
      wooUrl,
      consumerKey,
      consumerSecret,
      importProducts = true,
      importCategories = true,
      importBrands = true,
      importPages = true,
      overwriteExisting = true,
    } = req.body as any

    if (!wooUrl || !consumerKey || !consumerSecret) {
      return res.status(400).json({
        error: "wooUrl, consumerKey, and consumerSecret are required",
      })
    }

    const { result } = await importYoastSeoWorkflow(req.scope).run({
      input: {
        wooUrl: String(wooUrl).replace(/\/+$/, ""),
        consumerKey: String(consumerKey),
        consumerSecret: String(consumerSecret),
        importProducts,
        importCategories,
        importBrands,
        importPages,
        overwriteExisting,
        dryRun: false,
      },
    })

    return res.status(200).json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
