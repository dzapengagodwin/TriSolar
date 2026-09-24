import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { YoastSeoClient } from "../../../../modules/woocommerce-migrator/services/yoast-seo-client"

/**
 * POST /admin/yoast-seo-importer/test-connection
 * Tests connectivity to the WordPress REST API and detects Yoast SEO fields.
 */
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { wooUrl, consumerKey, consumerSecret } = req.body as any

    if (!wooUrl || !consumerKey || !consumerSecret) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const client = new YoastSeoClient(
      String(wooUrl).replace(/\/+$/, ""),
      String(consumerKey),
      String(consumerSecret)
    )

    const testResult = await client.testConnection()
    return res.status(200).json(testResult)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
