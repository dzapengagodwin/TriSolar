import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, CheckCircle, ExclamationCircle, InformationCircle, ArrowDownTray } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Label,
  StatusBadge,
  Prompt,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type ActiveTab = "overview" | "audit" | "sync" | "history"

interface WarehouseMapping {
  [erpWarehouse: string]: string // erpWarehouse -> medusaLocationId
}

interface ErpWarehouse {
  name: string
  warehouse_name?: string
  company?: string
}

interface MedusaStockLocation {
  id: string
  name: string
}

interface SkuAuditRecord {
  sku: string
  status:
    | "MATCHED"
    | "ERP_ONLY"
    | "MEDUSA_ONLY"
    | "DUPLICATE_ERP_SKU"
    | "DUPLICATE_MEDUSA_SKU"
    | "MISSING_SKU"
    | "INVALID_OR_UNAVAILABLE_ITEM"
  erp_item_code: string | null
  erp_item_name: string | null
  erp_is_stock: boolean | null
  erp_disabled: boolean | null
  medusa_product_id: string | null
  medusa_product_title: string | null
  medusa_variant_id: string | null
  medusa_variant_title: string | null
  medusa_stock?: number | null
  erp_price?: number | null
  medusa_price?: number | null
  price_diff?: number | null
  notes?: string
}

interface SkuAuditSummary {
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

interface PreviewRow {
  sku: string
  erp_item_code: string
  erp_warehouse: string
  medusa_location_id: string
  medusa_variant_id: string
  medusa_product_id?: string
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
  reason?: string
}

interface SyncSummary {
  total_matched_items: number
  will_update: number
  will_create: number
  unchanged: number
  unmapped: number
  missing_inventory_items: number
  executed_updates: number
  executed_creates: number
  will_update_prices?: number
  executed_price_updates?: number
  failed: number
  approval_token?: string
  run_id?: string
  started_at: string
  completed_at?: string
}

interface SyncLogItem {
  id: string
  run_type: string
  status: string
  started_at: string
  completed_at?: string
  triggered_by?: string
  summary?: any
  error_message?: string
}

interface SyncItemLog {
  id: string
  sku: string
  erp_item_code: string
  status: string
  previous_quantity: number
  new_quantity: number
  previous_price?: number | null
  new_price?: number | null
  error_message?: string
}

const ErpnextSyncAdminPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview")

