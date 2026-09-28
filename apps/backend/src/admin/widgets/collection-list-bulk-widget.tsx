import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Folder, Spinner, MagnifyingGlass, ArrowPath, ChevronDownMini, ChevronUpMini } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Checkbox,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"
import { useBulkSelection } from "../hooks/use-bulk-selection"
import {
  BulkCollectionCommandBar,
  BulkCollectionDeleteDrawer,
  BulkCollectionProductsDrawer,
} from "../components/bulk-actions"

type CollectionItem = {
  id: string
  title: string
  handle: string
  created_at: string
  products?: Array<{ id: string }>
}

const CollectionListBulkWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination
  const [limit] = useState(10)
  const [offset, setOffset] = useState(0)

  // Active drawer
  const [activeDrawer, setActiveDrawer] = useState<"add_products" | "remove_products" | "delete" | null>(null)

  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleItem,
    togglePage,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection(collections)

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", limit.toString())
      params.set("offset", offset.toString())
      params.set("fields", "id,title,handle,created_at,*products")

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim())
      }

      const res = await fetch(`/admin/collections?${params.toString()}`, {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        const fetched: CollectionItem[] = data.collections || []
        setCollections(fetched)
        setTotalCount(data.count ?? fetched.length)
      }
    } catch (err) {
      console.error("Error fetching collections:", err)
    } finally {
      setLoading(false)
    }
  }, [limit, offset, searchQuery])

  useEffect(() => {
    if (isExpanded) {
      fetchCollections()
    }
  }, [isExpanded, fetchCollections])

  const handleActionSuccess = () => {
    clearSelection()
    fetchCollections()
  }

  const totalPages = Math.ceil(totalCount / limit) || 1
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <Container className="mb-6 p-0 border border-ui-border-base rounded-lg bg-ui-bg-base overflow-hidden">
      {/* Top Banner with Toggle */}
      <div className="p-4 flex items-center justify-between bg-ui-bg-subtle border-b border-ui-border-base">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-base">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-base font-semibold">
                Bulk Collection Actions & Multi-Select
              </Heading>
              {selectedCount > 0 && (
                <Badge color="blue" size="small">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              Batch delete collections or manage linked products across multiple collections.
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isExpanded ? "secondary" : "primary"}
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUpMini className="w-4 h-4" />
                Hide Bulk Table
              </>
            ) : (
              <>
                <ChevronDownMini className="w-4 h-4" />
                Open Bulk Table
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Multi-Select Collections Table */}
      {isExpanded && (
        <div className="flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-ui-border-base flex items-center justify-between gap-3 bg-ui-bg-base">
            <div className="relative max-w-sm flex-1">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-ui-fg-muted w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setOffset(0)
                }}
                placeholder="Search collections by title or handle..."
                className="pl-9"
              />
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => fetchCollections()}
              disabled={loading}
            >
              <ArrowPath className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto min-h-[220px]">
            {loading && collections.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-ui-fg-subtle gap-2">
                <Spinner className="animate-spin" />
                Loading collections...
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-12 text-center">
                      <Checkbox
                        checked={
                          isAllSelected ? true : isSomeSelected ? "indeterminate" : false
                        }
                        onCheckedChange={togglePage}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell>Handle</Table.HeaderCell>
                    <Table.HeaderCell>Products Count</Table.HeaderCell>
                    <Table.HeaderCell>Created</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {collections.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5} className="text-center py-6 text-ui-fg-subtle">
                        No collections found matching query.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    collections.map((collection) => {
                      const selected = isSelected(collection.id)
                      const productCount = collection.products?.length ?? 0
                      return (
                        <Table.Row
                          key={collection.id}
                          className={selected ? "bg-ui-bg-highlight" : ""}
                        >
                          <Table.Cell className="text-center">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => toggleItem(collection.id)}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-medium text-ui-fg-base text-sm">
                              {collection.title}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <code className="text-xs text-ui-fg-subtle bg-ui-bg-subtle px-1.5 py-0.5 rounded">
                              /{collection.handle}
                            </code>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge size="small" color={productCount > 0 ? "blue" : "grey"}>
                              {productCount} {productCount === 1 ? "product" : "products"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-xs text-ui-fg-muted">
                            {collection.created_at
                              ? new Date(collection.created_at).toLocaleDateString()
                              : "-"}
                          </Table.Cell>
                        </Table.Row>
                      )
                    })
                  )}
                </Table.Body>
              </Table>
            )}
          </div>

          {/* Footer pagination */}
          <div className="p-3 border-t border-ui-border-base flex items-center justify-between text-xs text-ui-fg-subtle bg-ui-bg-subtle">
            <span>
              Showing {collections.length > 0 ? offset + 1 : 0} to{" "}
              {Math.min(offset + limit, totalCount)} of {totalCount}
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
        </div>
      )}

      {/* Floating Command Bar */}
      <BulkCollectionCommandBar
        selectedCount={selectedCount}
        onClear={clearSelection}
        onAction={(action) => setActiveDrawer(action)}
      />

      {/* Action Drawers */}
      <BulkCollectionProductsDrawer
        open={activeDrawer === "add_products" || activeDrawer === "remove_products"}
        defaultMode={activeDrawer === "remove_products" ? "remove" : "add"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        onSuccess={handleActionSuccess}
      />

      <BulkCollectionDeleteDrawer
        open={activeDrawer === "delete"}
        onClose={() => setActiveDrawer(null)}
        selectedIds={selectedIds}
        onSuccess={handleActionSuccess}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.list.before",
})

export default CollectionListBulkWidget

