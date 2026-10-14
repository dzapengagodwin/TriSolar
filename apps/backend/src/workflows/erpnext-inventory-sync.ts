import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  updateInventoryLevelsWorkflow,
  createInventoryLevelsWorkflow,
  upsertVariantPricesWorkflow,
} from "@medusajs/medusa/core-flows"
import * as crypto from "crypto"
import { ERPNEXT_MODULE } from "../modules/erpnext"
import { ErpnextClient, ErpnextBin } from "../modules/erpnext/services/erpnext-client"
import {
  analyzeSkuAudit,
  MedusaVariantRecord,
} from "../modules/erpnext/services/sku-audit-service"

export type InventorySyncAction = "preview" | "execute"

export type ErpnextInventorySyncInput = {
  action: InventorySyncAction
  approvalToken?: string
  warehouseMappings?: Record<string, string> // ERP warehouse name -> Medusa stock location id
  baseUrl?: string
  apiKey?: string
  apiSecret?: string
  company?: string
  triggeredBy?: string
  syncPrices?: boolean
  priceList?: string
  currency?: string
  force?: boolean
}


export interface InventoryPreviewRow {
  sku: string
  erp_item_code: string
  erp_warehouse: string
  medusa_location_id: string
  medusa_variant_id: string
  medusa_product_id: string
  medusa_product_title: string
  medusa_variant_title: string
  current_quantity: number
  erp_quantity: number
  quantity_diff: number
  action: "UPDATE" | "CREATE" | "NO_CHANGE" | "UNMAPPED_WAREHOUSE" | "MISSING_INVENTORY_ITEM"
  current_price?: number | null
  erp_price?: number | null
  price_diff?: number | null
  price_action?: "UPDATE_PRICE" | "CREATE_PRICE" | "NO_CHANGE"
  price_id?: string | null
  reason?: string
}

export interface InventorySyncSummary {
  total_matched_items: number
  will_update: number
  will_create: number
  unchanged: number
  unmapped: number
  missing_inventory_items: number
  executed_updates: number
  executed_creates: number
  will_update_prices: number
  executed_price_updates: number
  failed: number
  approval_token?: string
  run_id?: string
  started_at: string
  completed_at?: string
}

export interface InventorySyncResult {
  action: InventorySyncAction
  summary: InventorySyncSummary
  previewRows?: InventoryPreviewRow[]
  logId?: string
}

