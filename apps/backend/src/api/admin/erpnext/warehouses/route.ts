import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ErpnextClient } from "../../../../modules/erpnext/services/erpnext-client"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const baseUrl = (req.query.baseUrl as string) || process.env.ERPNEXT_BASE_URL
    const apiKey = (req.query.apiKey as string) || process.env.ERPNEXT_API_KEY
    const apiSecret = (req.query.apiSecret as string) || process.env.ERPNEXT_API_SECRET
    const company = (req.query.company as string) || process.env.ERPNEXT_DEFAULT_COMPANY

    if (!baseUrl || !apiKey || !apiSecret) {
      return res.status(400).json({
        error: "Missing ERPNext credentials. Please provide credentials or configure ERPNEXT_* env variables.",
      })
    }

    // 1. Fetch ERPNext warehouses
    const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
    const erpWarehouses = await client.getWarehouses(company)

    // 2. Fetch Medusa stock locations
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })

    return res.status(200).json({
      erpWarehouses,
      medusaStockLocations: stockLocations || [],
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to load warehouses" })
  }
}

