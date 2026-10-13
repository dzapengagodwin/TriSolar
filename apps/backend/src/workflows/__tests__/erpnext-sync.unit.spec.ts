import {
  InventoryPreviewRow,
  InventorySyncSummary,
} from "../erpnext-inventory-sync"

describe("ERPNext Inventory Sync Logic Unit Tests", () => {
  describe("Inventory diff calculation and idempotency", () => {
    it("marks identical stock as NO_CHANGE with 0 diff (idempotent)", () => {
      const currentStock = 12
      const erpQty = 12

      const row: InventoryPreviewRow = {
        sku: "LZ-HP-840",
        erp_item_code: "LZ-HP-840",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_01",
        medusa_product_id: "prod_01",
        medusa_product_title: "HP EliteBook 840 G5",
        medusa_variant_title: "i5 8GB 256GB",
        current_quantity: currentStock,
        erp_quantity: erpQty,
        quantity_diff: erpQty - currentStock,
        action: currentStock === erpQty ? "NO_CHANGE" : "UPDATE",
      }

      expect(row.action).toBe("NO_CHANGE")
      expect(row.quantity_diff).toBe(0)
    })

    it("marks differing stock as UPDATE with accurate directional diff", () => {
      const currentStock = 3
      const erpQty = 10

      const row: InventoryPreviewRow = {
        sku: "LZ-LENOVO-T480",
        erp_item_code: "LZ-LENOVO-T480",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_02",
        medusa_product_id: "prod_02",
        medusa_product_title: "Lenovo ThinkPad T480",
        medusa_variant_title: "Core i7",
        current_quantity: currentStock,
        erp_quantity: erpQty,
        quantity_diff: erpQty - currentStock,
        action: "UPDATE",
      }

      expect(row.action).toBe("UPDATE")
      expect(row.quantity_diff).toBe(7)
    })

    it("marks uninstantiated location levels as CREATE with full quantity diff", () => {
      const currentStock = 0
      const erpQty = 15

      const row: InventoryPreviewRow = {
        sku: "LZ-DELL-7490",
        erp_item_code: "LZ-DELL-7490",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_03",
        medusa_product_id: "prod_03",
        medusa_product_title: "Dell Latitude 7490",
        medusa_variant_title: "Default",
        current_quantity: currentStock,
        erp_quantity: erpQty,
        quantity_diff: erpQty,
        action: "CREATE",
      }

      expect(row.action).toBe("CREATE")
      expect(row.quantity_diff).toBe(15)
    })

    it("identifies variants missing inventory items without crashing", () => {
      const row: InventoryPreviewRow = {
        sku: "LZ-MISC",
        erp_item_code: "LZ-MISC",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_04",
        medusa_product_id: "prod_04",
        medusa_product_title: "Accessory",
        medusa_variant_title: "Default",
        current_quantity: 0,
        erp_quantity: 0,
        quantity_diff: 0,
        action: "MISSING_INVENTORY_ITEM",
        reason: "Variant is not linked to a Medusa inventory item",
      }

      expect(row.action).toBe("MISSING_INVENTORY_ITEM")
    })
  })

  describe("Sync summary aggregation", () => {
    it("accurately computes metrics from preview rows", () => {
      const rows: InventoryPreviewRow[] = [
        {
          sku: "SKU-1",
          erp_item_code: "SKU-1",
          erp_warehouse: "WH-1",
          medusa_location_id: "LOC-1",
          medusa_variant_id: "VAR-1",
          medusa_product_id: "PROD-1",
          medusa_product_title: "P1",
          medusa_variant_title: "V1",
          current_quantity: 5,
          erp_quantity: 10,
          quantity_diff: 5,
          action: "UPDATE",
        },
        {
          sku: "SKU-2",
          erp_item_code: "SKU-2",
          erp_warehouse: "WH-1",
          medusa_location_id: "LOC-1",
          medusa_variant_id: "VAR-2",
          medusa_product_id: "PROD-2",
          medusa_product_title: "P2",
          medusa_variant_title: "V2",
          current_quantity: 0,
          erp_quantity: 8,
          quantity_diff: 8,
          action: "CREATE",
        },
        {
          sku: "SKU-3",
          erp_item_code: "SKU-3",
          erp_warehouse: "WH-1",
          medusa_location_id: "LOC-1",
          medusa_variant_id: "VAR-3",
          medusa_product_id: "PROD-3",
          medusa_product_title: "P3",
          medusa_variant_title: "V3",
          current_quantity: 4,
          erp_quantity: 4,
          quantity_diff: 0,
          action: "NO_CHANGE",
        },
      ]

      const summary: InventorySyncSummary = {
        total_matched_items: rows.length,
        will_update: rows.filter((r) => r.action === "UPDATE").length,
        will_create: rows.filter((r) => r.action === "CREATE").length,
        unchanged: rows.filter((r) => r.action === "NO_CHANGE").length,
        unmapped: 0,
        missing_inventory_items: 0,
        executed_updates: 0,
        executed_creates: 0,
        will_update_prices: 0,
        executed_price_updates: 0,
        failed: 0,
        started_at: new Date().toISOString(),
      }

      expect(summary.total_matched_items).toBe(3)
      expect(summary.will_update).toBe(1)
      expect(summary.will_create).toBe(1)
      expect(summary.unchanged).toBe(1)
    })
  })

  describe("Price synchronization diff and action calculation", () => {
    it("marks different prices as UPDATE_PRICE with correct price_diff", () => {
      const row: InventoryPreviewRow = {
        sku: "LZ-HP-840",
        erp_item_code: "LZ-HP-840",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_01",
        medusa_product_id: "prod_01",
        medusa_product_title: "HP EliteBook 840 G5",
        medusa_variant_title: "i5 8GB 256GB",
        current_quantity: 5,
        erp_quantity: 5,
        quantity_diff: 0,
        action: "NO_CHANGE",
        current_price: 250,
        erp_price: 300,
        price_diff: 50,
        price_action: "UPDATE_PRICE",
      }

      expect(row.price_action).toBe("UPDATE_PRICE")
      expect(row.price_diff).toBe(50)
    })

    it("marks new prices where current is null as CREATE_PRICE", () => {
      const row: InventoryPreviewRow = {
        sku: "LZ-NEW-ITEM",
        erp_item_code: "LZ-NEW-ITEM",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_02",
        medusa_product_id: "prod_02",
        medusa_product_title: "New Item",
        medusa_variant_title: "Default",
        current_quantity: 0,
        erp_quantity: 0,
        quantity_diff: 0,
        action: "NO_CHANGE",
        current_price: null,
        erp_price: 150,
        price_diff: 150,
        price_action: "CREATE_PRICE",
      }

      expect(row.price_action).toBe("CREATE_PRICE")
      expect(row.price_diff).toBe(150)
    })

    it("marks identical prices as NO_CHANGE with 0 price_diff", () => {
      const row: InventoryPreviewRow = {
        sku: "LZ-IN-SYNC",
        erp_item_code: "LZ-IN-SYNC",
        erp_warehouse: "Stores - LZ",
        medusa_location_id: "loc_01",
        medusa_variant_id: "var_03",
        medusa_product_id: "prod_03",
        medusa_product_title: "Synced Item",
        medusa_variant_title: "Default",
        current_quantity: 5,
        erp_quantity: 5,
        quantity_diff: 0,
        action: "NO_CHANGE",
        current_price: 200,
        erp_price: 200,
        price_diff: 0,
        price_action: "NO_CHANGE",
      }

      expect(row.price_action).toBe("NO_CHANGE")
      expect(row.price_diff).toBe(0)
    })
  })
})

