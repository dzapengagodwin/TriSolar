import { ErpnextItem } from "./erpnext-client"

export type SkuAuditStatus =
  | "MATCHED"
  | "ERP_ONLY"
  | "MEDUSA_ONLY"
  | "DUPLICATE_ERP_SKU"
  | "DUPLICATE_MEDUSA_SKU"
  | "MISSING_SKU"
  | "INVALID_OR_UNAVAILABLE_ITEM"

export interface MedusaVariantRecord {
  id: string
  title: string
  sku: string | null
  product_id: string
  product_title?: string
  inventory_item_id?: string | null
  stocked_quantity?: number
  current_price?: number | null
  price_id?: string | null
}

export interface SkuAuditRecord {
  sku: string
  status: SkuAuditStatus
  erp_item_code: string | null
  erp_item_name: string | null
  erp_is_stock: boolean | null
  erp_disabled: boolean | null
  medusa_product_id: string | null
  medusa_product_title: string | null
  medusa_variant_id: string | null
  medusa_variant_title: string | null
  medusa_inventory_item_id?: string | null
  medusa_stock?: number | null
  erp_price?: number | null
  medusa_price?: number | null
  price_diff?: number | null
  notes?: string
}

export interface SkuAuditSummary {
  total_erp_items: number
  total_medusa_variants: number
  matched: number
  erp_only: number
  medusa_only: number
  duplicate_erp_sku: number
  duplicate_medusa_sku: number
  missing_sku: number
  invalid_or_unavailable: number
  audited_at: string
}

export interface SkuAuditResult {
  summary: SkuAuditSummary
  records: SkuAuditRecord[]
}

/**
 * Pure, deterministic SKU audit analyzer.
 * Performs exact case-sensitive SKU matching with trimmed whitespace.
 * Strict read-only audit logic with zero side effects.
 */
export function analyzeSkuAudit(
  erpItems: ErpnextItem[],
  medusaVariants: MedusaVariantRecord[],
  erpPriceMap?: Map<string, number>
): SkuAuditResult {
  const records: SkuAuditRecord[] = []

  // 1. Map and detect duplicates in ERP items
  const erpBySku = new Map<string, ErpnextItem[]>()
  const erpMissingSku: ErpnextItem[] = []

  for (const item of erpItems) {
    const rawCode = item.item_code ?? ""
    const trimmed = rawCode.trim()

    if (!trimmed) {
      erpMissingSku.push(item)
      continue
    }

    const list = erpBySku.get(trimmed) || []
    list.push(item)
    erpBySku.set(trimmed, list)
  }

  // 2. Map and detect duplicates in Medusa variants
  const medusaBySku = new Map<string, MedusaVariantRecord[]>()
  const medusaMissingSku: MedusaVariantRecord[] = []

  for (const variant of medusaVariants) {
    const rawSku = variant.sku ?? ""
    const trimmed = rawSku.trim()

    if (!trimmed) {
      medusaMissingSku.push(variant)
      continue
    }

    const list = medusaBySku.get(trimmed) || []
    list.push(variant)
    medusaBySku.set(trimmed, list)
  }

  // Handle missing SKU records
  for (const item of erpMissingSku) {
    records.push({
      sku: "(BLANK)",
      status: "MISSING_SKU",
      erp_item_code: item.item_code ?? "(BLANK)",
      erp_item_name: item.item_name ?? null,
      erp_is_stock: item.is_stock_item === 1,
      erp_disabled: item.disabled === 1,
      medusa_product_id: null,
      medusa_product_title: null,
      medusa_variant_id: null,
      medusa_variant_title: null,
      notes: "ERPNext Item is missing an item_code",
    })
  }

  for (const variant of medusaMissingSku) {
    records.push({
      sku: "(BLANK)",
      status: "MISSING_SKU",
      erp_item_code: null,
      erp_item_name: null,
      erp_is_stock: null,
      erp_disabled: null,
      medusa_product_id: variant.product_id,
      medusa_product_title: variant.product_title ?? null,
      medusa_variant_id: variant.id,
      medusa_variant_title: variant.title,
      medusa_inventory_item_id: variant.inventory_item_id,
      medusa_stock: variant.stocked_quantity ?? 0,
      notes: "Medusa variant has no SKU assigned",
    })
  }

  // Identify duplicate SKUs in ERP
  const duplicateErpSkus = new Set<string>()
  for (const [sku, items] of erpBySku.entries()) {
    if (items.length > 1) {
      duplicateErpSkus.add(sku)
      for (const item of items) {
        records.push({
          sku,
          status: "DUPLICATE_ERP_SKU",
          erp_item_code: item.item_code,
          erp_item_name: item.item_name ?? null,
          erp_is_stock: item.is_stock_item === 1,
          erp_disabled: item.disabled === 1,
          medusa_product_id: null,
          medusa_product_title: null,
          medusa_variant_id: null,
          medusa_variant_title: null,
          notes: `Duplicate item_code in ERPNext (${items.length} items share SKU "${sku}")`,
        })
      }
    }
  }

  // Identify duplicate SKUs in Medusa
  const duplicateMedusaSkus = new Set<string>()
  for (const [sku, variants] of medusaBySku.entries()) {
    if (variants.length > 1) {
      duplicateMedusaSkus.add(sku)
      for (const variant of variants) {
        records.push({
          sku,
          status: "DUPLICATE_MEDUSA_SKU",
          erp_item_code: null,
          erp_item_name: null,
          erp_is_stock: null,
          erp_disabled: null,
          medusa_product_id: variant.product_id,
          medusa_product_title: variant.product_title ?? null,
          medusa_variant_id: variant.id,
          medusa_variant_title: variant.title,
          medusa_inventory_item_id: variant.inventory_item_id,
          medusa_stock: variant.stocked_quantity ?? 0,
          notes: `Duplicate SKU in Medusa (${variants.length} variants share SKU "${sku}")`,
        })
      }
    }
  }

  // Process unique SKUs from ERP
  const allUniqueSkus = new Set<string>([...erpBySku.keys(), ...medusaBySku.keys()])

  for (const sku of allUniqueSkus) {
    if (duplicateErpSkus.has(sku) || duplicateMedusaSkus.has(sku)) {
      continue
    }

    const erpItemList = erpBySku.get(sku)
    const medusaVariantList = medusaBySku.get(sku)

    const erpItem = erpItemList?.[0]
    const medusaVariant = medusaVariantList?.[0]

    // ERP Only
    if (erpItem && !medusaVariant) {
      const isStock = erpItem.is_stock_item === 1
      const isDisabled = erpItem.disabled === 1

      if (isDisabled || !isStock) {
        records.push({
          sku,
          status: "INVALID_OR_UNAVAILABLE_ITEM",
          erp_item_code: erpItem.item_code,
          erp_item_name: erpItem.item_name ?? null,
          erp_is_stock: isStock,
          erp_disabled: isDisabled,
          medusa_product_id: null,
          medusa_product_title: null,
          medusa_variant_id: null,
          medusa_variant_title: null,
          notes: isDisabled
            ? "ERPNext item is disabled"
            : "ERPNext item is not configured as a stock item",
        })
      } else {
        records.push({
          sku,
          status: "ERP_ONLY",
          erp_item_code: erpItem.item_code,
          erp_item_name: erpItem.item_name ?? null,
          erp_is_stock: isStock,
          erp_disabled: isDisabled,
          medusa_product_id: null,
          medusa_product_title: null,
          medusa_variant_id: null,
          medusa_variant_title: null,
          notes: "Item exists in ERPNext but does not exist in Medusa",
        })
      }
      continue
    }

    // Medusa Only
    if (!erpItem && medusaVariant) {
      records.push({
        sku,
        status: "MEDUSA_ONLY",
        erp_item_code: null,
        erp_item_name: null,
        erp_is_stock: null,
        erp_disabled: null,
        medusa_product_id: medusaVariant.product_id,
        medusa_product_title: medusaVariant.product_title ?? null,
        medusa_variant_id: medusaVariant.id,
        medusa_variant_title: medusaVariant.title,
        medusa_inventory_item_id: medusaVariant.inventory_item_id,
        medusa_stock: medusaVariant.stocked_quantity ?? 0,
        notes: "Variant exists in Medusa but does not exist in ERPNext",
      })
      continue
    }

    // Both exist
    if (erpItem && medusaVariant) {
      const isStock = erpItem.is_stock_item === 1
      const isDisabled = erpItem.disabled === 1

      if (isDisabled || !isStock) {
        records.push({
          sku,
          status: "INVALID_OR_UNAVAILABLE_ITEM",
          erp_item_code: erpItem.item_code,
          erp_item_name: erpItem.item_name ?? null,
          erp_is_stock: isStock,
          erp_disabled: isDisabled,
          medusa_product_id: medusaVariant.product_id,
          medusa_product_title: medusaVariant.product_title ?? null,
          medusa_variant_id: medusaVariant.id,
          medusa_variant_title: medusaVariant.title,
          medusa_inventory_item_id: medusaVariant.inventory_item_id,
          medusa_stock: medusaVariant.stocked_quantity ?? 0,
          notes: isDisabled
            ? "Matched SKU, but ERPNext item is disabled"
            : "Matched SKU, but ERPNext item is not configured as a stock item",
        })
      } else {
        const erpPrice = erpPriceMap?.get(sku) ?? (erpItem.standard_rate ? Number(erpItem.standard_rate) : null)
        const medusaPrice = medusaVariant.current_price ?? null
        const priceDiff =
          erpPrice !== null && medusaPrice !== null
            ? Number((erpPrice - medusaPrice).toFixed(2))
            : null

        records.push({
          sku,
          status: "MATCHED",
          erp_item_code: erpItem.item_code,
          erp_item_name: erpItem.item_name ?? null,
          erp_is_stock: isStock,
          erp_disabled: isDisabled,
          medusa_product_id: medusaVariant.product_id,
          medusa_product_title: medusaVariant.product_title ?? null,
          medusa_variant_id: medusaVariant.id,
          medusa_variant_title: medusaVariant.title,
          medusa_inventory_item_id: medusaVariant.inventory_item_id,
          medusa_stock: medusaVariant.stocked_quantity ?? 0,
          erp_price: erpPrice,
          medusa_price: medusaPrice,
          price_diff: priceDiff,
          notes: "Exact SKU match. Eligible for inventory & price sync.",
        })
      }
    }
  }

  // Summary counts
  const summary: SkuAuditSummary = {
    total_erp_items: erpItems.length,
    total_medusa_variants: medusaVariants.length,
    matched: records.filter((r) => r.status === "MATCHED").length,
    erp_only: records.filter((r) => r.status === "ERP_ONLY").length,
    medusa_only: records.filter((r) => r.status === "MEDUSA_ONLY").length,
    duplicate_erp_sku: records.filter((r) => r.status === "DUPLICATE_ERP_SKU").length,
    duplicate_medusa_sku: records.filter((r) => r.status === "DUPLICATE_MEDUSA_SKU").length,
    missing_sku: records.filter((r) => r.status === "MISSING_SKU").length,
    invalid_or_unavailable: records.filter((r) => r.status === "INVALID_OR_UNAVAILABLE_ITEM").length,
    audited_at: new Date().toISOString(),
  }

  return { summary, records }
}

