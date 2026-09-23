import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  StatusBadge,
  Drawer,
  Input,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type ProductBrandWidgetProps = {
  data: {
    id: string
    title?: string
  }
}

const ProductBrandWidget = ({ data }: ProductBrandWidgetProps) => {
  const [currentBrand, setCurrentBrand] = useState<any | null>(null)
  const [allBrands, setAllBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchBrandData = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    try {
      // 1. Fetch current brand for product
      const productBrandRes = await fetch(`/admin/products/${data.id}/brand`, {
        credentials: "include",
      })
      if (productBrandRes.ok) {
        const prodData = await productBrandRes.json()
        setCurrentBrand(prodData.brand || null)
        setSelectedBrandId(prodData.brand?.id || "")
      }

      // 2. Fetch all brands for selection
      const brandsRes = await fetch("/admin/brands?limit=250", {
        credentials: "include",
      })
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setAllBrands(brandsData.brands || [])
      }
    } catch (err: any) {
      console.error("Error fetching product brand:", err)
    } finally {
      setLoading(false)
    }
  }, [data?.id])

  useEffect(() => {
    fetchBrandData()
  }, [fetchBrandData])

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands
    const q = searchQuery.toLowerCase().trim()
    return allBrands.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.handle?.toLowerCase().includes(q)
    )
  }, [allBrands, searchQuery])

  const handleOpenDrawer = () => {
    setSelectedBrandId(currentBrand?.id || "")
    setSearchQuery("")
    setIsModalOpen(true)
  }

  const handleSaveBrand = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${data.id}/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand_id: selectedBrandId || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to update product brand")
      }

      const updatedData = await res.json()
      setCurrentBrand(updatedData.brand || null)
      toast.success("Success", {
        description: selectedBrandId
          ? "Brand assigned to product"
          : "Brand removed from product",
      })
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error("Error", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveBrand = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/products/${data.id}/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand_id: null,
        }),
      })

      if (!res.ok) throw new Error("Failed to remove brand")

      setCurrentBrand(null)
      setSelectedBrandId("")
      toast.success("Success", { description: "Brand unlinked from product" })
    } catch (err: any) {
      toast.error("Error", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
          Brand
        </Heading>
        <div className="flex items-center gap-2">
          {currentBrand && (
            <Button
              variant="transparent"
              size="small"
              className="text-ui-fg-muted hover:text-ui-fg-danger text-xs"
              onClick={handleRemoveBrand}
              disabled={saving}
            >
              Remove
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={handleOpenDrawer}
          >
            {currentBrand ? "Change" : "+ Assign Brand"}
          </Button>
        </div>
      </div>

      {loading ? (
        <Text size="small" className="text-ui-fg-muted">
          Loading brand info...
        </Text>
      ) : currentBrand ? (
        <div className="flex items-center justify-between p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          <div className="flex items-center gap-3">
            {currentBrand.logo ? (
              <img
                src={currentBrand.logo}
                alt={currentBrand.name}
                className="w-9 h-9 rounded-md object-contain border border-ui-border-base bg-white p-1"
              />
            ) : (
              <div className="w-9 h-9 rounded-md bg-ui-bg-base border border-ui-border-base flex items-center justify-center font-medium text-xs text-ui-fg-muted">
                {currentBrand.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <Text size="base" className="font-medium text-ui-fg-base">
                {currentBrand.name}
              </Text>
              <code className="text-xs text-ui-fg-muted bg-ui-bg-base px-1.5 py-0.5 rounded border border-ui-border-base">
                {currentBrand.handle}
              </code>
            </div>
          </div>
          <StatusBadge color={currentBrand.is_active ? "green" : "grey"}>
            {currentBrand.is_active ? "Active" : "Disabled"}
          </StatusBadge>
        </div>
      ) : (
        <div className="text-center py-4 border border-dashed border-ui-border-base rounded-lg">
          <Text size="small" className="text-ui-fg-muted">
            No brand assigned to this product.
          </Text>
        </div>
      )}

      {/* Select Brand Drawer with Instant Search */}
      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Drawer.Content className="max-w-md p-6 flex flex-col h-full">
          <Drawer.Header>
            <Drawer.Title>Assign Brand</Drawer.Title>
            <Drawer.Description>
              Search and select a brand for &quot;{data?.title || "this product"}&quot;.
            </Drawer.Description>
          </Drawer.Header>

          <div className="space-y-3 my-4 flex-1 flex flex-col min-h-0">
            {/* Search Input */}
            <div>
              <Input
                placeholder="Search brands by name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Scrollable Brands List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border border-ui-border-base rounded-lg p-2 bg-ui-bg-subtle max-h-[380px]">
              {/* Option: No Brand */}
              <div
                onClick={() => setSelectedBrandId("")}
                className={clx(
                  "flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors text-sm border",
                  selectedBrandId === ""
                    ? "bg-ui-bg-base border-ui-border-interactive shadow-sm font-medium text-ui-fg-base"
                    : "border-transparent hover:bg-ui-bg-base text-ui-fg-subtle"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center text-xs text-ui-fg-muted font-medium">
                    ∅
                  </div>
                  <span>No Brand (Unassigned)</span>
                </div>
                {selectedBrandId === "" && (
                  <Badge color="blue" size="small">Selected</Badge>
                )}
              </div>

              {/* Filtered Brands */}
              {filteredBrands.map((b) => {
                const isSelected = selectedBrandId === b.id
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBrandId(b.id)}
                    className={clx(
                      "flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors text-sm border",
                      isSelected
                        ? "bg-ui-bg-base border-ui-border-interactive shadow-sm font-medium text-ui-fg-base"
                        : "border-transparent hover:bg-ui-bg-base text-ui-fg-subtle"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="w-7 h-7 rounded object-contain border border-ui-border-base bg-white p-0.5"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded bg-ui-bg-base border border-ui-border-base flex items-center justify-center text-xs font-medium text-ui-fg-muted shrink-0">
                          {b.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-xs text-ui-fg-base">
                          {b.name}
                        </p>
                        <p className="truncate text-[11px] text-ui-fg-muted font-mono">
                          {b.handle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {b.is_active === false && (
                        <Badge color="grey" size="small">Disabled</Badge>
                      )}
                      {isSelected && (
                        <Badge color="blue" size="small">Selected</Badge>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredBrands.length === 0 && (
                <div className="text-center py-8 text-ui-fg-muted text-xs">
                  {searchQuery
                    ? `No brands match "${searchQuery}"`
                    : "No brands available"}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-ui-fg-muted px-1">
              <span>{allBrands.length} total brands</span>
              {searchQuery && <span>{filteredBrands.length} found</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBrand}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Selection"}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductBrandWidget
