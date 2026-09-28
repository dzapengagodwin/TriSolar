import { Drawer, Button, Input, Checkbox, Select, Badge, toast } from "@medusajs/ui"
import { MagnifyingGlass, Spinner } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"

export type BulkCollectionProductsDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  defaultMode?: "add" | "remove"
  onSuccess: () => void
}

type ProductOption = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
}

export const BulkCollectionProductsDrawer = ({
  open,
  onClose,
  selectedIds,
  defaultMode = "add",
  onSuccess,
}: BulkCollectionProductsDrawerProps) => {
  const [mode, setMode] = useState<"add" | "remove">(defaultMode)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Sync defaultMode when opened
  useEffect(() => {
    if (open) {
      setMode(defaultMode)
      setSelectedProductIds([])
      setSearchQuery("")
    }
  }, [open, defaultMode])

  // Fetch products for selection
  const fetchProducts = useCallback(async (query: string) => {
    setLoadingProducts(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", "25")
      params.set("fields", "id,title,handle,thumbnail")
      if (query.trim()) {
        params.set("q", query.trim())
      }

      const res = await fetch(`/admin/products?${params.toString()}`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("Error fetching products:", err)
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const debounceTimer = setTimeout(() => {
        fetchProducts(searchQuery)
      }, 250)
      return () => clearTimeout(debounceTimer)
    }
  }, [open, searchQuery, fetchProducts])

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSubmit = async () => {
    if (selectedProductIds.length === 0) return

    setSubmitting(true)
    try {
      const action = mode === "add" ? "add_products" : "remove_products"
      const res = await fetch("/admin/collections/batch-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collection_ids: selectedIds,
          action,
          data: {
            product_ids: selectedProductIds,
          },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to ${mode} products`)
      }

      toast.success(
        mode === "add" ? "Products Added" : "Products Removed",
        {
          description: `Successfully ${mode === "add" ? "added" : "removed"} ${selectedProductIds.length} products across ${selectedIds.length} collections`,
        }
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error("Operation Failed", {
        description: err.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(val) => !val && onClose()}>
      <Drawer.Content className="max-w-lg">
        <Drawer.Header>
          <Drawer.Title>
            {mode === "add" ? "Add Products to Collections" : "Remove Products from Collections"}
          </Drawer.Title>
          <Drawer.Description>
            {mode === "add" ? "Link" : "Unlink"} selected products across {selectedIds.length} collections simultaneously.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="p-4 flex flex-col gap-4">
          {/* Action Mode Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Action Type
            </label>
            <Select value={mode} onValueChange={(val: "add" | "remove") => setMode(val)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="add">Add Products to Collections</Select.Item>
                <Select.Item value="remove">Remove Products from Collections</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Product Search */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ui-fg-base">
                Select Products
              </label>
              {selectedProductIds.length > 0 && (
                <Badge size="small" color="blue">
                  {selectedProductIds.length} selected
                </Badge>
              )}
            </div>

            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-ui-fg-muted w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title or handle..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Product Selection List */}
          <div className="border border-ui-border-base rounded-md divide-y divide-ui-border-base max-h-[300px] overflow-y-auto bg-ui-bg-base">
            {loadingProducts ? (
              <div className="p-6 flex items-center justify-center gap-2 text-ui-fg-subtle text-sm">
                <Spinner className="animate-spin w-4 h-4" />
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-ui-fg-subtle text-sm">
                No products found matching query.
              </div>
            ) : (
              products.map((product) => {
                const isSelected = selectedProductIds.includes(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-ui-bg-subtle-hover ${
                      isSelected ? "bg-ui-bg-highlight" : ""
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt=""
                        className="w-8 h-8 object-cover rounded border border-ui-border-base flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-ui-bg-subtle border border-ui-border-base rounded flex items-center justify-center text-[10px] text-ui-fg-muted flex-shrink-0">
                        N/A
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-ui-fg-base truncate">
                        {product.title}
                      </span>
                      <span className="text-xs text-ui-fg-muted truncate">
                        {product.handle}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={mode === "remove" ? "danger" : "primary"}
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={selectedProductIds.length === 0}
          >
            {mode === "add" ? "Add" : "Remove"} {selectedProductIds.length} Products
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