  // Overview / Settings State
  const [hasEnvConfig, setHasEnvConfig] = useState(false)
  const [configuredBaseUrl, setConfiguredBaseUrl] = useState("")
  const [defaultCompany, setDefaultCompany] = useState("")
  const [defaultWarehouse, setDefaultWarehouse] = useState("")
  const [warehouseMappings, setWarehouseMappings] = useState<WarehouseMapping>({})
  const [erpWarehouses, setErpWarehouses] = useState<ErpWarehouse[]>([])
  const [medusaLocations, setMedusaLocations] = useState<MedusaStockLocation[]>([])
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionMessage, setConnectionMessage] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  // Price Sync & Sales Order Settings State
  const [priceSyncEnabled, setPriceSyncEnabled] = useState(true)
  const [erpnextPriceList, setErpnextPriceList] = useState("Standard Selling")
  const [syncCurrency, setSyncCurrency] = useState("usd")
  const [autoCreateSalesOrder, setAutoCreateSalesOrder] = useState(true)
  const [salesOrderPrintFormat, setSalesOrderPrintFormat] = useState("Standard")

  // Audit State
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSummary, setAuditSummary] = useState<SkuAuditSummary | null>(null)
  const [auditRecords, setAuditRecords] = useState<SkuAuditRecord[]>([])
  const [auditFilter, setAuditFilter] = useState<string>("ALL")
  const [auditSearch, setAuditSearch] = useState("")

  // Sync State
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null)
  const [approvalToken, setApprovalToken] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmInput, setConfirmInput] = useState("")
  const [executingSync, setExecutingSync] = useState(false)

  // History State
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([])
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [selectedItemLogs, setSelectedItemLogs] = useState<SyncItemLog[]>([])
  const [loadingLogDetails, setLoadingLogDetails] = useState(false)

  // Fetch Settings & Warehouses
  const loadSettingsAndWarehouses = useCallback(async () => {
    try {
      const settingsRes = await fetch("/admin/erpnext/settings")
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setHasEnvConfig(data.hasEnvConfig)
        setConfiguredBaseUrl(data.configuredBaseUrl || "")
        setDefaultCompany(data.defaultCompany || "")
        setDefaultWarehouse(data.defaultWarehouse || "")
        setWarehouseMappings(data.warehouseMappings || {})
        setPriceSyncEnabled(data.priceSyncEnabled ?? true)
        setErpnextPriceList(data.erpnextPriceList || "Standard Selling")
        setSyncCurrency(data.syncCurrency || "usd")
        setAutoCreateSalesOrder(data.autoCreateSalesOrder ?? true)
        setSalesOrderPrintFormat(data.salesOrderPrintFormat || "Standard")
        if (data.settings?.last_audit_summary) {
          setAuditSummary(data.settings.last_audit_summary)
        }
      }

      const whRes = await fetch("/admin/erpnext/warehouses")
      if (whRes.ok) {
        const whData = await whRes.json()
        setErpWarehouses(whData.erpWarehouses || [])
        setMedusaLocations(whData.medusaStockLocations || [])
      }
    } catch {
      // Quiet fail if initial load error
    }
  }, [])

  // Fetch Sync Logs
  const loadSyncLogs = useCallback(async () => {
    try {
      const res = await fetch("/admin/erpnext/logs?limit=20")
      if (res.ok) {
        const data = await res.json()
        setSyncLogs(data.syncLogs || [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadSettingsAndWarehouses()
    loadSyncLogs()
  }, [loadSettingsAndWarehouses, loadSyncLogs])

  // Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionMessage("")
    try {
      const res = await fetch("/admin/erpnext/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setConnectionStatus("success")
        setConnectionMessage(data.message || "Connection successful")
        toast.success("ERPNext Connection", {
          description: data.message || "Successfully connected to ERPNext",
        })
      } else {
        setConnectionStatus("error")
        setConnectionMessage(data.message || "Connection failed")
        toast.error("ERPNext Connection Failed", {
          description: data.message || "Could not connect to ERPNext",
        })
      }
    } catch (err: any) {
      setConnectionStatus("error")
      setConnectionMessage(err.message || "Network error")
      toast.error("Connection Error", { description: err.message })
    } finally {
      setTestingConnection(false)
    }
  }

  // Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/admin/erpnext/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          default_company: defaultCompany,
          default_warehouse: defaultWarehouse,
          warehouse_mappings: warehouseMappings,
          price_sync_enabled: priceSyncEnabled,
          erpnext_price_list: erpnextPriceList,
          sync_currency: syncCurrency,
          auto_create_sales_order: autoCreateSalesOrder,
          sales_order_print_format: salesOrderPrintFormat,
        }),
      })
      if (res.ok) {
        toast.success("Settings Saved", { description: "Settings and warehouse mappings updated." })
      } else {
        const err = await res.json()
        toast.error("Save Failed", { description: err.error || "Could not save settings." })
      }
    } catch (err: any) {
      toast.error("Save Error", { description: err.message })
    } finally {
      setSavingSettings(false)
    }
  }

  // Run SKU Audit
  const handleRunAudit = async () => {
    setAuditLoading(true)
    try {
      const res = await fetch("/admin/erpnext/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const data = await res.json()
        setAuditSummary(data.summary)
        setAuditRecords(data.records || [])
        toast.success("SKU Audit Completed", {
          description: `Processed ${data.summary.matched} matched items out of ${data.summary.total_erp_items} ERP items.`,
        })
      } else {
        const err = await res.json()
        toast.error("Audit Failed", { description: err.error || "Failed to execute SKU audit." })
      }
    } catch (err: any) {
      toast.error("Audit Error", { description: err.message })
    } finally {
      setAuditLoading(false)
    }
  }

  // Export CSV
  const handleExportCsv = () => {
    window.open("/admin/erpnext/audit/export", "_blank")
  }

  // Filtered Audit Records
  const filteredAuditRecords = useMemo(() => {
    let list = auditRecords
    if (auditFilter !== "ALL") {
      list = list.filter((r) => r.status === auditFilter)
    }
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.sku.toLowerCase().includes(q) ||
          (r.erp_item_code && r.erp_item_code.toLowerCase().includes(q)) ||
          (r.erp_item_name && r.erp_item_name.toLowerCase().includes(q)) ||
          (r.medusa_product_title && r.medusa_product_title.toLowerCase().includes(q))
      )
    }
    return list
  }, [auditRecords, auditFilter, auditSearch])

  // Run Inventory Preview
  const handleRunPreview = async () => {
    setPreviewLoading(true)
    setPreviewRows([])
    setSyncSummary(null)
    setApprovalToken(null)
    try {
      const res = await fetch("/admin/erpnext/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview" }),
      })
      const data = await res.json()
      if (res.ok) {
        setPreviewRows(data.previewRows || [])
        setSyncSummary(data.summary)
        setApprovalToken(data.summary.approval_token || null)
        toast.success("Preview Generated", {
          description: `${data.summary.will_update} updates and ${data.summary.will_create} creates planned.`,
        })
      } else {
        toast.error("Preview Failed", { description: data.error || "Failed to generate preview." })
      }
    } catch (err: any) {
      toast.error("Preview Error", { description: err.message })
    } finally {
      setPreviewLoading(false)
    }
  }

  // Execute Confirmed Sync
  const handleExecuteSync = async () => {
    if (!approvalToken) return
    setExecutingSync(true)
    try {
      const res = await fetch("/admin/erpnext/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          approvalToken,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Inventory Sync Successful", {
          description: `Applied ${data.summary.executed_updates} updates and ${data.summary.executed_creates} creates.`,
        })
        setConfirmOpen(false)
        setConfirmInput("")
        setApprovalToken(null)
        setPreviewRows([])
        loadSyncLogs()
      } else {
        toast.error("Sync Failed", { description: data.error || "Execution failed." })
      }
    } catch (err: any) {
      toast.error("Execution Error", { description: err.message })
    } finally {
      setExecutingSync(false)
    }
  }

  // View Item Logs for a run
  const handleViewLogDetails = async (logId: string) => {
    setSelectedLogId(logId)
    setLoadingLogDetails(true)
    try {
      const res = await fetch(`/admin/erpnext/logs?syncLogId=${logId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedItemLogs(data.itemLogs || [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogDetails(false)
    }
  }

  return (
    <Container className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ui-border-base gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base">
              ERPNext Inventory Integration
            </Heading>
            <StatusBadge color={hasEnvConfig ? "green" : "orange"}>
              {hasEnvConfig ? "Configured" : "Credentials Required"}
            </StatusBadge>
          </div>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            SKU-first exact matching, read-only SKU audits, and approved inventory-only synchronization.
          </Text>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-ui-bg-subtle p-1 rounded-lg border border-ui-border-base gap-1">
          <Button
            size="small"
            variant={activeTab === "overview" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Settings
          </Button>
          <Button
            size="small"
            variant={activeTab === "audit" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("audit")}
          >
            SKU Audit
          </Button>
          <Button
            size="small"
            variant={activeTab === "sync" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("sync")}
          >
            Inventory Sync
          </Button>
          <Button
            size="small"
            variant={activeTab === "history" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("history")}
          >
            Sync History
          </Button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SETTINGS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Connection Card */}
          <div className="bg-ui-bg-subtle p-5 rounded-lg border border-ui-border-base space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Heading level="h2" className="text-base font-medium text-ui-fg-base">
                  ERPNext Connection Status
                </Heading>
                <Text className="text-sm text-ui-fg-subtle">
                  Connection target: <code className="text-xs bg-ui-bg-base px-1.5 py-0.5 rounded">{configuredBaseUrl || "Not set in environment"}</code>
                </Text>
              </div>
              <Button
                size="small"
                variant="secondary"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>
            </div>

            {connectionStatus !== "idle" && (
              <div
                className={clx(
                  "p-3 rounded-md text-sm flex items-center gap-2",
                  connectionStatus === "success"
                    ? "bg-ui-bg-base text-ui-fg-interactive border border-ui-border-base"
                    : "bg-ui-bg-base text-ui-fg-error border border-ui-border-error"
                )}
              >
                {connectionStatus === "success" ? (
                  <CheckCircle className="w-5 h-5 text-ui-fg-interactive" />
                ) : (
                  <ExclamationCircle className="w-5 h-5 text-ui-fg-error" />
                )}
                <span>{connectionMessage}</span>
              </div>
            )}
          </div>

          {/* Warehouse Mappings Card */}
          <div className="bg-ui-bg-subtle p-5 rounded-lg border border-ui-border-base space-y-4">
            <div>
              <Heading level="h2" className="text-base font-medium text-ui-fg-base">
                Warehouse to Stock Location Mapping
              </Heading>
              <Text className="text-sm text-ui-fg-subtle">
                Associate ERPNext active warehouses with Medusa stock locations. Only mapped locations are eligible for stock updates.
              </Text>
            </div>

            {erpWarehouses.length === 0 ? (
              <div className="p-4 bg-ui-bg-base rounded border border-ui-border-base text-sm text-ui-fg-muted">
                No ERPNext warehouses discovered yet. Ensure connection settings are configured and test connection above.
              </div>
            ) : (
              <div className="space-y-3">
                {erpWarehouses.map((wh) => {
                  const mappedLocationId = warehouseMappings[wh.name] || ""
                  return (
                    <div
                      key={wh.name}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-ui-bg-base rounded border border-ui-border-base gap-3"
                    >
                      <div>
                        <Text className="font-medium text-sm text-ui-fg-base">{wh.name}</Text>
                        <Text className="text-xs text-ui-fg-muted">Company: {wh.company || "Default"}</Text>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label size="small" className="text-xs text-ui-fg-subtle">
                          Maps to Stock Location:
                        </Label>
                        <select
                          value={mappedLocationId}
                          onChange={(e) => {
                            const val = e.target.value
                            setWarehouseMappings((prev) => {
                              const updated = { ...prev }
                              if (val) {
                                updated[wh.name] = val
                              } else {
                                delete updated[wh.name]
                              }
                              return updated
                            })
                          }}
                          className="text-xs bg-ui-bg-subtle border border-ui-border-base rounded px-2 py-1 text-ui-fg-base"
                        >
                          <option value="">-- Do Not Sync --</option>
                          {medusaLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name} ({loc.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}

                <div className="flex justify-end pt-2">
                  <Button
                    size="small"
                    variant="primary"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                  >
                    {savingSettings ? "Saving..." : "Save Mappings"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Price Sync & Sales Orders Card */}
          <div className="bg-ui-bg-subtle p-5 rounded-lg border border-ui-border-base space-y-4">
            <div>
              <Heading level="h2" className="text-base font-medium text-ui-fg-base">
                Price Synchronization & Sales Orders
              </Heading>
              <Text className="text-sm text-ui-fg-subtle">
                Configure ERPNext as the single source of truth for pricing and enable automated Sales Order PDF generation upon checkout.
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Sync Section */}
              <div className="p-4 bg-ui-bg-base rounded border border-ui-border-base space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="priceSyncEnabled"
                    checked={priceSyncEnabled}
                    onChange={(e) => setPriceSyncEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-ui-fg-interactive border-ui-border-base cursor-pointer"
                  />
                  <Label htmlFor="priceSyncEnabled" className="text-sm font-medium text-ui-fg-base cursor-pointer">
                    Sync Prices from ERPNext
                  </Label>
                </div>
                <Text className="text-xs text-ui-fg-muted">
                  When enabled, exact SKU matches will synchronize selling rates from the designated ERPNext price list.
                </Text>

                <div className="space-y-1.5 pt-2">
                  <Label size="small" className="text-xs text-ui-fg-subtle">
                    ERPNext Price List
                  </Label>
                  <Input
                    size="small"
                    placeholder="Standard Selling"
                    value={erpnextPriceList}
                    onChange={(e) => setErpnextPriceList(e.target.value)}
                    disabled={!priceSyncEnabled}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label size="small" className="text-xs text-ui-fg-subtle">
                    Sync Currency (ISO code)
                  </Label>
                  <Input
                    size="small"
                    placeholder="usd"
                    value={syncCurrency}
                    onChange={(e) => setSyncCurrency(e.target.value)}
                    disabled={!priceSyncEnabled}
                  />
                </div>
              </div>

              {/* Sales Orders Section */}
              <div className="p-4 bg-ui-bg-base rounded border border-ui-border-base space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCreateSalesOrder"
                    checked={autoCreateSalesOrder}
                    onChange={(e) => setAutoCreateSalesOrder(e.target.checked)}
                    className="w-4 h-4 rounded text-ui-fg-interactive border-ui-border-base cursor-pointer"
                  />
                  <Label htmlFor="autoCreateSalesOrder" className="text-sm font-medium text-ui-fg-base cursor-pointer">
                    Auto-create Sales Order & Download PDF
                  </Label>
                </div>
                <Text className="text-xs text-ui-fg-muted">
                  Automatically generates a Sales Order in ERPNext when orders are placed in Medusa and archives the official Frappe PDF.
                </Text>

                <div className="space-y-1.5 pt-2">
                  <Label size="small" className="text-xs text-ui-fg-subtle">
                    ERPNext Print Format
                  </Label>
                  <Input
                    size="small"
                    placeholder="Standard"
                    value={salesOrderPrintFormat}
                    onChange={(e) => setSalesOrderPrintFormat(e.target.value)}
                    disabled={!autoCreateSalesOrder}
                  />
                </div>

                <div className="pt-2">
                  <Text className="text-xs text-ui-fg-muted">
                    Sales orders and downloadable PDFs are accessible per-order in the Medusa Admin Order Details side widget.
                  </Text>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="small"
                variant="primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKU AUDIT */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
                Read-Only SKU Matching Audit
              </Heading>
              <Text className="text-sm text-ui-fg-subtle">
                Zero database writes. Matches exact case-sensitive trimmed SKUs between ERPNext and Medusa variants.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={handleExportCsv}
                disabled={auditRecords.length === 0}
              >
                <ArrowDownTray className="w-4 h-4 mr-1" />
                Download CSV
              </Button>
              <Button
                size="small"
                variant="primary"
                onClick={handleRunAudit}
                disabled={auditLoading}
              >
                {auditLoading ? "Auditing..." : "Run SKU Audit"}
              </Button>
            </div>
          </div>

          {/* Audit Metric Badges */}
          {auditSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">ERP Items</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{auditSummary.total_erp_items}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">Medusa Variants</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{auditSummary.total_medusa_variants}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-interactive">Matched</Text>
                <Text className="text-xl font-bold text-ui-fg-interactive">{auditSummary.matched}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">ERP Only</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{auditSummary.erp_only}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">Medusa Only</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{auditSummary.medusa_only}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-error">Duplicates</Text>
                <Text className="text-xl font-bold text-ui-fg-error">
                  {auditSummary.duplicate_erp_sku + auditSummary.duplicate_medusa_sku}
                </Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">Missing SKU</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{auditSummary.missing_sku}</Text>
              </div>
            </div>
          )}

          {/* Audit Filters and Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: "All", val: "ALL" },
                { label: "Matched", val: "MATCHED" },
                { label: "ERP Only", val: "ERP_ONLY" },
                { label: "Medusa Only", val: "MEDUSA_ONLY" },
                { label: "ERP Duplicates", val: "DUPLICATE_ERP_SKU" },
                { label: "Medusa Duplicates", val: "DUPLICATE_MEDUSA_SKU" },
                { label: "Missing SKU", val: "MISSING_SKU" },
                { label: "Ineligible", val: "INVALID_OR_UNAVAILABLE_ITEM" },
              ].map((f) => (
                <Button
                  key={f.val}
                  size="small"
                  variant={auditFilter === f.val ? "secondary" : "transparent"}
                  onClick={() => setAuditFilter(f.val)}
                  className="text-xs"
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <Input
              placeholder="Search by SKU or Title..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-64"
            />
          </div>

          {/* Audit Table */}
          <div className="border border-ui-border-base rounded-lg overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>ERP Item Code</Table.HeaderCell>
                  <Table.HeaderCell>ERP Name</Table.HeaderCell>
                  <Table.HeaderCell>Medusa Product</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Stock</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">ERP Price</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Medusa Price</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Price Diff</Table.HeaderCell>
                  <Table.HeaderCell>Notes</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAuditRecords.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={10} className="text-center py-6 text-ui-fg-muted text-sm">
                      {auditRecords.length === 0
                        ? 'Click "Run SKU Audit" to inspect product alignment.'
                        : "No records matching current filters."}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredAuditRecords.slice(0, 100).map((r, idx) => (
                    <Table.Row key={`${r.sku}-${idx}`}>
                      <Table.Cell>
                        <Badge
                          color={
                            r.status === "MATCHED"
                              ? "green"
                              : r.status === "ERP_ONLY"
                              ? "blue"
                              : r.status === "MEDUSA_ONLY"
                              ? "orange"
                              : r.status.includes("DUPLICATE")
                              ? "red"
                              : "grey"
                          }
                          size="small"
                        >
                          {r.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="font-mono text-xs font-medium">{r.sku}</Table.Cell>
                      <Table.Cell className="font-mono text-xs">{r.erp_item_code || "—"}</Table.Cell>
                      <Table.Cell className="text-xs truncate max-w-xs">{r.erp_item_name || "—"}</Table.Cell>
                      <Table.Cell className="text-xs truncate max-w-xs">{r.medusa_product_title || "—"}</Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {r.medusa_stock !== null && r.medusa_stock !== undefined ? r.medusa_stock : "—"}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {r.erp_price !== null && r.erp_price !== undefined ? `$${Number(r.erp_price).toFixed(2)}` : "—"}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {r.medusa_price !== null && r.medusa_price !== undefined ? `$${Number(r.medusa_price).toFixed(2)}` : "—"}
                      </Table.Cell>
                      <Table.Cell
                        className={clx(
                          "text-xs text-right font-mono font-medium",
                          r.price_diff !== null && r.price_diff !== undefined && r.price_diff > 0
                            ? "text-ui-fg-interactive"
                            : r.price_diff !== null && r.price_diff !== undefined && r.price_diff < 0
                            ? "text-ui-fg-error"
                            : "text-ui-fg-muted"
                        )}
                      >
                        {r.price_diff !== null && r.price_diff !== undefined
                          ? r.price_diff > 0
                            ? `+$${r.price_diff.toFixed(2)}`
                            : r.price_diff < 0
                            ? `-$${Math.abs(r.price_diff).toFixed(2)}`
                            : "$0.00"
                          : "—"}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-subtle">{r.notes}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
          {filteredAuditRecords.length > 100 && (
            <Text className="text-xs text-ui-fg-muted text-right">
              Showing first 100 of {filteredAuditRecords.length} records. Download CSV for full dataset.
            </Text>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY SYNC */}
      {activeTab === "sync" && (
        <div className="space-y-6">
          {/* Safeguard Alert */}
          <div className="p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base flex items-start gap-3">
            <InformationCircle className="w-5 h-5 text-ui-fg-interactive shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <Text className="font-medium text-ui-fg-base">Inventory-Only Synchronization Guard</Text>
              <Text className="text-ui-fg-subtle">
                This process modifies inventory levels exclusively for exact SKU matches. It will never create products or variants,
                and never modifies titles, descriptions, prices, categories, handles, or SEO records. An explicit confirmation gate
                is enforced prior to applying changes.
              </Text>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
                Stock Synchronization Preview
              </Heading>
              <Text className="text-sm text-ui-fg-subtle">
                Inspect calculated adjustments against mapped warehouses before confirmation.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={handleRunPreview}
                disabled={previewLoading}
              >
                {previewLoading ? "Generating Preview..." : "Generate Preview"}
              </Button>

              <Button
                size="small"
                variant="primary"
                onClick={() => setConfirmOpen(true)}
                disabled={!approvalToken || previewRows.length === 0}
              >
                Approve & Execute Sync
              </Button>
            </div>
          </div>

          {/* Preview Metrics */}
          {syncSummary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">Matched SKU Candidates</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{syncSummary.total_matched_items}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-interactive">Will Update Stock</Text>
                <Text className="text-xl font-bold text-ui-fg-interactive">{syncSummary.will_update}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-interactive">Will Create Level</Text>
                <Text className="text-xl font-bold text-ui-fg-interactive">{syncSummary.will_create}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-interactive">Will Update Prices</Text>
                <Text className="text-xl font-bold text-ui-fg-interactive">{syncSummary.will_update_prices ?? 0}</Text>
              </div>
              <div className="p-3 bg-ui-bg-subtle rounded border border-ui-border-base">
                <Text className="text-xs text-ui-fg-subtle">Unchanged (In Sync)</Text>
                <Text className="text-xl font-bold text-ui-fg-base">{syncSummary.unchanged}</Text>
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-ui-border-base rounded-lg overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Stock Action</Table.HeaderCell>
                  <Table.HeaderCell>Price Action</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>ERP Warehouse</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Stock (Cur → ERP)</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Stock Diff</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Price (Cur → ERP)</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Price Diff</Table.HeaderCell>
                  <Table.HeaderCell>Details</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {previewRows.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={10} className="text-center py-6 text-ui-fg-muted text-sm">
                      {previewLoading
                        ? "Calculating preview diffs..."
                        : 'Click "Generate Preview" to inspect proposed inventory modifications.'}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  previewRows.map((r, i) => (
                    <Table.Row key={`${r.sku}-${i}`}>
                      <Table.Cell>
                        <Badge
                          color={
                            r.action === "UPDATE"
                              ? "blue"
                              : r.action === "CREATE"
                              ? "green"
                              : r.action === "NO_CHANGE"
                              ? "grey"
                              : "red"
                          }
                          size="small"
                        >
                          {r.action}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            r.price_action === "UPDATE_PRICE"
                              ? "blue"
                              : r.price_action === "CREATE_PRICE"
                              ? "green"
                              : "grey"
                          }
                          size="small"
                        >
                          {r.price_action || "NO_CHANGE"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="font-mono text-xs">{r.sku}</Table.Cell>
                      <Table.Cell className="text-xs">{r.medusa_product_title}</Table.Cell>
                      <Table.Cell className="text-xs">{r.erp_warehouse}</Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {r.current_quantity} → {r.erp_quantity}
                      </Table.Cell>
                      <Table.Cell
                        className={clx(
                          "text-xs text-right font-mono",
                          r.quantity_diff > 0
                            ? "text-ui-fg-interactive"
                            : r.quantity_diff < 0
                            ? "text-ui-fg-error"
                            : "text-ui-fg-muted"
                        )}
                      >
                        {r.quantity_diff > 0 ? `+${r.quantity_diff}` : r.quantity_diff}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {r.erp_price !== null && r.erp_price !== undefined
                          ? `$${(r.current_price ?? 0).toFixed(2)} → $${r.erp_price.toFixed(2)}`
                          : "—"}
                      </Table.Cell>
                      <Table.Cell
                        className={clx(
                          "text-xs text-right font-mono",
                          r.price_diff !== null && r.price_diff !== undefined && r.price_diff > 0
                            ? "text-ui-fg-interactive"
                            : r.price_diff !== null && r.price_diff !== undefined && r.price_diff < 0
                            ? "text-ui-fg-error"
                            : "text-ui-fg-muted"
                        )}
                      >
                        {r.price_diff !== null && r.price_diff !== undefined
                          ? r.price_diff > 0
                            ? `+$${r.price_diff.toFixed(2)}`
                            : r.price_diff < 0
                            ? `-$${Math.abs(r.price_diff).toFixed(2)}`
                            : "$0.00"
                          : "—"}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-subtle">{r.reason}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Confirmation Prompt Modal */}
          <Prompt open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Prompt.Content>
              <Prompt.Header>
                <Prompt.Title>Confirm Inventory & Price Synchronization</Prompt.Title>
                <Prompt.Description>
                  You are about to apply inventory updates for {syncSummary?.will_update ?? 0} items, create{" "}
                  {syncSummary?.will_create ?? 0} inventory levels, and synchronize prices for{" "}
                  {syncSummary?.will_update_prices ?? 0} variants. This operation will update Medusa stocked quantities
                  and selling rates to match ERPNext.
                  <br />
                  <br />
                  Type <strong className="text-ui-fg-base">CONFIRM</strong> below to execute.
                </Prompt.Description>
              </Prompt.Header>
              <div className="p-4">
                <Input
                  placeholder="Type CONFIRM"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                />
              </div>
              <Prompt.Footer>
                <Prompt.Cancel disabled={executingSync}>Cancel</Prompt.Cancel>
                <Prompt.Action
                  disabled={confirmInput !== "CONFIRM" || executingSync}
                  onClick={handleExecuteSync}
                >
                  {executingSync ? "Executing..." : "Confirm & Execute"}
                </Prompt.Action>
              </Prompt.Footer>
            </Prompt.Content>
          </Prompt>
        </div>
      )}

      {/* TAB 4: SYNC HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
                Synchronization Audit Logs
              </Heading>
              <Text className="text-sm text-ui-fg-subtle">
                Historical record of synchronization executions and item-level before-and-after values.
              </Text>
            </div>
            <Button size="small" variant="secondary" onClick={loadSyncLogs}>
              Refresh Logs
            </Button>
          </div>

          <div className="border border-ui-border-base rounded-lg overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Started At</Table.HeaderCell>
                  <Table.HeaderCell>Triggered By</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Updated</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Created</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Failed</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {syncLogs.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-6 text-ui-fg-muted text-sm">
                      No synchronization runs recorded yet.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  syncLogs.map((log) => (
                    <Table.Row key={log.id}>
                      <Table.Cell>
                        <Badge
                          color={
                            log.status === "completed"
                              ? "green"
                              : log.status === "in_progress"
                              ? "blue"
                              : "red"
                          }
                          size="small"
                        >
                          {log.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs font-mono">{log.run_type}</Table.Cell>
                      <Table.Cell className="text-xs">{new Date(log.started_at).toLocaleString()}</Table.Cell>
                      <Table.Cell className="text-xs">{log.triggered_by || "admin"}</Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {log.summary?.executed_updates ?? 0}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono">
                        {log.summary?.executed_creates ?? 0}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-right font-mono text-ui-fg-error">
                        {log.summary?.failed ?? 0}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleViewLogDetails(log.id)}
                        >
                          Inspect Items
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Item details view */}
          {selectedLogId && (
            <div className="p-5 bg-ui-bg-subtle rounded-lg border border-ui-border-base space-y-3">
              <div className="flex items-center justify-between">
                <Heading level="h3" className="text-sm font-semibold text-ui-fg-base">
                  Item Details for Run: <span className="font-mono text-xs font-normal">{selectedLogId}</span>
                </Heading>
                <Button size="small" variant="transparent" onClick={() => setSelectedLogId(null)}>
                  Close
                </Button>
              </div>

              {loadingLogDetails ? (
                <Text className="text-sm text-ui-fg-muted">Loading item details...</Text>
              ) : selectedItemLogs.length === 0 ? (
                <Text className="text-sm text-ui-fg-muted">No item level logs recorded for this run.</Text>
              ) : (
                <div className="border border-ui-border-base rounded bg-ui-bg-base overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>SKU</Table.HeaderCell>
                        <Table.HeaderCell>ERP Item Code</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Prev Qty</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">New Qty</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Prev Price</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">New Price</Table.HeaderCell>
                        <Table.HeaderCell>Error / Details</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {selectedItemLogs.map((item) => (
                        <Table.Row key={item.id}>
                          <Table.Cell>
                            <Badge
                              color={item.status === "UPDATED" || item.status === "CREATED" ? "green" : "red"}
                              size="small"
                            >
                              {item.status}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="font-mono text-xs">{item.sku}</Table.Cell>
                          <Table.Cell className="font-mono text-xs">{item.erp_item_code}</Table.Cell>
                          <Table.Cell className="text-xs text-right font-mono">{item.previous_quantity}</Table.Cell>
                          <Table.Cell className="text-xs text-right font-mono font-medium">{item.new_quantity}</Table.Cell>
                          <Table.Cell className="text-xs text-right font-mono">
                            {item.previous_price !== null && item.previous_price !== undefined
                              ? `$${Number(item.previous_price).toFixed(2)}`
                              : "—"}
                          </Table.Cell>
                          <Table.Cell className="text-xs text-right font-mono font-medium">
                            {item.new_price !== null && item.new_price !== undefined
                              ? `$${Number(item.new_price).toFixed(2)}`
                              : "—"}
                          </Table.Cell>
                          <Table.Cell className="text-xs text-ui-fg-error">{item.error_message || "—"}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "ERPNext Sync",
  icon: ArrowPath,
})

export default ErpnextSyncAdminPage

