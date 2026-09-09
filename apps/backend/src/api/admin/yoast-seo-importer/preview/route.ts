import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { importYoastSeoWorkflow } from "../../../../workflows/import-yoast-seo"

export const AUTHENTICATE = false

/**
 * POST /admin/yoast-seo-importer/preview
 * Dry-run mode: fetches Yoast data and resolves Medusa entity matches,
 * but does NOT write anything to the database.
 * Returns a preview table for user review before running the real import.
 */
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
        overwriteExisting: true,
        dryRun: true,
      },
    })

    return res.status(200).json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
