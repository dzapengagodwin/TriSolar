import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERPNEXT_MODULE } from "../../../../modules/erpnext"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
    const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })

    const hasEnvConfig = Boolean(
      process.env.ERPNEXT_BASE_URL &&
      process.env.ERPNEXT_API_KEY &&
      process.env.ERPNEXT_API_SECRET
    )

    return res.status(200).json({
      settings: settings || null,
      hasEnvConfig,
      configuredBaseUrl: process.env.ERPNEXT_BASE_URL || null,
      defaultCompany: settings?.default_company || process.env.ERPNEXT_DEFAULT_COMPANY || null,
      defaultWarehouse: settings?.default_warehouse || process.env.ERPNEXT_DEFAULT_WAREHOUSE || null,
      warehouseMappings: settings?.warehouse_mappings || {},
      priceSyncEnabled: settings?.price_sync_enabled ?? true,
      erpnextPriceList: settings?.erpnext_price_list || "Standard Selling",
      syncCurrency: settings?.sync_currency || "usd",
      autoCreateSalesOrder: settings?.auto_create_sales_order ?? true,
      salesOrderPrintFormat: settings?.sales_order_print_format || "Standard",
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to load ERPNext settings" })
  }
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const erpnextService = req.scope.resolve(ERPNEXT_MODULE) as any
    const body = req.body as {
      default_company?: string
      default_warehouse?: string
      warehouse_mappings?: Record<string, string>
      price_sync_enabled?: boolean
      erpnext_price_list?: string
      sync_currency?: string
      auto_create_sales_order?: boolean
      sales_order_print_format?: string
    }

    let [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })

    if (settings) {
      settings = await erpnextService.updateErpnextSettings({
        id: settings.id,
        default_company: body.default_company ?? settings.default_company,
        default_warehouse: body.default_warehouse ?? settings.default_warehouse,
        warehouse_mappings: body.warehouse_mappings ?? settings.warehouse_mappings,
        price_sync_enabled: body.price_sync_enabled ?? settings.price_sync_enabled,
        erpnext_price_list: body.erpnext_price_list ?? settings.erpnext_price_list,
        sync_currency: body.sync_currency ?? settings.sync_currency,
        auto_create_sales_order: body.auto_create_sales_order ?? settings.auto_create_sales_order,
        sales_order_print_format: body.sales_order_print_format ?? settings.sales_order_print_format,
      })
    } else {
      settings = await erpnextService.createErpnextSettings({
        default_company: body.default_company || process.env.ERPNEXT_DEFAULT_COMPANY || null,
        default_warehouse: body.default_warehouse || process.env.ERPNEXT_DEFAULT_WAREHOUSE || null,
        warehouse_mappings: body.warehouse_mappings || {},
        price_sync_enabled: body.price_sync_enabled ?? true,
        erpnext_price_list: body.erpnext_price_list || "Standard Selling",
        sync_currency: body.sync_currency || "usd",
        auto_create_sales_order: body.auto_create_sales_order ?? true,
        sales_order_print_format: body.sales_order_print_format || "Standard",
      })
    }

    return res.status(200).json({ settings })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to save ERPNext settings" })
  }
}

