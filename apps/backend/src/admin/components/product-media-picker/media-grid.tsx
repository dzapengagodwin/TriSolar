import { Button, Text } from "@medusajs/ui"
import { Spinner, ExclamationCircle } from "@medusajs/icons"
import { MediaCard } from "./media-card"
import { ProductImageItem } from "./types"

type MediaGridProps = {
  items: ProductImageItem[]
  selectedMap: Record<string, ProductImageItem>
  alreadyAddedUrls: Set<string>
  loading: boolean
  error: string | null
  onRetry: () => void
  onToggle: (item: ProductImageItem) => void
}

export const MediaGrid = ({
  items,
  selectedMap,
  alreadyAddedUrls,
  loading,
  error,
  onRetry,
  onToggle,
}: MediaGridProps) => {
  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-y-3">
        <Spinner className="animate-spin text-ui-fg-muted" />
        <Text size="small" className="text-ui-fg-muted">
          Loading existing images...
        </Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-y-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-error">
          <ExclamationCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <Text size="base" weight="plus" className="text-ui-fg-base">
            Failed to load images
          </Text>
          <Text size="small" className="text-ui-fg-muted max-w-sm">
            {error}
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-y-2 p-6 text-center">
        <Text size="base" weight="plus" className="text-ui-fg-base">
          No products or images found
        </Text>
        <Text size="small" className="text-ui-fg-muted max-w-xs">
          Try adjusting your search query to find images from other products.
        </Text>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <MediaCard
          key={`${item.productId}-${item.id || item.url}`}
          item={item}
          isSelected={Boolean(selectedMap[item.url])}
          isAlreadyAdded={alreadyAddedUrls.has(item.url)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

