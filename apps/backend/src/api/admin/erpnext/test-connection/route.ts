import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ErpnextClient } from "../../../../modules/erpnext/services/erpnext-client"

interface TestConnectionBody {
  baseUrl?: string
  apiKey?: string
  apiSecret?: string
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as TestConnectionBody) || {}
    const baseUrl = body.baseUrl || process.env.ERPNEXT_BASE_URL
    const apiKey = body.apiKey || process.env.ERPNEXT_API_KEY
    const apiSecret = body.apiSecret || process.env.ERPNEXT_API_SECRET

    if (!baseUrl || !apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: "Missing ERPNext configuration. Please configure baseUrl, apiKey, and apiSecret.",
      })
    }

    const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
    const result = await client.testConnection()

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to test ERPNext connection",
    })
  }
}

