import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WooCommerceClient } from "../../../../modules/woocommerce-migrator/services/woocommerce-client"

interface TestConnectionBody {
  wooUrl: string
  consumerKey: string
  consumerSecret: string
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const { wooUrl, consumerKey, consumerSecret } = req.body as TestConnectionBody
    
    if (!wooUrl || !consumerKey || !consumerSecret) {
      return res.status(400).json({ error: "wooUrl, consumerKey, and consumerSecret are required" })
    }

    const client = new WooCommerceClient(wooUrl, consumerKey, consumerSecret)
    const result = await client.testConnection()

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