export const runErpnextInventorySyncStep = createStep(
  "run-erpnext-inventory-sync",
  async (input: ErpnextInventorySyncInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const erpnextService = container.resolve(ERPNEXT_MODULE) as any

    const baseUrl = input.baseUrl || process.env.ERPNEXT_BASE_URL
    const apiKey = input.apiKey || process.env.ERPNEXT_API_KEY
    const apiSecret = input.apiSecret || process.env.ERPNEXT_API_SECRET

    if (!baseUrl || !apiKey || !apiSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "ERPNext configuration missing: baseUrl, apiKey, and apiSecret are required."
      )
    }

    // 1. Load settings and warehouse mappings
    let [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })
    if (!settings) {
      settings = await erpnextService.createErpnextSettings({
        default_company: process.env.ERPNEXT_DEFAULT_COMPANY || null,
        default_warehouse: process.env.ERPNEXT_DEFAULT_WAREHOUSE || null,
        warehouse_mappings: input.warehouseMappings || {},
        price_sync_enabled: true,
        erpnext_price_list: "Standard Selling",
        sync_currency: "usd",
      })
    }

    const warehouseMappings: Record<string, string> =
      input.warehouseMappings && Object.keys(input.warehouseMappings).length > 0
        ? input.warehouseMappings
        : (settings.warehouse_mappings as Record<string, string>) || {}

    if (Object.keys(warehouseMappings).length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No warehouse mappings configured. Please map at least one ERPNext warehouse to a Medusa stock location."
      )
    }

    const shouldSyncPrices = input.syncPrices ?? settings.price_sync_enabled ?? true
    const priceListName = input.priceList || settings.erpnext_price_list || "Standard Selling"
    const targetCurrency = (input.currency || settings.sync_currency || "usd").toLowerCase()

    // 2. Client & Fetch ERP items, Bins, and Prices
    const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
    const erpItems = await client.getAllItems()

    // Fetch bins for mapped warehouses
    const allBins: ErpnextBin[] = []
    const mappedErpWarehouses = Object.keys(warehouseMappings)
    for (const wh of mappedErpWarehouses) {
      const bins = await client.getAllBins({ warehouse: wh })
      allBins.push(...bins)
    }

    // Index bins: key = `${item_code}:::${warehouse}`
    const binMap = new Map<string, ErpnextBin>()
    for (const b of allBins) {
      binMap.set(`${b.item_code}:::${b.warehouse}`, b)
    }

    // Fetch ERP selling prices
    let erpPrices: any[] = []
    if (shouldSyncPrices) {
      try {
        erpPrices = await client.getAllItemPrices({ priceList: priceListName })
      } catch {
        erpPrices = []
      }
    }

    const erpPriceMap = new Map<string, number>()
    for (const p of erpPrices) {
      if (p.item_code) {
        erpPriceMap.set(p.item_code.trim(), Number(p.price_list_rate))
      }
    }

    // 3. Fetch Medusa Variants with inventory items, location levels, and prices
    const medusaVariants: MedusaVariantRecord[] = []
    const variantItemDetails = new Map<
      string,
      {
        product_id: string
        inventory_item_id: string | null
        locationLevels: Map<string, { id: string; stocked_quantity: number; reserved_quantity: number }>
        current_price: number | null
        price_id: string | null
      }
    >()

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
          "inventory_items.inventory.id",
          "inventory_items.inventory.location_levels.id",
          "inventory_items.inventory.location_levels.location_id",
          "inventory_items.inventory.location_levels.stocked_quantity",
          "inventory_items.inventory.location_levels.reserved_quantity",
        ],
        pagination: { skip: offset, take: pageSize },
      })

      const pageVariants = (data || []) as any[]
      for (const v of pageVariants) {
        let totalStock = 0
        const invItems = v.inventory_items || []
        const firstInvItem = invItems[0]
        const locationLevelsMap = new Map<
          string,
          { id: string; stocked_quantity: number; reserved_quantity: number }
        >()

        for (const ii of invItems) {
          const levels = ii.inventory?.location_levels || []
          for (const lvl of levels) {
            totalStock += lvl.stocked_quantity ?? 0
            if (lvl.location_id) {
              locationLevelsMap.set(lvl.location_id, {
                id: lvl.id,
                stocked_quantity: lvl.stocked_quantity ?? 0,
                reserved_quantity: lvl.reserved_quantity ?? 0,
              })
            }
          }
        }

        const prices = v.prices || []
        const matchedPrice = prices.find((p: any) => p.currency_code?.toLowerCase() === targetCurrency)
        const currentPrice = matchedPrice ? Number(matchedPrice.amount) : null
        const priceId = matchedPrice?.id || null

        medusaVariants.push({
          id: v.id,
          title: v.title || "",
          sku: v.sku || null,
          product_id: v.product_id || v.product?.id || "",
          product_title: v.product?.title || "",
          inventory_item_id: firstInvItem?.inventory_item_id || null,
          stocked_quantity: totalStock,
          current_price: currentPrice,
          price_id: priceId,
        })

        variantItemDetails.set(v.id, {
          product_id: v.product_id || v.product?.id || "",
          inventory_item_id: firstInvItem?.inventory_item_id || null,
          locationLevels: locationLevelsMap,
          current_price: currentPrice,
          price_id: priceId,
        })
      }

      variantCount = metadata?.count ?? offset + pageVariants.length
      offset += pageVariants.length
    } while (offset < variantCount && offset > 0)

    // 4. Audit to find MATCHED items
    const auditResult = analyzeSkuAudit(erpItems, medusaVariants, erpPriceMap)
    const matchedRecords = auditResult.records.filter((r) => r.status === "MATCHED")

    // 5. Build planned preview rows (both inventory and pricing)
    const previewRows: InventoryPreviewRow[] = []

    for (const matched of matchedRecords) {
      const details = variantItemDetails.get(matched.medusa_variant_id!)
      const invItemId = details?.inventory_item_id
      const currentPrice = details?.current_price ?? null
      const priceId = details?.price_id ?? null

      // Resolve ERP price
      const erpPrice = erpPriceMap.get(matched.sku) ?? (matched.erp_price ?? null)
      let priceAction: "UPDATE_PRICE" | "CREATE_PRICE" | "NO_CHANGE" = "NO_CHANGE"
      let priceDiff: number | null = null

      if (shouldSyncPrices && erpPrice !== null) {
        if (currentPrice === null) {
          priceAction = "CREATE_PRICE"
          priceDiff = erpPrice
        } else if (currentPrice !== erpPrice) {
          priceAction = "UPDATE_PRICE"
          priceDiff = Number((erpPrice - currentPrice).toFixed(2))
        } else {
          priceAction = "NO_CHANGE"
          priceDiff = 0
        }
      }

      for (const [erpWarehouse, medusaLocationId] of Object.entries(warehouseMappings)) {
        if (!invItemId) {
          previewRows.push({
            sku: matched.sku,
            erp_item_code: matched.erp_item_code!,
            erp_warehouse: erpWarehouse,
            medusa_location_id: medusaLocationId,
            medusa_variant_id: matched.medusa_variant_id!,
            medusa_product_id: matched.medusa_product_id!,
            medusa_product_title: matched.medusa_product_title || "",
            medusa_variant_title: matched.medusa_variant_title || "",
            current_quantity: 0,
            erp_quantity: 0,
            quantity_diff: 0,
            action: "MISSING_INVENTORY_ITEM",
            current_price: currentPrice,
            erp_price: erpPrice,
            price_diff: priceDiff,
            price_action: priceAction,
            price_id: priceId,
            reason: "Variant is not linked to a Medusa inventory item",
          })
          continue
        }

        const bin = binMap.get(`${matched.erp_item_code!}:::${erpWarehouse}`)
        const erpQty = bin ? Number(bin.actual_qty) : 0

        const level = details.locationLevels.get(medusaLocationId)

        if (!level) {
          // Level does not exist at this location yet -> CREATE
          previewRows.push({
            sku: matched.sku,
            erp_item_code: matched.erp_item_code!,
            erp_warehouse: erpWarehouse,
            medusa_location_id: medusaLocationId,
            medusa_variant_id: matched.medusa_variant_id!,
            medusa_product_id: matched.medusa_product_id!,
            medusa_product_title: matched.medusa_product_title || "",
            medusa_variant_title: matched.medusa_variant_title || "",
            current_quantity: 0,
            erp_quantity: erpQty,
            quantity_diff: erpQty,
            action: "CREATE",
            current_price: currentPrice,
            erp_price: erpPrice,
            price_diff: priceDiff,
            price_action: priceAction,
            price_id: priceId,
            reason: "Inventory level will be created at stock location",
          })
        } else {
          const currentQty = level.stocked_quantity
          if (currentQty === erpQty) {
            previewRows.push({
              sku: matched.sku,
              erp_item_code: matched.erp_item_code!,
              erp_warehouse: erpWarehouse,
              medusa_location_id: medusaLocationId,
              medusa_variant_id: matched.medusa_variant_id!,
              medusa_product_id: matched.medusa_product_id!,
              medusa_product_title: matched.medusa_product_title || "",
              medusa_variant_title: matched.medusa_variant_title || "",
              current_quantity: currentQty,
              erp_quantity: erpQty,
              quantity_diff: 0,
              action: "NO_CHANGE",
              current_price: currentPrice,
              erp_price: erpPrice,
              price_diff: priceDiff,
              price_action: priceAction,
              price_id: priceId,
              reason: "Stock already in sync",
            })
          } else {
            previewRows.push({
              sku: matched.sku,
              erp_item_code: matched.erp_item_code!,
              erp_warehouse: erpWarehouse,
              medusa_location_id: medusaLocationId,
              medusa_variant_id: matched.medusa_variant_id!,
              medusa_product_id: matched.medusa_product_id!,
              medusa_product_title: matched.medusa_product_title || "",
              medusa_variant_title: matched.medusa_variant_title || "",
              current_quantity: currentQty,
              erp_quantity: erpQty,
              quantity_diff: erpQty - currentQty,
              action: "UPDATE",
              current_price: currentPrice,
              erp_price: erpPrice,
              price_diff: priceDiff,
              price_action: priceAction,
              price_id: priceId,
              reason: `Stock adjustment: ${currentQty} -> ${erpQty}`,
            })
          }
        }
      }
    }

    const willUpdate = previewRows.filter((r) => r.action === "UPDATE").length
    const willCreate = previewRows.filter((r) => r.action === "CREATE").length
    const unchanged = previewRows.filter((r) => r.action === "NO_CHANGE").length
    const missingInv = previewRows.filter((r) => r.action === "MISSING_INVENTORY_ITEM").length

    // Price unique variants metric
    const uniqueVariantPrices = new Map<string, InventoryPreviewRow>()
    for (const r of previewRows) {
      if (!uniqueVariantPrices.has(r.medusa_variant_id)) {
        uniqueVariantPrices.set(r.medusa_variant_id, r)
      }
    }
    const priceRows = Array.from(uniqueVariantPrices.values())
    const willUpdatePrices = priceRows.filter(
      (r) => r.price_action === "UPDATE_PRICE" || r.price_action === "CREATE_PRICE"
    ).length

    // If PREVIEW: Return preview with newly issued approval token
    if (input.action === "preview") {
      const approvalToken = crypto.randomBytes(24).toString("hex")

      // Cache token in settings metadata for approval validation
      await erpnextService.updateErpnextSettings({
        id: settings.id,
        metadata: {
          ...(settings.metadata || {}),
          pending_approval_token: approvalToken,
          pending_approval_issued_at: new Date().toISOString(),
        },
      })

      const summary: InventorySyncSummary = {
        total_matched_items: matchedRecords.length,
        will_update: willUpdate,
        will_create: willCreate,
        unchanged,
        unmapped: 0,
        missing_inventory_items: missingInv,
        executed_updates: 0,
        executed_creates: 0,
        will_update_prices: willUpdatePrices,
        executed_price_updates: 0,
        failed: 0,
        approval_token: approvalToken,
        started_at: new Date().toISOString(),
      }

      return new StepResponse({
        action: "preview",
        summary,
        previewRows,
      } as InventorySyncResult)
    }

    // If EXECUTE: Validate approval token
    const pendingToken = settings.metadata?.pending_approval_token
    if (!input.approvalToken || input.approvalToken !== pendingToken) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Invalid or expired approval token. You must generate a preview and confirm with the provided approval token."
      )
    }

    // Check Mutex Lock
    const TEN_MINUTES_MS = 10 * 60 * 1000
    if (settings.is_sync_running && !input.force) {
      const lockTime = settings.sync_lock_acquired_at ? new Date(settings.sync_lock_acquired_at).getTime() : 0
      const lockAge = Date.now() - lockTime
      if (lockAge < TEN_MINUTES_MS) {
        throw new MedusaError(
          MedusaError.Types.CONFLICT,
          "Another synchronization run is currently active. Please wait for it to complete or reset the lock."
        )
      }
    }

    // Acquire lock
    const runId = crypto.randomUUID()
    const syncStartTime = new Date()

    await erpnextService.updateErpnextSettings({
      id: settings.id,
      is_sync_running: true,
      sync_lock_run_id: runId,
      sync_lock_acquired_at: syncStartTime,
    })

    let syncLog: any = null
    let executedUpdates = 0
    let executedCreates = 0
    let executedPriceUpdates = 0
    let failedCount = 0

    try {
      // Create durable sync log entry
      syncLog = await erpnextService.createErpnextSyncLogs({
        run_type: "sync",
        status: "in_progress",
        started_at: syncStartTime,
        triggered_by: input.triggeredBy || "admin",
        metadata: { runId },
      })

      // 1. Sync inventory levels in batches of 50
      const executableRows = previewRows.filter(
        (r) => r.action === "UPDATE" || r.action === "CREATE"
      )

      const CHUNK_SIZE = 50
      for (let i = 0; i < executableRows.length; i += CHUNK_SIZE) {
        const chunk = executableRows.slice(i, i + CHUNK_SIZE)

        for (const row of chunk) {
          const details = variantItemDetails.get(row.medusa_variant_id)
          const invItemId = details?.inventory_item_id

          if (!invItemId) {
            failedCount++
            if (syncLog?.id) {
              await erpnextService.createErpnextSyncItemLogs({
                sync_log_id: syncLog.id,
                sku: row.sku,
                erp_item_code: row.erp_item_code,
                medusa_variant_id: row.medusa_variant_id,
                medusa_product_id: row.medusa_product_id,
                location_id: row.medusa_location_id,
                erp_warehouse: row.erp_warehouse,
                status: "FAILED",
                previous_quantity: row.current_quantity,
                new_quantity: row.erp_quantity,
                previous_price: row.current_price,
                new_price: row.erp_price,
                error_message: "Missing linked inventory item ID",
              })
            }
            continue
          }

          try {
            if (row.action === "CREATE") {
              await createInventoryLevelsWorkflow(container).run({
                input: {
                  inventory_levels: [
                    {
                      inventory_item_id: invItemId,
                      location_id: row.medusa_location_id,
                      stocked_quantity: row.erp_quantity,
                    },
                  ],
                },
              })
              executedCreates++
              if (syncLog?.id) {
                await erpnextService.createErpnextSyncItemLogs({
                  sync_log_id: syncLog.id,
                  sku: row.sku,
                  erp_item_code: row.erp_item_code,
                  medusa_variant_id: row.medusa_variant_id,
                  medusa_product_id: row.medusa_product_id,
                  location_id: row.medusa_location_id,
                  erp_warehouse: row.erp_warehouse,
                  status: "CREATED",
                  previous_quantity: row.current_quantity,
                  new_quantity: row.erp_quantity,
                  previous_price: row.current_price,
                  new_price: row.erp_price,
                })
              }
            } else if (row.action === "UPDATE") {
              const level = details?.locationLevels.get(row.medusa_location_id)
              await updateInventoryLevelsWorkflow(container).run({
                input: {
                  updates: [
                    {
                      id: level?.id,
                      inventory_item_id: invItemId,
                      location_id: row.medusa_location_id,
                      stocked_quantity: row.erp_quantity,
                    },
                  ],
                },
              })
              executedUpdates++
              if (syncLog?.id) {
                await erpnextService.createErpnextSyncItemLogs({
                  sync_log_id: syncLog.id,
                  sku: row.sku,
                  erp_item_code: row.erp_item_code,
                  medusa_variant_id: row.medusa_variant_id,
                  medusa_product_id: row.medusa_product_id,
                  location_id: row.medusa_location_id,
                  erp_warehouse: row.erp_warehouse,
                  status: "UPDATED",
                  previous_quantity: row.current_quantity,
                  new_quantity: row.erp_quantity,
                  previous_price: row.current_price,
                  new_price: row.erp_price,
                })
              }
            }
          } catch (itemErr: any) {
            failedCount++
            if (syncLog?.id) {
              await erpnextService.createErpnextSyncItemLogs({
                sync_log_id: syncLog.id,
                sku: row.sku,
                erp_item_code: row.erp_item_code,
                medusa_variant_id: row.medusa_variant_id,
                medusa_product_id: row.medusa_product_id,
                location_id: row.medusa_location_id,
                erp_warehouse: row.erp_warehouse,
                status: "FAILED",
                previous_quantity: row.current_quantity,
                new_quantity: row.erp_quantity,
                previous_price: row.current_price,
                new_price: row.erp_price,
                error_message: itemErr.message || "Failed to update inventory level",
              })
            }
          }
        }
      }

      // Log skipped items (missing inventory items or unmapped warehouses)
      const skippedRows = previewRows.filter(
        (r) => r.action === "MISSING_INVENTORY_ITEM" || r.action === "UNMAPPED_WAREHOUSE"
      )
      for (const row of skippedRows) {
        if (syncLog?.id) {
          await erpnextService.createErpnextSyncItemLogs({
            sync_log_id: syncLog.id,
            sku: row.sku,
            erp_item_code: row.erp_item_code,
            medusa_variant_id: row.medusa_variant_id,
            medusa_product_id: row.medusa_product_id,
            location_id: row.medusa_location_id,
            erp_warehouse: row.erp_warehouse,
            status: "SKIPPED",
            previous_quantity: row.current_quantity,
            new_quantity: row.erp_quantity,
            previous_price: row.current_price,
            new_price: row.erp_price,
            error_message: row.reason || "Skipped inventory level update",
          })
        }
      }

      // 2. Sync prices if price_sync_enabled is true
      if (shouldSyncPrices) {
        const priceUpdateCandidates = priceRows.filter(
          (r) =>
            r.erp_price !== null &&
            (r.price_action === "UPDATE_PRICE" || r.price_action === "CREATE_PRICE")
        )

        for (const pr of priceUpdateCandidates) {
          try {
            await upsertVariantPricesWorkflow(container).run({
              input: {
                variantPrices: [
                  {
                    variant_id: pr.medusa_variant_id,
                    product_id: pr.medusa_product_id,
                    prices: [
                      {
                        id: pr.price_id || undefined,
                        amount: pr.erp_price!,
                        currency_code: targetCurrency,
                      },
                    ],
                  },
                ],
                previousVariantIds: [pr.medusa_variant_id],
              },
            })
            executedPriceUpdates++
            if (syncLog?.id) {
              await erpnextService.createErpnextSyncItemLogs({
                sync_log_id: syncLog.id,
                sku: pr.sku,
                erp_item_code: pr.erp_item_code,
                medusa_variant_id: pr.medusa_variant_id,
                medusa_product_id: pr.medusa_product_id,
                location_id: pr.medusa_location_id,
                erp_warehouse: pr.erp_warehouse,
                status: pr.price_action === "CREATE_PRICE" ? "PRICE_CREATED" : "PRICE_UPDATED",
                previous_quantity: pr.current_quantity,
                new_quantity: pr.erp_quantity,
                previous_price: pr.current_price,
                new_price: pr.erp_price,
              })
            }
          } catch (prErr: any) {
            failedCount++
            console.warn(`[ERPNext Price Sync] Failed to update price for variant ${pr.medusa_variant_id}:`, prErr.message)
            if (syncLog?.id) {
              await erpnextService.createErpnextSyncItemLogs({
                sync_log_id: syncLog.id,
                sku: pr.sku,
                erp_item_code: pr.erp_item_code,
                medusa_variant_id: pr.medusa_variant_id,
                medusa_product_id: pr.medusa_product_id,
                location_id: pr.medusa_location_id,
                erp_warehouse: pr.erp_warehouse,
                status: "PRICE_FAILED",
                previous_quantity: pr.current_quantity,
                new_quantity: pr.erp_quantity,
                previous_price: pr.current_price,
                new_price: pr.erp_price,
                error_message: prErr.message || "Failed to update price",
              })
            }
          }
        }
      }

      const completedAt = new Date()
      const syncSummary: InventorySyncSummary = {
        total_matched_items: matchedRecords.length,
        will_update: willUpdate,
        will_create: willCreate,
        unchanged,
        unmapped: 0,
        missing_inventory_items: missingInv,
        executed_updates: executedUpdates,
        executed_creates: executedCreates,
        will_update_prices: willUpdatePrices,
        executed_price_updates: executedPriceUpdates,
        failed: failedCount,
        run_id: runId,
        started_at: syncStartTime.toISOString(),
        completed_at: completedAt.toISOString(),
      }

      const anySuccess = executedUpdates > 0 || executedCreates > 0 || executedPriceUpdates > 0
      const finalStatus =
        failedCount > 0 && !anySuccess ? "failed" : failedCount > 0 ? "partial" : "completed"

      // Update sync log
      if (syncLog?.id) {
        await erpnextService.updateErpnextSyncLogs({
          id: syncLog.id,
          status: finalStatus,
          completed_at: completedAt,
          summary: syncSummary,
        })
      }

      // Release lock and update settings
      await erpnextService.updateErpnextSettings({
        id: settings.id,
        is_sync_running: false,
        sync_lock_run_id: null,
        sync_lock_acquired_at: null,
        last_sync_at: completedAt,
        last_sync_summary: syncSummary,
        metadata: {
          ...(settings.metadata || {}),
          pending_approval_token: null,
        },
      })

      return new StepResponse({
        action: "execute",
        summary: syncSummary,
        logId: syncLog?.id,
      } as InventorySyncResult)
    } catch (fatalErr: any) {
      // In case of fatal error, release lock reliably
      try {
        await erpnextService.updateErpnextSettings({
          id: settings.id,
          is_sync_running: false,
          sync_lock_run_id: null,
          sync_lock_acquired_at: null,
        })
      } catch (unlockErr: any) {
        console.error("[ERPNext Sync] Failed to release lock in catch block:", unlockErr?.message)
      }

      if (syncLog?.id) {
        try {
          await erpnextService.updateErpnextSyncLogs({
            id: syncLog.id,
            status: "failed",
            completed_at: new Date(),
            error_message: fatalErr.message,
          })
        } catch (logErr: any) {
          console.error("[ERPNext Sync] Failed to update sync log in catch block:", logErr?.message)
        }
      }

      throw fatalErr
    }
  }
)

export const erpnextInventorySyncWorkflow = createWorkflow(
  "erpnext-inventory-sync",
  (input: ErpnextInventorySyncInput) => {
    const result = runErpnextInventorySyncStep(input)
    return new WorkflowResponse(result)
  }
)
