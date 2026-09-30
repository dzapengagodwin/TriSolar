import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { Photo, ArrowPath } from "@medusajs/icons"
import { useCallback, useEffect, useState } from "react"
import { MediaPickerModal } from "../components/product-media-picker"
import { CurrentProductImage } from "../components/product-media-picker/types"

type ProductMediaPickerWidgetProps = {
  data: {
    id: string
    title?: string
    thumbnail?: string | null
    images?: Array<{ id: string; url: string }>
  }
}

const ProductMediaPickerWidget = ({ data }: ProductMediaPickerWidgetProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<CurrentProductImage[]>(
    data.images || []
  )
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(
    data.thumbnail || null
  )
  const [refreshing, setRefreshing] = useState(false)

  // Fetch the latest product media from the API to stay in sync with native gallery changes
  const refreshProductMedia = useCallback(async () => {
    if (!data.id) return
    setRefreshing(true)
    try {
      const res = await fetch(`/admin/products/${data.id}?fields=id,title,thumbnail,*images`, {
        credentials: "include",
      })
      if (res.ok) {
        const prodData = await res.json()
        const prod = prodData.product
        if (prod) {
          setCurrentImages(prod.images || [])
          setCurrentThumbnail(prod.thumbnail || null)
        }
      }
    } catch (err) {
      console.error("Failed to refresh product media:", err)
    } finally {
      setRefreshing(false)
    }
  }, [data.id])

  useEffect(() => {
    refreshProductMedia()
  }, [refreshProductMedia])

  const handleOpenModal = async () => {
    await refreshProductMedia()
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    refreshProductMedia()
    // Trigger window location reload or router refresh so the native Medusa gallery updates immediately
    setTimeout(() => {
      window.location.reload()
    }, 400)
  }

  return (
    <Container className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-muted">
            <Photo className="h-4 w-4" />
          </div>
          <div>
            <Heading level="h2" className="text-sm font-semibold">
              Reuse Media
            </Heading>
            <Text size="xsmall" className="text-ui-fg-muted">
              Select existing images from catalog
            </Text>
          </div>
        </div>
        <Badge size="2xsmall" color="grey">
          {currentImages.length} attached
        </Badge>
      </div>

      <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle/30 p-3 flex items-center justify-between gap-3">
        <div className="space-y-0.5 text-left min-w-0">
          <Text size="xsmall" weight="plus" className="text-ui-fg-base">
            Existing Product Images
          </Text>
          <Text size="2xsmall" className="text-ui-fg-muted line-clamp-1">
            Pick images already uploaded to other products without re-uploading
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={handleOpenModal}
          disabled={refreshing}
          className="shrink-0"
        >
          {refreshing ? (
            <ArrowPath className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Photo className="h-3.5 w-3.5 mr-1" />
          )}
          Select Existing
        </Button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        productId={data.id}
        productTitle={data.title}
        currentImages={currentImages}
        currentThumbnail={currentThumbnail}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductMediaPickerWidget

