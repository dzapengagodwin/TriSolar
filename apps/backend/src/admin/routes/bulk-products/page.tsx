import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquareTwoStack, Spinner } from "@medusajs/icons"
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
import { useState, useEffect, useCallback, useRef } from "react"

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

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAllMatching, setSelectAllMatching] = useState(false)

  // Pagination
  const [limit] = useState(15)
  const [offset, setOffset] = useState(0)

  // Floating Action Drawers
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null) // "status", "brand", "category", "collection", "metadata", "delete"
  const [submittingAction, setSubmittingAction] = useState(false)

  // Drawer Form States
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

  // Fetch filter dropdown options
  const fetchFilterOptions = useCallback(async () => {
    try {
      // 1. Fetch custom brands
      const brandsRes = await fetch("/admin/brands?limit=100", { credentials: "include" })
      if (brandsRes.ok) {
        const data = await brandsRes.json()
        setBrands(data.brands || [])
      }

      // 2. Fetch Medusa collections
      const collectionsRes = await fetch("/admin/collections?limit=100", { credentials: "include" })
      if (collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCollections(data.collections || [])
      }

      // 3. Fetch Medusa categories
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

      // If brand filter is selected, query brand's linked product IDs
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

      // Standard API query with server-side filtering
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

      // Terminal state check
      if (["completed", "completed_with_errors", "failed", "cancelled"].includes(op.status)) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }

        toast.success("Bulk Action Complete", {
          description: `Bulk operation completed with status: ${op.status}`,
        })

        // Refresh grid and clear active state
        fetchProducts()
        fetchHistory()
        localStorage.removeItem("active_bulk_operation_id")
        
        // Retain operation details briefly for user feedback then clear
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

  // Toggle selection checkbox
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

  // Toggle select page
  const isAllSelectedOnPage = products.length > 0 && products.every((p) => selectedIds.has(p.id))
  const isSomeSelectedOnPage = products.length > 0 && products.some((p) => selectedIds.has(p.id)) && !isAllSelectedOnPage
  const toggleSelectPage = () => {
    const next = new Set(selectedIds)
    if (isAllSelectedOnPage) {
      products.forEach((p) => next.delete(p.id))
    } else {
      products.forEach((p) => next.add(p.id))
    }
    setSelectedIds(next)
    setSelectAllMatching(false)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectAllMatching(false)
  }

  const openActionDrawer = (drawer: string) => {
    setActiveDrawer(drawer)
    setDeleteConfirmText("")
  }

  // Trigger Bulk Action
  const handleExecuteBulkAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeDrawer === "delete" && deleteConfirmText !== "DELETE") {
      toast.error("Confirmation Required", { description: "Please type DELETE to proceed" })
      return
    }

    setSubmittingAction(true)
    try {
      // Build selection data discriminated union
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

      // Build payload mapping
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

      const response = await fetch("/admin/bulk-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: actionName,
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

      // Save operation context
      setActiveOpId(op.id)
      setActiveOperation(op)
      localStorage.setItem("active_bulk_operation_id", op.id)

      toast.success("Enqueued", {
        description: "Bulk operation enqueued successfully. Monitor progress below.",
      })

      // Reset selection and close modal
      clearSelection()
      setActiveDrawer(null)
    } catch (err: any) {
      toast.error("Execution Error", { description: err.message })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Cancel running operation
  const handleCancelOperation = async () => {
    if (!activeOpId) return
    try {
      const res = await fetch(`/admin/bulk-operations/${activeOpId}/cancel`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        toast.info("Cancellation Request Sent", {
          description: "Active operation will stop after the current batch finishes.",
        })
        pollOperation()
      } else {
        const data = await res.json()
        toast.error("Error", { description: data.message || "Could not cancel operation" })
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message })
    }
  }

  // Load failed items details
  const fetchFailedItems = async () => {
    if (!activeOpId) return
    try {
      const res = await fetch(`/admin/bulk-operations/${activeOpId}/items?status=failed`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setFailedItems(data.items || [])
        setShowFailuresDrawer(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Container className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1">
            Bulk Operations Workspace
          </Heading>
          <Text className="text-xs text-ui-fg-subtle">
            Select products and run secure batch transformations in background queue jobs.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "workspace" ? "primary" : "secondary"}
            onClick={() => setActiveTab("workspace")}
            size="small"
          >
            Workspace
          </Button>
          <Button
            variant={activeTab === "history" ? "primary" : "secondary"}
            onClick={() => setActiveTab("history")}
            size="small"
          >
            Audit History Logs
          </Button>
        </div>
      </div>

      {/* 1. PROGRESS REPORTING PANEL */}
      {activeOperation && (
        <Container className="mb-6 p-4 border border-ui-border-interactive bg-ui-bg-subtle rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Spinner className="w-5 h-5 text-ui-fg-interactive" />
              <Heading level="h3" className="text-sm font-semibold">
                Bulk operation: <Badge variant="info">{activeOperation.action}</Badge>
              </Heading>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeOperation.status === "processing" ? "info" : "warning"}>
                {activeOperation.status}
              </Badge>
              {["pending", "processing"].includes(activeOperation.status) && (
                <Button variant="danger" size="small" onClick={handleCancelOperation}>
                  Cancel Operation
                </Button>
              )}
            </div>
          </div>

          <div className="w-full bg-ui-bg-base rounded-full h-2 overflow-hidden border border-ui-border-base">
            <div
              className="bg-ui-button-inverted h-2 transition-all duration-300"
              style={{
                width: `${
                  activeOperation.total > 0
                    ? (activeOperation.processed / activeOperation.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-ui-fg-subtle">
            <span>
              Processed: {activeOperation.processed} / {activeOperation.total} (
              {activeOperation.total > 0
                ? Math.round((activeOperation.processed / activeOperation.total) * 100)
                : 0}
              %)
            </span>
            <div className="flex gap-4">
              <span className="text-ui-fg-success font-medium">
                Success: {activeOperation.successful}
              </span>
              <span className="text-ui-fg-error font-medium">
                Failed: {activeOperation.failed}
              </span>
            </div>
          </div>

          {activeOperation.failed > 0 && (
            <Button
              variant="transparent"
              size="small"
              className="text-xs text-ui-fg-interactive hover:underline p-0 self-start text-left"
              onClick={fetchFailedItems}
            >
              View Failure Logs ({activeOperation.failed} errors)
            </Button>
          )}
        </Container>
      )}

      {activeTab === "workspace" ? (
        <>
          {/* 2. WORKSPACE GRID & FILTERS */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Input
              type="search"
              placeholder="Search products..."
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

          {/* Select all matching banner */}
          {isAllSelectedOnPage && totalCount > products.length && (
            <div className="bg-ui-bg-highlight border border-ui-border-interactive rounded-md p-3 mb-4 flex items-center justify-between text-xs">
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

          {/* Table list */}
          <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="w-[40px] pl-4">
                    <Checkbox
                      checked={isAllSelectedOnPage ? true : isSomeSelectedOnPage ? "indeterminate" : false}
                      onCheckedChange={toggleSelectPage}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Brand</Table.HeaderCell>
                  <Table.HeaderCell>Collection</Table.HeaderCell>
                  <Table.HeaderCell>Categories</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center py-8">
                      Loading products...
                    </Table.Cell>
                  </Table.Row>
                ) : products.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center py-8 text-ui-fg-subtle">
                      No matching products found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  products.map((product) => {
                    const isChecked = selectedIds.has(product.id)
                    return (
                      <Table.Row
                        key={product.id}
                        className={clx({ "bg-ui-bg-highlight-subtle": isChecked })}
                      >
                        <Table.Cell className="pl-4">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSelectItem(product.id)}
                          />
                        </Table.Cell>
                        <Table.Cell className="font-medium text-ui-fg-base text-xs">
                          {product.title}
                        </Table.Cell>
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
                        <Table.Cell className="text-xs text-ui-fg-subtle">{product.brand?.name || "-"}</Table.Cell>
                        <Table.Cell className="text-xs text-ui-fg-subtle">{product.collection?.title || "-"}</Table.Cell>
                        <Table.Cell className="text-xs text-ui-fg-subtle">
                          {product.categories?.map((c: any) => c.name).join(", ") || "-"}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                )}
              </Table.Body>
            </Table>
            <div className="flex justify-between items-center p-4 border-t border-ui-border-base text-xs text-ui-fg-subtle bg-ui-bg-subtle">
              <span>
                Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} items
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

          {/* Bulk Actions CommandBar */}
          <CommandBar open={selectedIds.size > 0}>
            <CommandBar.Bar>
              <CommandBar.Value>
                {selectAllMatching ? `${totalCount} (All)` : selectedIds.size} selected
              </CommandBar.Value>
              <CommandBar.Seperator />
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

          {/* ACTION MODAL DRAWERS */}
          <Drawer open={!!activeDrawer} onOpenChange={() => setActiveDrawer(null)}>
            <Drawer.Content className="max-w-[450px]">
              <Drawer.Header>
                <Drawer.Title className="text-sm font-semibold capitalize">
                  Bulk {activeDrawer} Update
                </Drawer.Title>
              </Drawer.Header>
              <form onSubmit={handleExecuteBulkAction} className="p-4 flex flex-col gap-4 h-full">
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
                    <Select
                      value={targetBrandId || "none"}
                      onValueChange={(val) => setTargetBrandId(val === "none" ? "" : val)}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select Brand" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="none">No Brand (Unlink)</Select.Item>
                        {brands.map((b) => (
                          <Select.Item key={b.id} value={b.id}>
                            {b.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}

                {activeDrawer === "collection" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Assign Collection</label>
                    <Select
                      value={targetCollectionId || "none"}
                      onValueChange={(val) => setTargetCollectionId(val === "none" ? "" : val)}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select Collection" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="none">No Collection</Select.Item>
                        {collections.map((col) => (
                          <Select.Item key={col.id} value={col.id}>
                            {col.title}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}

                {activeDrawer === "category" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-ui-fg-base">Select Categories</label>
                    <div className="border border-ui-border-base rounded p-2 max-h-[200px] overflow-y-auto flex flex-col gap-2">
                      {categories.map((cat) => {
                        const isChecked = targetCategoryIds.includes(cat.id)
                        return (
                          <label key={cat.id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => {
                                if (isChecked) {
                                  setTargetCategoryIds(targetCategoryIds.filter((cid) => cid !== cat.id))
                                } else {
                                  setTargetCategoryIds([...targetCategoryIds, cat.id])
                                }
                              }}
                            />
                            <span className="text-ui-fg-base">{cat.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeDrawer === "metadata" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-ui-fg-base">Key</label>
                      <Input
                        placeholder="e.g. processor_type"
                        value={targetMetadataKey}
                        onChange={(e) => setTargetMetadataKey(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-ui-fg-base">Value</label>
                      <Input
                        placeholder="e.g. Intel Core i7"
                        value={targetMetadataValue}
                        onChange={(e) => setTargetMetadataValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {activeDrawer === "delete" && (
                  <div className="flex flex-col gap-3 bg-ui-bg-error-subtle p-3 rounded-lg border border-ui-border-error">
                    <Heading level="h3" className="text-xs text-ui-fg-error">
                      Warning: Dangerous Action
                    </Heading>
                    <Text className="text-xs text-ui-fg-subtle">
                      This will permanently delete {selectAllMatching ? totalCount : selectedIds.size} products from your store database. This action cannot be undone.
                    </Text>
                    <div className="flex flex-col gap-1">
                      <Label size="small" className="text-ui-fg-base">
                        Type <span className="font-medium text-ui-fg-error">DELETE</span> to confirm
                      </Label>
                      <Input
                        placeholder="DELETE"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-ui-border-base">
                  <Button variant="secondary" type="button" onClick={() => setActiveDrawer(null)}>
                    Cancel
                  </Button>
                  <Button variant={activeDrawer === "delete" ? "danger" : "primary"} type="submit" disabled={submittingAction}>
                    {submittingAction ? "Queueing..." : "Execute Bulk Update"}
                  </Button>
                </div>
              </form>
            </Drawer.Content>
          </Drawer>

          {/* FAILURES LOG DETAILS DRAWER */}
          <Drawer open={showFailuresDrawer} onOpenChange={setShowFailuresDrawer}>
            <Drawer.Content className="max-w-[550px]">
              <Drawer.Header>
                <Drawer.Title className="text-sm font-semibold">Bulk Operation Failure Audit</Drawer.Title>
              </Drawer.Header>
              <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
                <Text className="text-xs text-ui-fg-subtle">
                  Below are the individual product operations that returned errors during batch worker runs.
                </Text>
                <div className="flex flex-col gap-3">
                  {failedItems.map((item) => (
                    <div key={item.id} className="p-3 border border-ui-border-error bg-ui-bg-error-subtle rounded-lg flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>Product ID: {item.entity_id}</span>
                        <Badge variant="danger">Failed</Badge>
                      </div>
                      <p className="text-ui-fg-error font-mono break-all mt-1">{item.error || "Unknown execution error"}</p>
                      <span className="text-[10px] text-ui-fg-subtle mt-1">
                        Attempts: {item.attempts} | Processed: {item.processed_at ? new Date(item.processed_at).toLocaleString() : "-"}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="mt-auto" variant="secondary" onClick={() => setShowFailuresDrawer(false)}>
                  Close
                </Button>
              </div>
            </Drawer.Content>
          </Drawer>
        </>
      ) : (
        /* 3. AUDIT HISTORY LIST */
        <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Operation ID</Table.HeaderCell>
                <Table.HeaderCell>Action</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Success / Failures</Table.HeaderCell>
                <Table.HeaderCell>Processed / Total</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
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
                    No past bulk operations found
                  </Table.Cell>
                </Table.Row>
              ) : (
                pastOperations.map((op) => (
                  <Table.Row key={op.id}>
                    <Table.Cell className="font-mono text-[10px]">{op.id}</Table.Cell>
                    <Table.Cell className="font-semibold capitalize">{op.action}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          op.status === "completed"
                            ? "success"
                            : op.status === "completed_with_errors"
                            ? "warning"
                            : op.status === "failed"
                            ? "danger"
                            : "info"
                        }
                      >
                        {op.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-ui-fg-success font-medium">{op.successful} success</span>
                      <span className="mx-2">/</span>
                      <span className="text-ui-fg-error font-medium">{op.failed} failed</span>
                    </Table.Cell>
                    <Table.Cell>
                      {op.processed} / {op.total}
                    </Table.Cell>
                    <Table.Cell className="text-ui-fg-subtle text-[11px]">
                      {new Date(op.created_at).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Bulk Workspace",
  icon: SquareTwoStack,
})

export default BulkProductsPage
