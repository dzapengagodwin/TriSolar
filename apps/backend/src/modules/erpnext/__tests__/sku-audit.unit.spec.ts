import {
  analyzeSkuAudit,
  MedusaVariantRecord,
} from "../services/sku-audit-service"
import { ErpnextItem } from "../services/erpnext-client"

describe("SKU Matching Audit Analyzer Unit Tests", () => {
  it("matches identical SKUs with surrounding whitespace trimming", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-001",
        item_code: "  LZ-DELL-5520  ",
        item_name: "Dell Precision 5520",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "16GB RAM / 512GB SSD",
        sku: "LZ-DELL-5520",
        product_id: "prod_1",
        product_title: "Dell Precision 5520",
        inventory_item_id: "inv_1",
        stocked_quantity: 5,
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(1)
    expect(result.summary.erp_only).toBe(0)
    expect(result.summary.medusa_only).toBe(0)
    expect(result.records).toHaveLength(1)
    expect(result.records[0].status).toBe("MATCHED")
    expect(result.records[0].sku).toBe("LZ-DELL-5520")
    expect(result.records[0].medusa_variant_id).toBe("var_1")
  })

  it("strictly enforces case sensitivity (no case normalization)", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-001",
        item_code: "lz-dell-5520", // lowercase
        item_name: "Dell Precision 5520",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "16GB RAM",
        sku: "LZ-DELL-5520", // uppercase
        product_id: "prod_1",
        product_title: "Dell Precision 5520",
        inventory_item_id: "inv_1",
        stocked_quantity: 5,
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(0)
    expect(result.summary.erp_only).toBe(1)
    expect(result.summary.medusa_only).toBe(1)
  })

  it("detects and flags duplicate SKUs in ERP items", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-001",
        item_code: "DUP-SKU",
        item_name: "Item A",
        is_stock_item: 1,
        disabled: 0,
      },
      {
        name: "ITEM-002",
        item_code: "DUP-SKU",
        item_name: "Item B",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "Variant 1",
        sku: "DUP-SKU",
        product_id: "prod_1",
        product_title: "Product 1",
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(0)
    expect(result.summary.duplicate_erp_sku).toBe(2)
    const dupRecords = result.records.filter((r) => r.status === "DUPLICATE_ERP_SKU")
    expect(dupRecords).toHaveLength(2)
  })

  it("detects and flags duplicate SKUs in Medusa variants", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-001",
        item_code: "MEDUSA-DUP",
        item_name: "Unique ERP Item",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "Variant 1",
        sku: "MEDUSA-DUP",
        product_id: "prod_1",
        product_title: "Product 1",
      },
      {
        id: "var_2",
        title: "Variant 2",
        sku: "MEDUSA-DUP",
        product_id: "prod_2",
        product_title: "Product 2",
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(0)
    expect(result.summary.duplicate_medusa_sku).toBe(2)
    const dupRecords = result.records.filter((r) => r.status === "DUPLICATE_MEDUSA_SKU")
    expect(dupRecords).toHaveLength(2)
  })

  it("flags missing/blank SKUs in either system", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-001",
        item_code: "",
        item_name: "No Code Item",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "Variant Without SKU",
        sku: null,
        product_id: "prod_1",
        product_title: "Product 1",
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.missing_sku).toBe(2)
    const missing = result.records.filter((r) => r.status === "MISSING_SKU")
    expect(missing).toHaveLength(2)
  })

  it("flags disabled or non-stock ERP items as INVALID_OR_UNAVAILABLE_ITEM", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-DISABLED",
        item_code: "SKU-DISABLED",
        item_name: "Disabled Item",
        is_stock_item: 1,
        disabled: 1,
      },
      {
        name: "ITEM-NONSTOCK",
        item_code: "SKU-SERVICE",
        item_name: "Service Item",
        is_stock_item: 0,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "Var 1",
        sku: "SKU-DISABLED",
        product_id: "prod_1",
      },
      {
        id: "var_2",
        title: "Var 2",
        sku: "SKU-SERVICE",
        product_id: "prod_2",
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(0)
    expect(result.summary.invalid_or_unavailable).toBe(2)
    const invalid = result.records.filter((r) => r.status === "INVALID_OR_UNAVAILABLE_ITEM")
    expect(invalid).toHaveLength(2)
  })

  it("accurately classifies ERP_ONLY and MEDUSA_ONLY items", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ERP-1",
        item_code: "ERP-ONLY-SKU",
        item_name: "Only in ERP",
        is_stock_item: 1,
        disabled: 0,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "Medusa Only Var",
        sku: "MEDUSA-ONLY-SKU",
        product_id: "prod_1",
      },
    ]

    const result = analyzeSkuAudit(erpItems, medusaVariants)

    expect(result.summary.matched).toBe(0)
    expect(result.summary.erp_only).toBe(1)
    expect(result.summary.medusa_only).toBe(1)
  })

  it("calculates erp_price, medusa_price, and price_diff for matched items", () => {
    const erpItems: ErpnextItem[] = [
      {
        name: "ITEM-PRICE-1",
        item_code: "LZ-DELL-5520",
        item_name: "Dell Precision 5520",
        is_stock_item: 1,
        disabled: 0,
        standard_rate: 300,
      },
    ]

    const medusaVariants: MedusaVariantRecord[] = [
      {
        id: "var_1",
        title: "16GB RAM",
        sku: "LZ-DELL-5520",
        product_id: "prod_1",
        stocked_quantity: 5,
        current_price: 250,
      },
    ]

    const priceMap = new Map<string, number>([["LZ-DELL-5520", 280]])

    const result = analyzeSkuAudit(erpItems, medusaVariants, priceMap)

    expect(result.summary.matched).toBe(1)
    const match = result.records[0]
    expect(match.erp_price).toBe(280)
    expect(match.medusa_price).toBe(250)
    expect(match.price_diff).toBe(30) // 280 - 250 = +30
  })
})

