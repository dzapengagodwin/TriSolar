import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquareTwoStack, Spinner, MagnifyingGlass, ArrowPath } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  StatusBadge,
  Select,
  Checkbox,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useBulkSelection } from "../../hooks/use-bulk-selection"
import {
  BulkCommandBar,
  BulkStatusDrawer,
  BulkBrandDrawer,
  BulkCategoryDrawer,
  BulkPricingDrawer,
  BulkDeleteDrawer,
} from "../../components/bulk-actions"

type ProductItem = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  status: "published" | "draft" | "proposed" | "rejected"
  brand?: { id: string; name: string } | null
  categories?: Array<{ id: string; name: string }>
  variants?: Array<{
    id: string
    title: string
    prices?: Array<{ amount: number; currency_code: string }>
  }>
}

const BulkProductsPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Dropdown data options
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  // Pagination
  const [limit] = useState(15)
  const [offset, setOffset] = useState(0)

  // Action Drawers
  const [activeDrawer, setActiveDrawer] = useState<
    "status" | "pricing" | "category" | "brand" | "delete" | null
  >(null)

  // Reusable bulk selection
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleItem,
    togglePage,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection(products)

  // Fetch filter options (brands & categories)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch("/admin/brands?limit=100", { credentials: "include" }),
        fetch("/admin/product-categories?limit=100", { credentials: "include" }),
      ])

      if (brandsRes.ok) {
        const data = await brandsRes.json()
        setBrands(data.brands || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.product_categories || [])
      }
    } catch (err) {
      console.error("Error loading filter options:", err)
    }
  }, [])

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", limit.toString())
      params.set("offset", offset.toString())
      params.set(
        "fields",
        "id,title,handle,thumbnail,status,brand.id,brand.name,categories.id,categories.name,variants.id,variants.title,variants.prices.amount,variants.prices.currency_code"
      )

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim())
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      if (categoryFilter !== "all") {
        params.set("category_id", categoryFilter)
      }

      const res = await fetch(`/admin/products?${params.toString()}`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        let fetchedProducts: ProductItem[] = data.products || []

        // If filtering by custom brand
        if (brandFilter !== "all") {
          fetchedProducts = fetchedProducts.filter(
            (p) => p.brand?.id === brandFilter
          )
        }

        setProducts(fetchedProducts)
        setTotalCount(data.count ?? fetchedProducts.length)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }, [limit, offset, searchQuery, statusFilter, categoryFilter, brandFilter])

  useEffect(() => {
    fetchFilterOptions()
  }, [fetchFilterOptions])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handle action success: refresh table & clear selection
  const handleActionSuccess = () => {
    clearSelection()
    fetchProducts()
  }

  // Format first variant price for display
  const getDisplayPrice = (product: ProductItem) => {
    const firstPrice = product.variants?.[0]?.prices?.[0]
    if (!firstPrice) return "-"
    const formatted = (firstPrice.amount / 100).toFixed(2)
    return `${firstPrice.currency_code.toUpperCase()} $${formatted}`
  }

  const totalPages = Math.ceil(totalCount / limit) || 1
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <Container className="p-0 overflow-hidden border border-ui-border-base rounded-lg bg-ui-bg-base">
      {/* Header bar */}
      <div className="p-6 border-b border-ui-border-base flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-xl font-semibold">
              Products Management & Bulk Actions
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Manage your product catalog with instant multi-row bulk updates.
            </Text>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={fetchProducts}
            disabled={loading}
          >
            <ArrowPath className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-2.5 text-ui-fg-muted w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setOffset(0)
              }}
              placeholder="Search by title, handle..."
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setOffset(0)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Filter by status..." />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Statuses</Select.Item>
              <Select.Item value="published">Published</Select.Item>
              <Select.Item value="draft">Draft</Select.Item>
            </Select.Content>
          </Select>

          {/* Brand filter */}
          <Select
            value={brandFilter}
            onValueChange={(val) => {
              setBrandFilter(val)
              setOffset(0)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Filter by brand..." />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Brands</Select.Item>
              {brands.map((b) => (
                <Select.Item key={b.id} value={b.id}>
                  {b.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val)
              setOffset(0)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Filter by category..." />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Categories</Select.Item>
              {categories.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {/* Product Table */}
      <div className="relative overflow-x-auto min-h-[350px]">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-ui-fg-subtle gap-2">
            <Spinner className="animate-spin" />
            Loading catalog...
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-12 text-center">
                  <Checkbox
                    checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                    onCheckedChange={togglePage}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell className="w-16">Image</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Brand</Table.HeaderCell>
                <Table.HeaderCell>Categories</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-8 text-ui-fg-subtle">
                    No products found matching your search and filter criteria.
                  </Table.Cell>
                </Table.Row>
              ) : (
                products.map((product) => {
                  const selected = isSelected(product.id)
                  return (
                    <Table.Row
                      key={product.id}
                      className={selected ? "bg-ui-bg-highlight" : ""}
                    >
                      <Table.Cell className="text-center">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleItem(product.id)}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-ui-border-base"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-ui-bg-subtle border border-ui-border-base rounded flex items-center justify-center text-ui-fg-muted text-[10px]">
                            N/A
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-medium text-ui-fg-base text-sm">
                            {product.title}
                          </span>
                          <span className="text-xs text-ui-fg-muted">
                            {product.handle}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {product.brand ? (
                          <Badge size="small" color="blue">
                            {product.brand.name}
                          </Badge>
                        ) : (
                          <span className="text-ui-fg-muted text-xs">-</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.slice(0, 2).map((c) => (
                              <Badge key={c.id} size="small" color="grey">
                                {c.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-ui-fg-muted text-xs">-</span>
                          )}
                          {product.categories && product.categories.length > 2 && (
                            <span className="text-[10px] text-ui-fg-muted">
                              +{product.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-sm font-medium">
                        {getDisplayPrice(product)}
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge
                          color={product.status === "published" ? "green" : "grey"}
                        >
                          {product.status}
                        </StatusBadge>
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              )}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-ui-border-base flex items-center justify-between text-xs text-ui-fg-subtle">
        <span>
          Showing {products.length > 0 ? offset + 1 : 0} to{" "}
          {Math.min(offset + limit, totalCount)} of {totalCount} products
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="small"
            disabled={offset === 0 || loading}
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="small"
            disabled={offset + limit >= totalCount || loading}
            onClick={() => setOffset((prev) => prev + limit)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Floating Bulk Command Bar */}
      <BulkCommandBar
        selectedCount={selectedCount}
        onClear={clearSelection}
        onAction={(action) => setActiveDrawer(action)}
      />

      {/* Modular Action Drawers */}
      <BulkStatusDrawer
        open={activeDrawer === "status"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        onSuccess={handleActionSuccess}
      />

      <BulkBrandDrawer
        open={activeDrawer === "brand"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        brands={brands}
        onSuccess={handleActionSuccess}
      />

      <BulkCategoryDrawer
        open={activeDrawer === "category"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        categories={categories}
        onSuccess={handleActionSuccess}
      />

      <BulkPricingDrawer
        open={activeDrawer === "pricing"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        onSuccess={handleActionSuccess}
      />

      <BulkDeleteDrawer
        open={activeDrawer === "delete"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        onSuccess={handleActionSuccess}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Products Manager",
  icon: SquareTwoStack,
})

export default BulkProductsPage
