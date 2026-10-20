import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ERPNEXT_MODULE } from "../modules/erpnext"
import { ErpnextClient } from "../modules/erpnext/services/erpnext-client"
import {
  analyzeSkuAudit,
  MedusaVariantRecord,
  SkuAuditResult,
} from "../modules/erpnext/services/sku-audit-service"

export type ErpnextSkuAuditInput = {
  baseUrl?: string
  apiKey?: string
  apiSecret?: string
  company?: string
}

export const runErpnextSkuAuditStep = createStep(
  "run-erpnext-sku-audit",
  async (input: ErpnextSkuAuditInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    let erpnextService: any
    try {
      erpnextService = container.resolve(ERPNEXT_MODULE)
    } catch {
      erpnextService = null
    }

    // Resolve credentials (provided in input or falling back to environment)
    const baseUrl = input.baseUrl || process.env.ERPNEXT_BASE_URL
    const apiKey = input.apiKey || process.env.ERPNEXT_API_KEY
    const apiSecret = input.apiSecret || process.env.ERPNEXT_API_SECRET

    if (!baseUrl || !apiKey || !apiSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "ERPNext configuration is missing. Provide baseUrl, apiKey, and apiSecret or set ERPNEXT_* environment variables."
      )
    }

    // 1. Initialize ERPNext client and fetch all items & selling prices
    const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
    const erpItems = await client.getAllItems()

    let erpPrices: any[] = []
    try {
      erpPrices = await client.getAllItemPrices({ priceList: "Standard Selling" })
    } catch {
      erpPrices = []
    }

    const erpPriceMap = new Map<string, number>()
    for (const p of erpPrices) {
      if (p.item_code) {
        erpPriceMap.set(p.item_code.trim(), Number(p.price_list_rate))
      }
    }

    // 2. Fetch all Medusa product variants with pagination
    const medusaVariants: MedusaVariantRecord[] = []
    const pageSize = 100
    let offset = 0
    let variantCount = 0

    do {
      const { data, metadata } = await query.graph({
        entity: "product_variant",
        fields: [
          "id",
          "title",
          "sku",
          "product_id",
          "product.id",
          "product.title",
          "prices.id",
          "prices.amount",
          "prices.currency_code",
          "inventory_items.inventory_item_id",
          "inventory_items.inventory.location_levels.stocked_quantity",
        ],
        pagination: { skip: offset, take: pageSize },
      })

      const pageVariants = (data || []) as any[]
      for (const v of pageVariants) {
        let totalStock = 0
        const invItems = v.inventory_items || []
        for (const ii of invItems) {
          const levels = ii.inventory?.location_levels || []
          for (const lvl of levels) {
            totalStock += lvl.stocked_quantity ?? 0
          }
        }

        const prices = v.prices || []
        const matchedPrice = prices.find((p: any) => p.currency_code?.toLowerCase() === "usd")

        medusaVariants.push({
          id: v.id,
          title: v.title || "",
          sku: v.sku || null,
          product_id: v.product_id || v.product?.id || "",
          product_title: v.product?.title || "",
          inventory_item_id: invItems[0]?.inventory_item_id || null,
          stocked_quantity: totalStock,
          current_price: matchedPrice ? Number(matchedPrice.amount) : null,
          price_id: matchedPrice?.id || null,
        })
      }

      variantCount = metadata?.count ?? offset + pageVariants.length
      offset += pageVariants.length
    } while (offset < variantCount && offset > 0)

    // 3. Run pure read-only SKU audit analysis
    const auditResult = analyzeSkuAudit(erpItems, medusaVariants, erpPriceMap)

    // 4. Update last audit metadata in settings if module is initialized
    if (erpnextService) {
      try {
        const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })
        if (settings) {
          await erpnextService.updateErpnextSettings({
            id: settings.id,
            last_audit_at: new Date(),
            last_audit_summary: auditResult.summary,
          })
        } else {
          await erpnextService.createErpnextSettings({
            default_company: process.env.ERPNEXT_DEFAULT_COMPANY || null,
            default_warehouse: process.env.ERPNEXT_DEFAULT_WAREHOUSE || null,
            warehouse_mappings: {},
            last_audit_at: new Date(),
            last_audit_summary: auditResult.summary,
          })
        }
      } catch (err: any) {
        console.warn("[ERPNext Audit] Could not update settings metadata:", err.message)
      }
    }

    return new StepResponse(auditResult)
  }
)

export const erpnextSkuAuditWorkflow = createWorkflow(
  "erpnext-sku-audit",
  (input: ErpnextSkuAuditInput) => {
    const result = runErpnextSkuAuditStep(input)
    return new WorkflowResponse(result)
  }
)
