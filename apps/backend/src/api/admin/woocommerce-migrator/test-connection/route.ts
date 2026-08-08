import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WooCommerceClient } from "../../../../modules/woocommerce-migrator/services/woocommerce-client"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { wooUrl, consumerKey, consumerSecret } = req.body as any

    const client = new WooCommerceClient(wooUrl, consumerKey, consumerSecret)
    const result = await client.testConnection()

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
