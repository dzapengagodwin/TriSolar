import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquareTwoStack, Spinner, Photo, PencilSquare, Trash, XMark, Check } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Drawer,
  StatusBadge,
  CommandBar,
  toast,
  clx,
  Select,
  Checkbox,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"

const BulkProductsPage = () => {
  const [activeTab, setActiveTab] = useState<"workspace" | "history">("workspace")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [collectionFilter, setCollectionFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  // Available metadata lists for filters/selections
  const [brands, setBrands] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [productBrandMap, setProductBrandMap] = useState<Record<string, any>>({})

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAllMatching, setSelectAllMatching] = useState(false)

  // Pagination
  const [limit] = useState(15)
  const [offset, setOffset] = useState(0)

  // In-table bulk actions bar state
  const [bulkActionSelect, setBulkActionSelect] = useState("")
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(false)

  // In-table Bulk Edit Form fields (WooCommerce Style)
  const [bulkEditStatus, setBulkEditStatus] = useState("no_change")
  const [bulkEditBrandId, setBulkEditBrandId] = useState("no_change")
  const [bulkEditCollectionId, setBulkEditCollectionId] = useState("no_change")
  const [bulkEditCategoryIds, setBulkEditCategoryIds] = useState<string[]>([])
  const [bulkEditRegularPriceMode, setBulkEditRegularPriceMode] = useState("no_change")
  const [bulkEditRegularPriceValue, setBulkEditRegularPriceValue] = useState("")
  const [bulkEditSalePriceMode, setBulkEditSalePriceMode] = useState("no_change")
  const [bulkEditSalePriceValue, setBulkEditSalePriceValue] = useState("")
  const [bulkEditStockStatus, setBulkEditStockStatus] = useState("no_change")
  const [bulkEditStockQtyMode, setBulkEditStockQtyMode] = useState("no_change")
  const [bulkEditStockQtyValue, setBulkEditStockQtyValue] = useState("")
  const [bulkEditManageStock, setBulkEditManageStock] = useState("no_change")
  const [bulkEditWeight, setBulkEditWeight] = useState("no_change")
  const [bulkEditWeightValue, setBulkEditWeightValue] = useState("")

  // Row-level Quick Edit state
  const [quickEditingProductId, setQuickEditingProductId] = useState<string | null>(null)
  const [quickEditSaving, setQuickEditSaving] = useState(false)
  const [quickEditForm, setQuickEditForm] = useState({
    title: "",
    status: "published" as "published" | "draft" | "proposed",
    regular_price: "",
    sale_price: "",
    stock_status: "instock" as "instock" | "outofstock" | "onbackorder",
    stock_quantity: "",
    brand_id: "",
  })

  // Floating Action Drawers (for backwards compatibility & CommandBar shortcuts)
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)
  const [targetStatus, setTargetStatus] = useState("published")
  const [targetBrandId, setTargetBrandId] = useState("")
  const [targetCategoryIds, setTargetCategoryIds] = useState<string[]>([])
  const [targetCollectionId, setTargetCollectionId] = useState("")
  const [targetMetadataKey, setTargetMetadataKey] = useState("")
  const [targetMetadataValue, setTargetMetadataValue] = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Active Bulk Operation Tracking
  const [activeOpId, setActiveOpId] = useState<string | null>(null)
  const [activeOperation, setActiveOperation] = useState<any | null>(null)
  const [failedItems, setFailedItems] = useState<any[]>([])
  const [showFailuresDrawer, setShowFailuresDrawer] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Past operations audit history
  const [pastOperations, setPastOperations] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Fetch filter dropdown options and populate brand mapping
  const fetchFilterOptions = useCallback(async () => {
    try {
      const brandsRes = await fetch("/admin/brands?limit=100", { credentials: "include" })
      if (brandsRes.ok) {
        const data = await brandsRes.json()
        const rawBrands = data.brands || []
        setBrands(rawBrands)

        const map: Record<string, any> = {}
        for (const b of rawBrands) {
          for (const p of b.products || []) {
            map[p.id] = b
          }
        }
        setProductBrandMap(map)
      }

      const collectionsRes = await fetch("/admin/collections?limit=100", { credentials: "include" })
      if (collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCollections(data.collections || [])
      }

      const categoriesRes = await fetch("/admin/product-categories?limit=100", { credentials: "include" })
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.product_categories || [])
      }
    } catch (err) {
      console.error("Error loading dropdown data options", err)
    }
  }, [])

  // Fetch Products matching search, filters, pagination
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(limit))
      params.set("offset", String(offset))
      params.set("fields", "id,title,thumbnail,status,handle,metadata,weight,*variants,*variants.prices,*categories,*collection")

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim())
      }
      if (statusFilter) {
        params.set("status[]", statusFilter)
      }
      if (collectionFilter) {
        params.set("collection_id[]", collectionFilter)
      }
      if (categoryFilter) {
        params.set("category_id[]", categoryFilter)
      }

      if (brandFilter) {
        const brandRes = await fetch(`/admin/brands/${brandFilter}`, { credentials: "include" })
        if (brandRes.ok) {
          const brandData = await brandRes.json()
          const brandProductIds = (brandData.brand?.products || []).map((p: any) => p.id)
          if (brandProductIds.length === 0) {
            setProducts([])
            setTotalCount(0)
            return
          }
          brandProductIds.forEach((id: string) => params.append("id[]", id))
        }
      }

      const res = await fetch(`/admin/products?${params.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()

      setProducts(data.products || [])
      setTotalCount(data.count || 0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products"
      toast.error("Error", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [limit, offset, searchQuery, statusFilter, brandFilter, collectionFilter, categoryFilter])

  // Fetch past operations list
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch("/admin/bulk-operations?limit=50", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPastOperations(data.operations || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // Poll Active Operation Details
  const pollOperation = useCallback(async () => {
    if (!activeOpId) return

    try {
      const res = await fetch(`/admin/bulk-operations/${activeOpId}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      const op = data.operation
      setActiveOperation(op)

      if (["completed", "completed_with_errors", "failed", "cancelled"].includes(op.status)) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }

        toast.success("Bulk Action Complete", {
          description: `Bulk operation completed with status: ${op.status}`,
        })

        fetchProducts()
        fetchHistory()
        localStorage.removeItem("active_bulk_operation_id")

        setTimeout(() => {
          setActiveOperation(null)
          setActiveOpId(null)
        }, 5000)
      }
    } catch (err) {
      console.error("Error polling operation", err)
    }
  }, [activeOpId, fetchProducts, fetchHistory])

  // Track active operations across page reloads
  useEffect(() => {
    const savedOpId = localStorage.getItem("active_bulk_operation_id")
    if (savedOpId) {
      setActiveOpId(savedOpId)
    }
    fetchFilterOptions()
  }, [fetchFilterOptions])

  // Set up polling intervals
  useEffect(() => {
    if (activeOpId) {
      pollOperation()
      pollingRef.current = setInterval(pollOperation, 2000)
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [activeOpId, pollOperation])

  // Load products list
  useEffect(() => {
    if (activeTab === "workspace") {
      fetchProducts()
    } else {
      fetchHistory()
    }
  }, [activeTab, fetchProducts, fetchHistory])

  // Selection helpers
  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
    setSelectAllMatching(false)
  }

  const isAllSelectedOnPage = products.length > 0 && products.every((p) => selectedIds.has(p.id))
  const isSomeSelectedOnPage = products.length > 0 && products.some((p) => selectedIds.has(p.id)) && !isAllSelectedOnPage

  const toggleSelectPage = () => {
    const next = new Set(selectedIds)
    if (isAllSelectedOnPage) {
      products.forEach((p) => next.delete(p.id))
      setSelectAllMatching(false)
    } else {
      products.forEach((p) => next.add(p.id))
    }
    setSelectedIds(next)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
    setIsBulkEditOpen(false)
  }

  const selectedProductsList = useMemo(() => {
    return products.filter((p) => selectedIds.has(p.id))
  }, [products, selectedIds])

  // Price & Stock extraction helpers
  const getProductPriceDisplay = (product: any) => {
    const variant = product.variants?.[0]
    const variantPrice = variant?.prices?.[0]?.amount !== undefined ? variant.prices[0].amount / 100 : null
    const metaRegular = product.metadata?.woo_regular_price ? parseFloat(String(product.metadata.woo_regular_price)) : null
    const metaSale = product.metadata?.woo_sale_price ? parseFloat(String(product.metadata.woo_sale_price)) : null

    const regular = metaRegular ?? variantPrice ?? null
    const sale = metaSale && regular && metaSale < regular ? metaSale : null

    return { regular, sale }
  }

  const getProductStockDisplay = (product: any) => {
    const metaStatus = product.metadata?.stock_status
    const metaQty = product.metadata?.stock_quantity
    const isOutOfStock = metaStatus === "outofstock" || (metaQty !== undefined && metaQty <= 0)
    const isBackorder = metaStatus === "onbackorder"

    return {
      status: isOutOfStock ? "outofstock" : isBackorder ? "onbackorder" : "instock",
      quantity: metaQty !== undefined && metaQty !== null ? Number(metaQty) : null,
    }
  }

  // Direct bulk action execution engine
  const executeDirectBulkAction = async (action: string, payload: any) => {
    setSubmittingAction(true)
    try {
      const selectionData: any = selectAllMatching
        ? {
            type: "filter",
            filters: {
              q: searchQuery || undefined,
              status: statusFilter ? [statusFilter] : undefined,
              collection_id: collectionFilter ? [collectionFilter] : undefined,
              category_id: categoryFilter ? [categoryFilter] : undefined,
              brand_id: brandFilter ? [brandFilter] : undefined,
            },
          }
        : {
            type: "ids",
            ids: Array.from(selectedIds),
          }

      const response = await fetch("/admin/bulk-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          entity_type: "product",
          selection_data: selectionData,
          payload,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Failed to trigger bulk action")
      }

      const data = await response.json()
      const op = data.operation

      setActiveOpId(op.id)
      setActiveOperation(op)
      localStorage.setItem("active_bulk_operation_id", op.id)

      toast.success("Enqueued", {
        description: `Bulk operation enqueued successfully. Monitor progress below.`,
      })

      clearSelection()
      setBulkActionSelect("")
    } catch (err: any) {
      toast.error("Execution Error", { description: err.message })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Handle in-table Bulk Actions dropdown Apply button
  const handleApplyBulkAction = () => {
    if (selectedIds.size === 0) {
      toast.error("Selection Required", { description: "Select at least one product using the checkboxes." })
      return
    }

    if (!bulkActionSelect) {
      toast.error("Action Required", { description: "Choose a bulk action from the dropdown." })
      return
    }

    if (bulkActionSelect === "edit") {
      setIsBulkEditOpen(true)
    } else if (bulkActionSelect === "publish") {
      executeDirectBulkAction("update_status", { status: "published" })
    } else if (bulkActionSelect === "draft") {
      executeDirectBulkAction("update_status", { status: "draft" })
    } else if (bulkActionSelect === "proposed") {
      executeDirectBulkAction("update_status", { status: "proposed" })
    } else if (bulkActionSelect === "instock") {
      executeDirectBulkAction("update_stock", { stock_status: "instock" })
    } else if (bulkActionSelect === "outofstock") {
      executeDirectBulkAction("update_stock", { stock_status: "outofstock" })
    } else if (bulkActionSelect === "delete") {
      setActiveDrawer("delete")
    }
  }

  // Handle WooCommerce-Style Bulk Edit Form Submission
  const handleSaveBulkEdit = async () => {
    const payload: Record<string, any> = {}

    if (bulkEditStatus !== "no_change") {
      payload.status = bulkEditStatus
    }
    if (bulkEditBrandId !== "no_change") {
      payload.brand_id = bulkEditBrandId === "remove" ? null : bulkEditBrandId
    }
    if (bulkEditCollectionId !== "no_change") {
      payload.collection_id = bulkEditCollectionId === "remove" ? null : bulkEditCollectionId
    }
    if (bulkEditCategoryIds.length > 0) {
      payload.category_ids = bulkEditCategoryIds
    }
    if (bulkEditRegularPriceMode !== "no_change" && bulkEditRegularPriceValue.trim() !== "") {
      payload.regular_price_mode = bulkEditRegularPriceMode
      payload.regular_price_value = parseFloat(bulkEditRegularPriceValue)
    }
    if (bulkEditSalePriceMode !== "no_change") {
      payload.sale_price_mode = bulkEditSalePriceMode
      if (bulkEditSalePriceMode !== "clear" && bulkEditSalePriceValue.trim() !== "") {
        payload.sale_price_value = parseFloat(bulkEditSalePriceValue)
      }
    }
    if (bulkEditStockStatus !== "no_change") {
      payload.stock_status = bulkEditStockStatus
    }
    if (bulkEditStockQtyMode !== "no_change" && bulkEditStockQtyValue.trim() !== "") {
      payload.stock_quantity_mode = bulkEditStockQtyMode
      payload.stock_quantity_value = parseInt(bulkEditStockQtyValue, 10)
    }
    if (bulkEditManageStock !== "no_change") {
      payload.manage_stock = bulkEditManageStock === "yes"
    }
    if (bulkEditWeight !== "no_change" && bulkEditWeightValue.trim() !== "") {
      payload.weight = parseFloat(bulkEditWeightValue)
    }

    if (Object.keys(payload).length === 0) {
      toast.error("No Changes Specified", { description: "Modify at least one field from '— No change —'." })
      return
    }

    await executeDirectBulkAction("bulk_edit", payload)
    setIsBulkEditOpen(false)
  }

  // Quick Edit row handlers
  const handleStartQuickEdit = (product: any) => {
    const priceInfo = getProductPriceDisplay(product)
    const stockInfo = getProductStockDisplay(product)
    const currentBrand = productBrandMap[product.id] || product.brand

    setQuickEditForm({
      title: product.title || "",
      status: product.status || "published",
      regular_price: priceInfo.regular !== null ? String(priceInfo.regular) : "",
      sale_price: priceInfo.sale !== null ? String(priceInfo.sale) : "",
      stock_status: stockInfo.status as any,
      stock_quantity: stockInfo.quantity !== null ? String(stockInfo.quantity) : "",
      brand_id: currentBrand?.id || "",
    })
    setQuickEditingProductId(product.id)
  }

  const handleSaveQuickEdit = async (productId: string) => {
    setQuickEditSaving(true)
    try {
      const res = await fetch(`/admin/products/${productId}/quick-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: quickEditForm.title,
          status: quickEditForm.status,
          regular_price: quickEditForm.regular_price !== "" ? parseFloat(quickEditForm.regular_price) : undefined,
          sale_price: quickEditForm.sale_price !== "" ? parseFloat(quickEditForm.sale_price) : null,
          stock_status: quickEditForm.stock_status,
          stock_quantity: quickEditForm.stock_quantity !== "" ? parseInt(quickEditForm.stock_quantity, 10) : undefined,
          brand_id: quickEditForm.brand_id || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to save product")
      }

      const data = await res.json()
      toast.success("Updated", { description: `Product "${quickEditForm.title}" saved successfully.` })

      if (data.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data.product } : p)))
        if (data.product.brand) {
          setProductBrandMap((prev) => ({ ...prev, [productId]: data.product.brand }))
        }
      }

      setQuickEditingProductId(null)
    } catch (err: any) {
      toast.error("Quick Edit Error", { description: err.message })
    } finally {
      setQuickEditSaving(false)
    }
  }

  // Open individual action drawer (from CommandBar shortcuts)
  const openActionDrawer = (drawerName: string) => {
    setActiveDrawer(drawerName)
  }

  // Handle drawer action submission
  const handleExecuteDrawerAction = async (e: React.FormEvent) => {
    e.preventDefault()

    let payload: any = null
    let actionName = ""

    if (activeDrawer === "status") {
      actionName = "update_status"
      payload = { status: targetStatus }
    } else if (activeDrawer === "brand") {
      actionName = "update_brand"
      payload = { brand_id: targetBrandId || null }
    } else if (activeDrawer === "category") {
      actionName = "update_category"
      payload = { category_ids: targetCategoryIds }
    } else if (activeDrawer === "collection") {
      actionName = "update_collection"
      payload = { collection_id: targetCollectionId || null }
    } else if (activeDrawer === "metadata") {
      actionName = "update_metadata"
      payload = {
        metadata: {
          [targetMetadataKey]: targetMetadataValue,
        },
      }
    } else if (activeDrawer === "delete") {
      actionName = "delete"
      payload = {}
    }

    await executeDirectBulkAction(actionName, payload)
    setActiveDrawer(null)
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-ui-border-base pb-4">
        <div>
          <Heading level="h1" className="text-xl font-bold text-ui-fg-base flex items-center gap-2">
            <SquareTwoStack className="text-ui-fg-interactive" />
            Bulk Operations Workspace
          </Heading>
          <Text className="text-xs text-ui-fg-subtle">
            In-table bulk operations like WooCommerce: batch edit prices, inventory, status, categories, and brands.
          </Text>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-ui-bg-subtle border border-ui-border-base rounded-lg p-1 gap-1">
          <Button
            size="small"
            variant={activeTab === "workspace" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("workspace")}
            className="text-xs"
          >
            Catalog Table
          </Button>
          <Button
            size="small"
            variant={activeTab === "history" ? "secondary" : "transparent"}
            onClick={() => setActiveTab("history")}
            className="text-xs"
          >
            Audit History
          </Button>
        </div>
      </div>

      {/* ACTIVE JOB BANNER & PROGRESS INDICATOR */}
      {activeOperation && (
        <div className="bg-ui-bg-subtle border border-ui-border-interactive rounded-xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Spinner className="animate-spin text-ui-fg-interactive w-4 h-4" />
              <span className="text-xs font-semibold text-ui-fg-base capitalize">
                Processing {activeOperation.action.replace(/_/g, " ")} on {activeOperation.total} items
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <StatusBadge
                color={
                  activeOperation.status === "completed"
                    ? "green"
                    : activeOperation.status === "failed"
                    ? "red"
                    : "blue"
                }
              >
                {activeOperation.status}
              </StatusBadge>
              {activeOperation.failed > 0 && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={async () => {
                    const res = await fetch(`/admin/bulk-operations/${activeOperation.id}`, { credentials: "include" })
                    const data = await res.json()
                    setFailedItems((data.operation?.items || []).filter((i: any) => i.status === "failed"))
                    setShowFailuresDrawer(true)
                  }}
                  className="text-xs text-ui-fg-error"
                >
                  View {activeOperation.failed} Failed
                </Button>
              )}
            </div>
          </div>
          <div className="w-full bg-ui-bg-base border border-ui-border-base rounded-full h-2 overflow-hidden">
            <div
              className="bg-ui-fg-interactive h-full transition-all duration-300"
              style={{
                width: `${
                  activeOperation.total > 0
                    ? Math.round((activeOperation.processed / activeOperation.total) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* MAIN TAB CONTENT */}
      {activeTab === "workspace" ? (
        <>
          {/* SEARCH & FILTERS BAR */}
          <div className="grid grid-cols-5 gap-3">
            <Input
              type="search"
              placeholder="Search products by title or handle..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setOffset(0)
              }}
              className="col-span-1 border-ui-border-base"
            />
            <div className="col-span-1">
              <Select
                value={statusFilter || "all"}
                onValueChange={(val) => {
                  setStatusFilter(val === "all" ? "" : val)
                  setOffset(0)
                }}
              >
                <Select.Trigger size="small">
                  <Select.Value placeholder="Status (All)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">Status (All)</Select.Item>
                  <Select.Item value="published">Published</Select.Item>
                  <Select.Item value="draft">Draft</Select.Item>
                  <Select.Item value="proposed">Proposed</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="col-span-1">
              <Select
                value={brandFilter || "all"}
                onValueChange={(val) => {
                  setBrandFilter(val === "all" ? "" : val)
                  setOffset(0)
                }}
              >
                <Select.Trigger size="small">
                  <Select.Value placeholder="Brand (All)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">Brand (All)</Select.Item>
                  {brands.map((b) => (
                    <Select.Item key={b.id} value={b.id}>
                      {b.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="col-span-1">
              <Select
                value={collectionFilter || "all"}
                onValueChange={(val) => {
                  setCollectionFilter(val === "all" ? "" : val)
                  setOffset(0)
                }}
              >
                <Select.Trigger size="small">
                  <Select.Value placeholder="Collection (All)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">Collection (All)</Select.Item>
                  {collections.map((col) => (
                    <Select.Item key={col.id} value={col.id}>
                      {col.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="col-span-1">
              <Select
                value={categoryFilter || "all"}
                onValueChange={(val) => {
                  setCategoryFilter(val === "all" ? "" : val)
                  setOffset(0)
                }}
              >
                <Select.Trigger size="small">
                  <Select.Value placeholder="Category (All)" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">Category (All)</Select.Item>
                  {categories.map((cat) => (
                    <Select.Item key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          {/* SELECT ALL MATCHING BANNER */}
          {isAllSelectedOnPage && totalCount > products.length && (
            <div className="bg-ui-bg-highlight border border-ui-border-interactive rounded-md p-3 flex items-center justify-between text-xs">
              <span className="text-ui-fg-base">
                {selectAllMatching
                  ? `All ${totalCount} matching products in catalog selected.`
                  : `All ${products.length} products on this page are selected.`}
              </span>
              {!selectAllMatching ? (
                <Button
                  variant="transparent"
                  size="small"
                  className="text-ui-fg-interactive hover:underline"
                  onClick={() => setSelectAllMatching(true)}
                >
                  Select all {totalCount} matching catalog products
                </Button>
              ) : (
                <Button
                  variant="transparent"
                  size="small"
                  className="text-ui-fg-interactive hover:underline"
                  onClick={() => setSelectAllMatching(false)}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          )}

          {/* IN-TABLE WOOCOMMERCE BULK EDIT PANEL */}
          {isBulkEditOpen && (
            <Container className="border-2 border-ui-border-interactive bg-ui-bg-subtle p-5 rounded-xl shadow-md animate-fade-in flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-ui-border-base pb-3">
                <div>
                  <Heading level="h2" className="text-sm font-bold text-ui-fg-base">
                    Bulk Edit ({selectedIds.size} Products Selected)
                  </Heading>
                  <Text className="text-xs text-ui-fg-subtle">
                    Set any fields you wish to change. Fields left as &quot;— No change —&quot; will remain untouched.
                  </Text>
                </div>
                <Button variant="transparent" size="small" onClick={() => setIsBulkEditOpen(false)}>
                  <XMark className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected products tag chips */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ui-fg-muted">Selected Products:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-ui-bg-base border border-ui-border-base rounded-md">
                  {selectedProductsList.map((p) => (
                    <Badge key={p.id} color="grey" className="flex items-center gap-1 text-xs">
                      <span className="truncate max-w-[220px]">{p.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(p.id)}
                        className="text-ui-fg-muted hover:text-ui-fg-base ml-1"
                        title="Remove from batch"
                      >
                        <XMark className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectAllMatching && (
                    <Badge color="blue" className="text-xs">
                      + All other {totalCount - selectedProductsList.length} matching products
                    </Badge>
                  )}
                </div>
              </div>

              {/* 3 Columns: Taxonomy, Pricing, Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Column 1: Product Taxonomy */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-ui-fg-base uppercase tracking-wider border-b border-ui-border-base pb-1">
                    Attributes & Status
                  </span>
                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Status</label>
                    <Select value={bulkEditStatus} onValueChange={setBulkEditStatus}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="published">Published</Select.Item>
                        <Select.Item value="draft">Draft</Select.Item>
                        <Select.Item value="proposed">Proposed</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Brand</label>
                    <Select value={bulkEditBrandId} onValueChange={setBulkEditBrandId}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="remove">Remove Brand (Unlink)</Select.Item>
                        {brands.map((b) => (
                          <Select.Item key={b.id} value={b.id}>
                            {b.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Collection</label>
                    <Select value={bulkEditCollectionId} onValueChange={setBulkEditCollectionId}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="remove">Remove Collection</Select.Item>
                        {collections.map((col) => (
                          <Select.Item key={col.id} value={col.id}>
                            {col.title}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">
                      Categories ({bulkEditCategoryIds.length} selected)
                    </label>
                    <div className="max-h-28 overflow-y-auto border border-ui-border-base rounded-md p-2 bg-ui-bg-base flex flex-col gap-1.5 text-xs">
                      {categories.map((cat) => {
                        const isSelected = bulkEditCategoryIds.includes(cat.id)
                        return (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-ui-bg-subtle p-1 rounded">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setBulkEditCategoryIds((prev) => [...prev, cat.id])
                                } else {
                                  setBulkEditCategoryIds((prev) => prev.filter((id) => id !== cat.id))
                                }
                              }}
                            />
                            <span>{cat.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Column 2: Pricing */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-ui-fg-base uppercase tracking-wider border-b border-ui-border-base pb-1">
                    Pricing
                  </span>
                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Regular Price</label>
                    <Select value={bulkEditRegularPriceMode} onValueChange={setBulkEditRegularPriceMode}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="change_to">Change to fixed price ($)</Select.Item>
                        <Select.Item value="increase_amount">Increase existing price by ($)</Select.Item>
                        <Select.Item value="decrease_amount">Decrease existing price by ($)</Select.Item>
                        <Select.Item value="increase_percent">Increase existing price by (%)</Select.Item>
                        <Select.Item value="decrease_percent">Decrease existing price by (%)</Select.Item>
                      </Select.Content>
                    </Select>
                    {bulkEditRegularPriceMode !== "no_change" && (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter amount or percentage"
                        value={bulkEditRegularPriceValue}
                        onChange={(e) => setBulkEditRegularPriceValue(e.target.value)}
                        className="mt-2 text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Sale Price</label>
                    <Select value={bulkEditSalePriceMode} onValueChange={setBulkEditSalePriceMode}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="change_to">Change to fixed sale price ($)</Select.Item>
                        <Select.Item value="increase_amount">Increase existing sale by ($)</Select.Item>
                        <Select.Item value="decrease_amount">Decrease existing sale by ($)</Select.Item>
                        <Select.Item value="increase_percent">Increase existing sale by (%)</Select.Item>
                        <Select.Item value="decrease_percent">Decrease existing sale by (%)</Select.Item>
                        <Select.Item value="regular_decrease_amount">Regular price minus ($)</Select.Item>
                        <Select.Item value="regular_decrease_percent">Regular price minus (%)</Select.Item>
                        <Select.Item value="clear">Clear sale price (Remove sale)</Select.Item>
                      </Select.Content>
                    </Select>
                    {bulkEditSalePriceMode !== "no_change" && bulkEditSalePriceMode !== "clear" && (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter amount or percentage"
                        value={bulkEditSalePriceValue}
                        onChange={(e) => setBulkEditSalePriceValue(e.target.value)}
                        className="mt-2 text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Column 3: Inventory & Specs */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-ui-fg-base uppercase tracking-wider border-b border-ui-border-base pb-1">
                    Inventory & Specs
                  </span>
                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Stock Status</label>
                    <Select value={bulkEditStockStatus} onValueChange={setBulkEditStockStatus}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="instock">In stock</Select.Item>
                        <Select.Item value="outofstock">Out of stock</Select.Item>
                        <Select.Item value="onbackorder">On backorder</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Stock Quantity</label>
                    <Select value={bulkEditStockQtyMode} onValueChange={setBulkEditStockQtyMode}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="change_to">Change to (fixed qty)</Select.Item>
                        <Select.Item value="increase_amount">Increase existing qty by</Select.Item>
                        <Select.Item value="decrease_amount">Decrease existing qty by</Select.Item>
                      </Select.Content>
                    </Select>
                    {bulkEditStockQtyMode !== "no_change" && (
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        value={bulkEditStockQtyValue}
                        onChange={(e) => setBulkEditStockQtyValue(e.target.value)}
                        className="mt-2 text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Manage Stock</label>
                    <Select value={bulkEditManageStock} onValueChange={setBulkEditManageStock}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="yes">Yes (Track inventory)</Select.Item>
                        <Select.Item value="no">No (Do not track)</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ui-fg-muted block mb-1">Weight (kg)</label>
                    <Select value={bulkEditWeight} onValueChange={setBulkEditWeight}>
                      <Select.Trigger size="small">
                        <Select.Value placeholder="— No change —" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="no_change">— No change —</Select.Item>
                        <Select.Item value="change_to">Change to (kg)</Select.Item>
                      </Select.Content>
                    </Select>
                    {bulkEditWeight === "change_to" && (
                      <Input
                        type="number"
                        step="any"
                        placeholder="Weight in kg"
                        value={bulkEditWeightValue}
                        onChange={(e) => setBulkEditWeightValue(e.target.value)}
                        className="mt-2 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-ui-border-base">
                <Button variant="secondary" size="small" onClick={() => setIsBulkEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  disabled={submittingAction}
                  onClick={handleSaveBulkEdit}
                >
                  {submittingAction ? <Spinner className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                  Update Products ({selectedIds.size})
                </Button>
              </div>
            </Container>
          )}

          {/* TABLE CONTAINER WITH IN-TABLE ACTIONS BAR */}
          <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base shadow-sm">
            {/* WOOCOMMERCE IN-TABLE BULK ACTIONS BAR */}
            <div className="flex items-center justify-between gap-3 p-3 bg-ui-bg-subtle border-b border-ui-border-base">
              <div className="flex items-center gap-2">
                <Select value={bulkActionSelect} onValueChange={setBulkActionSelect}>
                  <Select.Trigger size="small" className="min-w-[210px] text-xs">
                    <Select.Value placeholder="Bulk actions" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="">Bulk actions</Select.Item>
                    <Select.Item value="edit">Edit (Bulk Edit)</Select.Item>
                    <Select.Item value="publish">Change status to Published</Select.Item>
                    <Select.Item value="draft">Change status to Draft</Select.Item>
                    <Select.Item value="proposed">Change status to Proposed</Select.Item>
                    <Select.Item value="instock">Mark as In Stock</Select.Item>
                    <Select.Item value="outofstock">Mark as Out of Stock</Select.Item>
                    <Select.Item value="delete">Move to Trash (Delete)</Select.Item>
                  </Select.Content>
                </Select>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={!bulkActionSelect || selectedIds.size === 0 || submittingAction}
                  onClick={handleApplyBulkAction}
                  className="text-xs"
                >
                  {submittingAction ? <Spinner className="w-3 h-3 animate-spin" /> : "Apply"}
                </Button>
                {selectedIds.size > 0 && (
                  <span className="text-xs text-ui-fg-muted font-medium ml-2">
                    {selectAllMatching ? `${totalCount} products selected` : `${selectedIds.size} selected`}
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="ml-2 text-ui-fg-interactive hover:underline"
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="transparent"
                  size="small"
                  onClick={fetchProducts}
                  className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* TABLE GRID */}
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="w-[40px] pl-4">
                    <Checkbox
                      checked={isAllSelectedOnPage ? true : isSomeSelectedOnPage ? "indeterminate" : false}
                      onCheckedChange={toggleSelectPage}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell className="w-[50px]">Image</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Price</Table.HeaderCell>
                  <Table.HeaderCell>Stock</Table.HeaderCell>
                  <Table.HeaderCell>Brand</Table.HeaderCell>
                  <Table.HeaderCell>Categories</Table.HeaderCell>
                  <Table.HeaderCell className="text-right pr-4">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center py-12 text-ui-fg-muted">
                      <Spinner className="w-5 h-5 animate-spin mx-auto mb-2 text-ui-fg-interactive" />
                      Loading catalog products...
                    </Table.Cell>
                  </Table.Row>
                ) : products.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center py-12 text-ui-fg-subtle">
                      No matching products found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  products.map((product) => {
                    const isChecked = selectedIds.has(product.id)
                    const isQuickEditing = quickEditingProductId === product.id
                    const priceInfo = getProductPriceDisplay(product)
                    const stockInfo = getProductStockDisplay(product)
                    const currentBrand = productBrandMap[product.id] || product.brand

                    if (isQuickEditing) {
                      return (
                        <Table.Row key={product.id} className="bg-ui-bg-highlight-subtle border-y-2 border-ui-border-interactive">
                          <Table.Cell colSpan={9} className="p-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-ui-border-base pb-2">
                                <span className="text-xs font-bold text-ui-fg-base">
                                  Quick Edit: {product.title}
                                </span>
                                <span className="text-xs text-ui-fg-muted">ID: {product.id}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                <div className="col-span-2">
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Title</label>
                                  <Input
                                    size="small"
                                    value={quickEditForm.title}
                                    onChange={(e) => setQuickEditForm((f) => ({ ...f, title: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Status</label>
                                  <Select
                                    value={quickEditForm.status}
                                    onValueChange={(val: any) => setQuickEditForm((f) => ({ ...f, status: val }))}
                                  >
                                    <Select.Trigger size="small">
                                      <Select.Value />
                                    </Select.Trigger>
                                    <Select.Content>
                                      <Select.Item value="published">Published</Select.Item>
                                      <Select.Item value="draft">Draft</Select.Item>
                                      <Select.Item value="proposed">Proposed</Select.Item>
                                    </Select.Content>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Brand</label>
                                  <Select
                                    value={quickEditForm.brand_id || "none"}
                                    onValueChange={(val) => setQuickEditForm((f) => ({ ...f, brand_id: val === "none" ? "" : val }))}
                                  >
                                    <Select.Trigger size="small">
                                      <Select.Value placeholder="No Brand" />
                                    </Select.Trigger>
                                    <Select.Content>
                                      <Select.Item value="none">No Brand</Select.Item>
                                      {brands.map((b) => (
                                        <Select.Item key={b.id} value={b.id}>
                                          {b.name}
                                        </Select.Item>
                                      ))}
                                    </Select.Content>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Regular Price ($)</label>
                                  <Input
                                    size="small"
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={quickEditForm.regular_price}
                                    onChange={(e) => setQuickEditForm((f) => ({ ...f, regular_price: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Sale Price ($)</label>
                                  <Input
                                    size="small"
                                    type="number"
                                    step="any"
                                    placeholder="Optional"
                                    value={quickEditForm.sale_price}
                                    onChange={(e) => setQuickEditForm((f) => ({ ...f, sale_price: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Stock Status</label>
                                  <Select
                                    value={quickEditForm.stock_status}
                                    onValueChange={(val: any) => setQuickEditForm((f) => ({ ...f, stock_status: val }))}
                                  >
                                    <Select.Trigger size="small">
                                      <Select.Value />
                                    </Select.Trigger>
                                    <Select.Content>
                                      <Select.Item value="instock">In stock</Select.Item>
                                      <Select.Item value="outofstock">Out of stock</Select.Item>
                                      <Select.Item value="onbackorder">On backorder</Select.Item>
                                    </Select.Content>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">Stock Qty</label>
                                  <Input
                                    size="small"
                                    type="number"
                                    placeholder="0"
                                    value={quickEditForm.stock_quantity}
                                    onChange={(e) => setQuickEditForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  variant="secondary"
                                  size="small"
                                  onClick={() => setQuickEditingProductId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="small"
                                  disabled={quickEditSaving}
                                  onClick={() => handleSaveQuickEdit(product.id)}
                                >
                                  {quickEditSaving ? <Spinner className="w-3 h-3 animate-spin mr-1" /> : null}
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      )
                    }

                    return (
                      <Table.Row
                        key={product.id}
                        className={clx("group transition-colors", {
                          "bg-ui-bg-highlight-subtle": isChecked,
                        })}
                      >
                        <Table.Cell className="pl-4">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSelectItem(product.id)}
                          />
                        </Table.Cell>

                        {/* Thumbnail */}
                        <Table.Cell>
                          <div className="w-9 h-9 rounded bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center overflow-hidden shrink-0">
                            {product.thumbnail ? (
                              <img src={product.thumbnail} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Photo className="text-ui-fg-muted w-4 h-4" />
                            )}
                          </div>
                        </Table.Cell>

                        {/* Product Title */}
                        <Table.Cell className="max-w-[260px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-ui-fg-base text-xs truncate" title={product.title}>
                              {product.title}
                            </span>
                            <span className="text-[11px] text-ui-fg-muted truncate">
                              /{product.handle || product.id}
                            </span>
                          </div>
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell>
                          <StatusBadge
                            color={
                              product.status === "published"
                                ? "green"
                                : product.status === "draft"
                                ? "grey"
                                : "orange"
                            }
                          >
                            {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : "-"}
                          </StatusBadge>
                        </Table.Cell>

                        {/* Price Column */}
                        <Table.Cell className="text-xs">
                          {priceInfo.sale !== null ? (
                            <div className="flex flex-col">
                              <span className="line-through text-ui-fg-muted text-[11px]">
                                ${priceInfo.regular?.toFixed(2)}
                              </span>
                              <span className="text-ui-fg-error font-semibold flex items-center gap-1">
                                ${priceInfo.sale.toFixed(2)}
                                <Badge color="red" size="small" className="text-[9px] px-1 py-0">SALE</Badge>
                              </span>
                            </div>
                          ) : priceInfo.regular !== null ? (
                            <span className="font-semibold text-ui-fg-base">
                              ${priceInfo.regular.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-ui-fg-muted">-</span>
                          )}
                        </Table.Cell>

                        {/* Stock Column */}
                        <Table.Cell>
                          {stockInfo.status === "outofstock" ? (
                            <Badge color="red" size="small">Out of stock</Badge>
                          ) : (
                            <Badge color="green" size="small">
                              In stock {stockInfo.quantity !== null ? `(${stockInfo.quantity})` : ""}
                            </Badge>
                          )}
                        </Table.Cell>

                        {/* Brand Column */}
                        <Table.Cell className="text-xs text-ui-fg-subtle">
                          {currentBrand?.name ? (
                            <Badge color="grey" size="small">{currentBrand.name}</Badge>
                          ) : (
                            "-"
                          )}
                        </Table.Cell>

                        {/* Categories Column */}
                        <Table.Cell className="text-xs text-ui-fg-subtle max-w-[180px]">
                          <span className="truncate block" title={product.categories?.map((c: any) => c.name).join(", ")}>
                            {product.categories?.map((c: any) => c.name).join(", ") || "-"}
                          </span>
                        </Table.Cell>

                        {/* Actions Column */}
                        <Table.Cell className="text-right pr-4">
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleStartQuickEdit(product)}
                            className="text-xs inline-flex items-center gap-1"
                          >
                            <PencilSquare className="w-3 h-3" />
                            Quick Edit
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                )}
              </Table.Body>
            </Table>

            {/* PAGINATION */}
            <div className="flex justify-between items-center p-3 border-t border-ui-border-base text-xs text-ui-fg-subtle bg-ui-bg-subtle">
              <span>
                Showing {totalCount === 0 ? 0 : offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} items
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={offset + limit >= totalCount}
                  onClick={() => setOffset(offset + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* FLOATING ACTION COMMANDBAR (Shortcut Access) */}
          <CommandBar open={selectedIds.size > 0 && !isBulkEditOpen}>
            <CommandBar.Bar>
              <CommandBar.Value>
                {selectAllMatching ? `${totalCount} (All)` : selectedIds.size} selected
              </CommandBar.Value>
              <CommandBar.Seperator />
              <CommandBar.Command
                action={() => setIsBulkEditOpen(true)}
                label="Bulk Edit"
                shortcut="e"
              />
              <CommandBar.Command
                action={() => openActionDrawer("status")}
                label="Status"
                shortcut="s"
              />
              <CommandBar.Command
                action={() => openActionDrawer("brand")}
                label="Brand"
                shortcut="b"
              />
              <CommandBar.Command
                action={() => openActionDrawer("category")}
                label="Category"
                shortcut="c"
              />
              <CommandBar.Command
                action={() => openActionDrawer("collection")}
                label="Collection"
                shortcut="l"
              />
              <CommandBar.Command
                action={() => openActionDrawer("metadata")}
                label="Metadata"
                shortcut="m"
              />
              <CommandBar.Command
                action={() => openActionDrawer("delete")}
                label="Delete"
                shortcut="d"
              />
            </CommandBar.Bar>
          </CommandBar>

          {/* SINGLE ACTION MODAL DRAWERS */}
          <Drawer open={!!activeDrawer} onOpenChange={() => setActiveDrawer(null)}>
            <Drawer.Content className="max-w-[450px]">
              <Drawer.Header>
                <Drawer.Title className="text-sm font-semibold capitalize">
                  Bulk {activeDrawer} Update
                </Drawer.Title>
              </Drawer.Header>
              <form onSubmit={handleExecuteDrawerAction} className="p-4 flex flex-col gap-4 h-full">
                {activeDrawer === "status" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Target Status</label>
                    <Select value={targetStatus} onValueChange={setTargetStatus}>
                      <Select.Trigger>
                        <Select.Value placeholder="Target Status" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="published">Published</Select.Item>
                        <Select.Item value="draft">Draft</Select.Item>
                        <Select.Item value="proposed">Proposed</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                )}

                {activeDrawer === "brand" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Assign Brand</label>
                    <Select value={targetBrandId} onValueChange={setTargetBrandId}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select Brand" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">None (Unlink)</Select.Item>
                        {brands.map((b) => (
                          <Select.Item key={b.id} value={b.id}>
                            {b.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}

                {activeDrawer === "category" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Categories</label>
                    <div className="max-h-60 overflow-y-auto border border-ui-border-base rounded p-2 flex flex-col gap-2">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={targetCategoryIds.includes(cat.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTargetCategoryIds((prev) => [...prev, cat.id])
                              } else {
                                setTargetCategoryIds((prev) => prev.filter((id) => id !== cat.id))
                              }
                            }}
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeDrawer === "collection" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Collection</label>
                    <Select value={targetCollectionId} onValueChange={setTargetCollectionId}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select Collection" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="">None (Clear)</Select.Item>
                        {collections.map((col) => (
                          <Select.Item key={col.id} value={col.id}>
                            {col.title}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}

                {activeDrawer === "metadata" && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-ui-fg-base">Key</label>
                      <Input
                        value={targetMetadataKey}
                        onChange={(e) => setTargetMetadataKey(e.target.value)}
                        placeholder="e.g. warranty_months"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ui-fg-base">Value</label>
                      <Input
                        value={targetMetadataValue}
                        onChange={(e) => setTargetMetadataValue(e.target.value)}
                        placeholder="e.g. 12"
                      />
                    </div>
                  </div>
                )}

                {activeDrawer === "delete" && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-ui-bg-subtle border border-ui-border-error rounded-md text-xs text-ui-fg-error">
                      Warning: Deleting selected products is permanent. Type &quot;DELETE&quot; below to confirm.
                    </div>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                    />
                  </div>
                )}

                <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-ui-border-base">
                  <Button variant="secondary" onClick={() => setActiveDrawer(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={activeDrawer === "delete" ? "danger" : "primary"}
                    disabled={submittingAction || (activeDrawer === "delete" && deleteConfirmText !== "DELETE")}
                  >
                    {submittingAction && <Spinner className="w-3 h-3 animate-spin mr-1" />}
                    Confirm {activeDrawer}
                  </Button>
                </div>
              </form>
            </Drawer.Content>
          </Drawer>
        </>
      ) : (
        /* AUDIT HISTORY TAB */
        <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base shadow-sm">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Operation</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Progress</Table.HeaderCell>
                <Table.HeaderCell>Success / Fail</Table.HeaderCell>
                <Table.HeaderCell>Started</Table.HeaderCell>
                <Table.HeaderCell>Completed</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loadingHistory ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-8">
                    Loading history...
                  </Table.Cell>
                </Table.Row>
              ) : pastOperations.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-8 text-ui-fg-subtle">
                    No past bulk operations recorded
                  </Table.Cell>
                </Table.Row>
              ) : (
                pastOperations.map((op) => (
                  <Table.Row key={op.id}>
                    <Table.Cell className="font-semibold text-xs capitalize">
                      {op.action.replace(/_/g, " ")}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge
                        color={
                          op.status === "completed"
                            ? "green"
                            : op.status === "failed"
                            ? "red"
                            : op.status === "completed_with_errors"
                            ? "orange"
                            : "blue"
                        }
                      >
                        {op.status}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      {op.processed} / {op.total}
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className="text-ui-fg-interactive">{op.successful} ok</span>
                      {op.failed > 0 && <span className="text-ui-fg-error ml-2">{op.failed} failed</span>}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle">
                      {new Date(op.created_at).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle">
                      {op.completed_at ? new Date(op.completed_at).toLocaleString() : "-"}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* FAILURES DRAWER */}
      <Drawer open={showFailuresDrawer} onOpenChange={() => setShowFailuresDrawer(false)}>
        <Drawer.Content className="max-w-[500px]">
          <Drawer.Header>
            <Drawer.Title className="text-sm font-semibold">Failed Operation Items</Drawer.Title>
          </Drawer.Header>
          <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
            {failedItems.map((item) => (
              <div key={item.id} className="p-3 bg-ui-bg-subtle border border-ui-border-error rounded-md text-xs">
                <div className="font-semibold text-ui-fg-base mb-1">Item ID: {item.entity_id}</div>
                <div className="text-ui-fg-error">{item.error || "Unknown error"}</div>
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bulk Products",
  icon: SquareTwoStack,
})

export default BulkProductsPage
