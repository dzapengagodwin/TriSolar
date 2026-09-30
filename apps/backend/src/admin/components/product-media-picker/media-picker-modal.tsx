import {
  Button,
  FocusModal,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import {
  ChevronLeft,
  ChevronRight,
  MagnifyingGlass,
  Spinner,
  XMarkMini,
} from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MediaGrid } from "./media-grid"
import { ProductImageItem, ProductMediaPickerProps } from "./types"

const PAGE_SIZE = 24

export const MediaPickerModal = ({
  productId,
  productTitle,
  currentImages,
  currentThumbnail,
  isOpen,
  onClose,
  onSuccess,
}: ProductMediaPickerProps) => {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<ProductImageItem[]>([])
  const [selectedMap, setSelectedMap] = useState<Record<string, ProductImageItem>>({})
  const [saving, setSaving] = useState(false)

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
      setOffset(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Track already added URLs for duplicate prevention
  const alreadyAddedUrls = useMemo(() => {
    return new Set(currentImages.map((img) => img.url))
  }, [currentImages])

  // Fetch products and extract their images
  const fetchImages = useCallback(async () => {
    if (!isOpen) return
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set("limit", PAGE_SIZE.toString())
      params.set("offset", offset.toString())
      params.set("fields", "id,title,thumbnail,*images,*variants")

      if (debouncedQuery) {
        params.set("q", debouncedQuery)
      }

      const res = await fetch(`/admin/products?${params.toString()}`, {
        credentials: "include",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to load products")
      }

      const data = await res.json()
      const products: any[] = data.products || []
      setTotalCount(data.count || 0)

      // Flatten unique images from products
      const extractedImages: ProductImageItem[] = []
      const seenUrls = new Set<string>()

      for (const prod of products) {
        // Collect from prod.images
        if (Array.isArray(prod.images)) {
          for (const img of prod.images) {
            if (img?.url && !seenUrls.has(img.url)) {
              seenUrls.add(img.url)
              extractedImages.push({
                id: img.id || img.url,
                url: img.url,
                productId: prod.id,
                productTitle: prod.title || "Untitled Product",
                variantSku: prod.variants?.[0]?.sku || null,
              })
            }
          }
        }

        // Also check prod.thumbnail if not already captured
        if (prod.thumbnail && !seenUrls.has(prod.thumbnail)) {
          seenUrls.add(prod.thumbnail)
          extractedImages.push({
            id: `thumb-${prod.id}`,
            url: prod.thumbnail,
            productId: prod.id,
            productTitle: prod.title || "Untitled Product",
            variantSku: prod.variants?.[0]?.sku || null,
          })
        }
      }

      setImages(extractedImages)
    } catch (err: any) {
      console.error("Error fetching images for picker:", err)
      setError(err.message || "An unexpected error occurred while fetching images.")
    } finally {
      setLoading(false)
    }
  }, [isOpen, offset, debouncedQuery])

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    } else {
      // Reset state when closed
      setSelectedMap({})
      setSearchInput("")
      setDebouncedQuery("")
      setOffset(0)
    }
  }, [isOpen, fetchImages])

  const handleToggle = useCallback((item: ProductImageItem) => {
    setSelectedMap((prev) => {
      if (prev[item.url]) {
        const next = { ...prev }
        delete next[item.url]
        return next
      }
      return {
        ...prev,
        [item.url]: item,
      }
    })
  }, [])

  const handleClearSelection = () => {
    setSelectedMap({})
  }

  const selectedCount = Object.keys(selectedMap).length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setOffset((prev) => prev + PAGE_SIZE)
    }
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset((prev) => Math.max(0, prev - PAGE_SIZE))
    }
  }

  const handleAddImages = async () => {
    const selectedItems = Object.values(selectedMap)
    if (selectedItems.length === 0) return

    // Final safety filter against duplicates
    const newItemsToAdd = selectedItems.filter(
      (item) => !alreadyAddedUrls.has(item.url)
    )

    if (newItemsToAdd.length === 0) {
      toast.info("All selected images are already attached to this product.")
      return
    }

    setSaving(true)
    try {
      // Build updated images list
      const updatedImages = [
        ...currentImages.map((img) => ({
          ...(img.id ? { id: img.id } : {}),
          url: img.url,
        })),
        ...newItemsToAdd.map((item) => ({
          url: item.url,
        })),
      ]

      const payload: { images: Array<{ id?: string; url: string }>; thumbnail?: string | null } = {
        images: updatedImages,
      }

      // If product currently has no thumbnail, set the first newly added image as thumbnail
      if (!currentThumbnail && newItemsToAdd.length > 0) {
        payload.thumbnail = newItemsToAdd[0].url
      }

      const res = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update product images")
      }

      toast.success("Images added", {
        description: `Successfully attached ${newItemsToAdd.length} image${
          newItemsToAdd.length === 1 ? "" : "s"
        } to ${productTitle || "the product"}.`,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error adding images to product:", err)
      toast.error("Failed to add images", {
        description: err.message || "An unexpected error occurred while saving.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <FocusModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        {/* Header */}
        <FocusModal.Header>
          <div className="flex flex-1 items-center justify-between pr-4">
            <div>
              <FocusModal.Title asChild>
                <Heading level="h2" className="text-base font-semibold">
                  Select Existing Images
                </Heading>
              </FocusModal.Title>
              <FocusModal.Description asChild>
                <Text size="small" className="text-ui-fg-muted">
                  Reuse images already uploaded to other products in your store
                </Text>
              </FocusModal.Description>
            </div>
          </div>
        </FocusModal.Header>

        {/* Body */}
        <FocusModal.Body className="flex flex-col overflow-hidden">
          {/* Controls Bar: Search & Pagination */}
          <div className="border-b border-ui-border-base p-4 bg-ui-bg-subtle/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ui-fg-muted">
                <MagnifyingGlass className="h-4 w-4" />
              </div>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title or SKU..."
                className="pl-9 pr-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-ui-fg-muted hover:text-ui-fg-base"
                >
                  <XMarkMini className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-x-2 text-ui-fg-muted">
                <Text size="xsmall">
                  Page {currentPage} of {totalPages} ({totalCount} products)
                </Text>
                <div className="flex items-center gap-x-1">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage <= 1 || loading}
                    onClick={handlePrevPage}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage >= totalPages || loading}
                    onClick={handleNextPage}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Grid Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <MediaGrid
              items={images}
              selectedMap={selectedMap}
              alreadyAddedUrls={alreadyAddedUrls}
              loading={loading}
              error={error}
              onRetry={fetchImages}
              onToggle={handleToggle}
            />
          </div>
        </FocusModal.Body>

        {/* Footer */}
        <FocusModal.Footer className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              {selectedCount === 0
                ? "No images selected"
                : `${selectedCount} image${selectedCount === 1 ? "" : "s"} selected`}
            </Text>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base underline"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddImages}
              disabled={selectedCount === 0 || saving}
            >
              {saving && <Spinner className="animate-spin mr-1.5 h-4 w-4" />}
              {saving
                ? "Attaching..."
                : `Add ${selectedCount > 0 ? `${selectedCount} ` : ""}Image${
                    selectedCount === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

