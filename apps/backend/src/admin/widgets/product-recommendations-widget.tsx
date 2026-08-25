import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  StatusBadge,
  Drawer,
  Input,
  Select,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type ProductRecommendationsWidgetProps = {
  data: {
    id: string
    title?: string
  }
}

const TYPE_OPTIONS = [
  { value: "upsell", label: "Upsell" },
  { value: "cross_sell", label: "Cross-sell" },
  { value: "related", label: "Related Product" },
  { value: "accessory", label: "Accessory" },
  { value: "alternative", label: "Alternative" },
]

const TYPE_COLORS: Record<string, "blue" | "green" | "purple" | "orange" | "grey"> = {
  upsell: "green",
  cross_sell: "purple",
  related: "blue",
  accessory: "orange",
  alternative: "grey",
}

const SOURCE_COLORS: Record<string, "grey" | "blue" | "purple" | "green"> = {
  manual: "grey",
  rule: "blue",
  ai: "purple",
  behavioral: "green",
}

const ProductRecommendationsWidget = ({
  data,
}: ProductRecommendationsWidgetProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Add / Edit Drawer states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRec, setEditingRec] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  // Search products in Drawer
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [selectedTargetProductId, setSelectedTargetProductId] = useState<string>("")
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  // Form states
  const [formType, setFormType] = useState<string>("related")
  const [formPriority, setFormPriority] = useState<number>(0)
  const [formIsActive, setFormIsActive] = useState<boolean>(true)
  const [formStartAt, setFormStartAt] = useState<string>("")
  const [formEndAt, setFormEndAt] = useState<string>("")

  // Fetch recommendations for this product
  const fetchRecommendations = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    try {
      const res = await fetch(
        `/admin/products/${data.id}/recommendations?limit=100`,
        { credentials: "include" }
      )
      if (res.ok) {
        const json = await res.json()
        setRecommendations(json.recommendations || [])
      }
    } catch (err) {
      console.error("Error loading recommendations:", err)
    } finally {
      setLoading(false)
    }
  }, [data?.id])

  // Fetch catalog products for selection drawer
  const fetchCatalogProducts = useCallback(async (query = "") => {
    if (!data?.id) return
    setLoadingCatalog(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", "50")
      if (query.trim()) {
        params.set("q", query.trim())
      }
      const res = await fetch(`/admin/products?${params.toString()}`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        // Filter out current product to prevent self-recommendation
        const prods = (json.products || []).filter(
          (p: any) => p.id !== data.id
        )
        setCatalogProducts(prods)
      }
    } catch (err) {
      console.error("Error searching catalog products:", err)
    } finally {
      setLoadingCatalog(false)
    }
  }, [data?.id])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const filteredRecommendations = useMemo(() => {
    if (activeTab === "all") return recommendations
    return recommendations.filter((r) => r.type === activeTab)
  }, [recommendations, activeTab])

  const openAddDrawer = () => {
    setSelectedTargetProductId("")
    setProductSearchQuery("")
    setFormType(activeTab === "all" ? "related" : activeTab)
    setFormPriority(0)
    setFormIsActive(true)
    setFormStartAt("")
    setFormEndAt("")
    fetchCatalogProducts()
    setIsAddOpen(true)
  }

  const openEditDrawer = (rec: any) => {
    setEditingRec(rec)
    setFormType(rec.type || "related")
    setFormPriority(rec.priority || 0)
    setFormIsActive(rec.is_active ?? true)
    setFormStartAt(
      rec.start_at ? new Date(rec.start_at).toISOString().slice(0, 16) : ""
    )
    setFormEndAt(
      rec.end_at ? new Date(rec.end_at).toISOString().slice(0, 16) : ""
    )
    setIsEditOpen(true)
  }

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTargetProductId) {
      toast.error("Validation Error", {
        description: "Please select a product to recommend",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${data.id}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recommended_product_id: selectedTargetProductId,
          type: formType,
          priority: Number(formPriority) || 0,
          is_active: formIsActive,
          start_at: formStartAt ? new Date(formStartAt).toISOString() : null,
          end_at: formEndAt ? new Date(formEndAt).toISOString() : null,
          source: "manual",
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to create recommendation")
      }

      toast.success("Success", {
        description: "Product recommendation linked successfully",
      })
      setIsAddOpen(false)
      fetchRecommendations()
    } catch (err: any) {
      toast.error("Creation Failed", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRec) return

    setSaving(true)
    try {
      const res = await fetch(
        `/admin/products/${data.id}/recommendations/${editingRec.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: formType,
            priority: Number(formPriority) || 0,
            is_active: formIsActive,
            start_at: formStartAt ? new Date(formStartAt).toISOString() : null,
            end_at: formEndAt ? new Date(formEndAt).toISOString() : null,
          }),
        }
      )

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to update recommendation")
      }

      toast.success("Success", {
        description: "Recommendation updated successfully",
      })
      setIsEditOpen(false)
      fetchRecommendations()
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (rec: any) => {
    try {
      const nextState = !rec.is_active
      const res = await fetch(
        `/admin/products/${data.id}/recommendations/${rec.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ is_active: nextState }),
        }
      )

      if (!res.ok) throw new Error("Failed to toggle status")

      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_active: nextState } : r))
      )
      toast.success("Status Updated", {
        description: `Recommendation marked as ${nextState ? "Active" : "Disabled"}`,
      })
    } catch (err: any) {
      toast.error("Error", { description: err.message })
    }
  }

  const handleDeleteRecommendation = async (rec: any) => {
    if (
      !window.confirm(
        `Are you sure you want to remove recommendation for "${rec.recommended_product?.title || rec.recommended_product_id}"?`
      )
    ) {
      return
    }

    try {
      const res = await fetch(
        `/admin/products/${data.id}/recommendations/${rec.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      if (!res.ok) throw new Error("Failed to delete recommendation")

      toast.success("Removed", {
        description: "Recommendation unlinked successfully",
      })
      fetchRecommendations()
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message })
    }
  }

  const handleMovePosition = async (index: number, direction: "up" | "down") => {
    const list = [...filteredRecommendations]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    const [moved] = list.splice(index, 1)
    list.splice(targetIndex, 0, moved)

    const orderedIds = list.map((item) => item.id)

    try {
      const res = await fetch(
        `/admin/products/${data.id}/recommendations/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: activeTab === "all" ? moved.type : activeTab,
            ordered_ids: orderedIds,
          }),
        }
      )

      if (!res.ok) throw new Error("Failed to reorder")

      toast.success("Reordered", { description: "Positions updated" })
      fetchRecommendations()
    } catch (err: any) {
      toast.error("Reorder Failed", { description: err.message })
    }
  }

  return (
    <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ui-border-base pb-4">
        <div>
          <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
            Merchandising & Recommendations
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Manage upsells, cross-sells, accessories, alternatives, and related products for this item.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={openAddDrawer}>
          + Add Recommendation
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ui-border-base pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={clx(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
            activeTab === "all"
              ? "bg-ui-bg-subtle text-ui-fg-base font-semibold border border-ui-border-base"
              : "text-ui-fg-muted hover:text-ui-fg-base"
          )}
        >
          All ({recommendations.length})
        </button>
        {TYPE_OPTIONS.map((opt) => {
          const count = recommendations.filter((r) => r.type === opt.value).length
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveTab(opt.value)}
              className={clx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === opt.value
                  ? "bg-ui-bg-subtle text-ui-fg-base font-semibold border border-ui-border-base"
                  : "text-ui-fg-muted hover:text-ui-fg-base"
              )}
            >
              {opt.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Recommendations Table */}
      <div className="border border-ui-border-base rounded-lg overflow-hidden bg-ui-bg-base">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-12 text-center">#</Table.HeaderCell>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Priority</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Schedule</Table.HeaderCell>
              <Table.HeaderCell>Source</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8 text-ui-fg-muted">
                  Loading recommendations...
                </Table.Cell>
              </Table.Row>
            ) : filteredRecommendations.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-8 text-ui-fg-muted">
                  No {activeTab !== "all" ? activeTab : ""} recommendations configured yet. Click &quot;+ Add Recommendation&quot; to assign.
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredRecommendations.map((rec, index) => {
                const prod = rec.recommended_product
                const hasSchedule = rec.start_at || rec.end_at
                return (
                  <Table.Row
                    key={rec.id}
                    className="hover:bg-ui-bg-subtle transition-colors"
                  >
                    {/* Position & Move */}
                    <Table.Cell className="text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePosition(index, "up")}
                          className="text-[10px] text-ui-fg-muted hover:text-ui-fg-base disabled:opacity-30"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <span className="text-xs font-mono text-ui-fg-muted">
                          {rec.position ?? index}
                        </span>
                        <button
                          type="button"
                          disabled={index === filteredRecommendations.length - 1}
                          onClick={() => handleMovePosition(index, "down")}
                          className="text-[10px] text-ui-fg-muted hover:text-ui-fg-base disabled:opacity-30"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </Table.Cell>

                    {/* Product */}
                    <Table.Cell>
                      <div className="flex items-center gap-3 min-w-0">
                        {prod?.thumbnail ? (
                          <img
                            src={prod.thumbnail}
                            alt={prod.title || "Product"}
                            className="w-9 h-9 rounded object-cover border border-ui-border-base bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center text-xs text-ui-fg-muted shrink-0 font-bold">
                            P
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-ui-fg-base truncate">
                            {prod?.title || rec.recommended_product_id}
                          </p>
                          <p className="text-[11px] text-ui-fg-muted font-mono truncate">
                            {prod?.handle || rec.recommended_product_id}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Type */}
                    <Table.Cell>
                      <Badge
                        color={TYPE_COLORS[rec.type] || "grey"}
                        size="small"
                      >
                        {rec.type.replace("_", " ")}
                      </Badge>
                    </Table.Cell>

                    {/* Priority */}
                    <Table.Cell>
                      <span className="text-xs font-mono bg-ui-bg-subtle px-1.5 py-0.5 rounded border border-ui-border-base">
                        {rec.priority || 0}
                      </span>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rec)}
                        className="cursor-pointer"
                      >
                        <StatusBadge color={rec.is_active ? "green" : "grey"}>
                          {rec.is_active ? "Active" : "Disabled"}
                        </StatusBadge>
                      </button>
                    </Table.Cell>

                    {/* Schedule */}
                    <Table.Cell>
                      {hasSchedule ? (
                        <div className="text-[11px] text-ui-fg-muted font-mono space-y-0.5">
                          {rec.start_at && (
                            <div>From: {new Date(rec.start_at).toLocaleDateString()}</div>
                          )}
                          {rec.end_at && (
                            <div>To: {new Date(rec.end_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ui-fg-muted">Always</span>
                      )}
                    </Table.Cell>

                    {/* Source */}
                    <Table.Cell>
                      <Badge
                        color={SOURCE_COLORS[rec.source] || "grey"}
                        size="small"
                      >
                        {rec.source || "manual"}
                      </Badge>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell className="text-right space-x-1.5">
                      <Button
                        variant="transparent"
                        size="small"
                        className="text-xs text-ui-fg-subtle hover:text-ui-fg-base"
                        onClick={() => openEditDrawer(rec)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="transparent"
                        size="small"
                        className="text-xs text-ui-fg-danger hover:text-ui-fg-danger-hover"
                        onClick={() => handleDeleteRecommendation(rec)}
                      >
                        Remove
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Add Recommendation Drawer */}
      <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
        <Drawer.Content className="max-w-md p-6 flex flex-col h-full">
          <Drawer.Header>
            <Drawer.Title>Add Product Recommendation</Drawer.Title>
            <Drawer.Description>
              Select a target product and assign recommendation merchandising rules.
            </Drawer.Description>
          </Drawer.Header>

          <form
            onSubmit={handleCreateRecommendation}
            className="space-y-4 my-4 flex-1 flex flex-col min-h-0"
          >
            {/* Recommendation Type */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                Recommendation Type *
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-ui-bg-base border border-ui-border-base rounded-md p-2 text-xs text-ui-fg-base"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Product Search & Selection */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <label className="text-xs font-semibold text-ui-fg-base block">
                Target Recommended Product *
              </label>
              <Input
                placeholder="Search catalog products..."
                value={productSearchQuery}
                onChange={(e) => {
                  setProductSearchQuery(e.target.value)
                  fetchCatalogProducts(e.target.value)
                }}
              />

              <div className="flex-1 overflow-y-auto space-y-1.5 border border-ui-border-base rounded-lg p-2 bg-ui-bg-subtle max-h-56">
                {loadingCatalog ? (
                  <div className="text-center py-4 text-xs text-ui-fg-muted">
                    Searching products...
                  </div>
                ) : catalogProducts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-ui-fg-muted">
                    No products found
                  </div>
                ) : (
                  catalogProducts.map((p) => {
                    const isSelected = selectedTargetProductId === p.id
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedTargetProductId(p.id)}
                        className={clx(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs border",
                          isSelected
                            ? "bg-ui-bg-base border-ui-border-interactive shadow-xs font-medium text-ui-fg-base"
                            : "border-transparent hover:bg-ui-bg-base text-ui-fg-subtle"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-7 h-7 rounded object-cover border border-ui-border-base bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-ui-bg-base border border-ui-border-base flex items-center justify-center text-xs font-bold text-ui-fg-muted shrink-0">
                              P
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-xs text-ui-fg-base">
                              {p.title}
                            </p>
                            <p className="truncate text-[10px] text-ui-fg-muted font-mono">
                              {p.handle}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge color="blue" size="small">Selected</Badge>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Priority & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  Priority Weight
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formPriority}
                  onChange={(e) => setFormPriority(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="form_active_add"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-ui-border-base text-ui-fg-interactive"
                />
                <label htmlFor="form_active_add" className="text-xs text-ui-fg-base">
                  Active (Live)
                </label>
              </div>
            </div>

            {/* Date Scheduling */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  Start Date (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formStartAt}
                  onChange={(e) => setFormStartAt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  End Date (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formEndAt}
                  onChange={(e) => setFormEndAt(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base mt-auto">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={saving || !selectedTargetProductId}
              >
                {saving ? "Saving..." : "Add Recommendation"}
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>

      {/* Edit Recommendation Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Drawer.Content className="max-w-md p-6">
          <Drawer.Header>
            <Drawer.Title>Edit Recommendation</Drawer.Title>
            <Drawer.Description>
              Update recommendation type, priority weight, scheduling, or active status.
            </Drawer.Description>
          </Drawer.Header>

          <form onSubmit={handleUpdateRecommendation} className="space-y-4 my-6">
            <div>
              <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                Recommendation Type *
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-ui-bg-base border border-ui-border-base rounded-md p-2 text-xs text-ui-fg-base"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  Priority Weight
                </label>
                <Input
                  type="number"
                  value={formPriority}
                  onChange={(e) => setFormPriority(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="form_active_edit"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-ui-border-base text-ui-fg-interactive"
                />
                <label htmlFor="form_active_edit" className="text-xs text-ui-fg-base">
                  Active (Live)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  Start Date
                </label>
                <Input
                  type="datetime-local"
                  value={formStartAt}
                  onChange={(e) => setFormStartAt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ui-fg-base block mb-1">
                  End Date
                </label>
                <Input
                  type="datetime-local"
                  value={formEndAt}
                  onChange={(e) => setFormEndAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductRecommendationsWidget
