import { Badge, Checkbox, Text, clx } from "@medusajs/ui"
import { useState } from "react"
import { ProductImageItem } from "./types"

type MediaCardProps = {
  item: ProductImageItem
  isSelected: boolean
  isAlreadyAdded: boolean
  onToggle: (item: ProductImageItem) => void
}

export const MediaCard = ({
  item,
  isSelected,
  isAlreadyAdded,
  onToggle,
}: MediaCardProps) => {
  const [imageError, setImageError] = useState(false)

  const handleCardClick = () => {
    if (isAlreadyAdded) return
    onToggle(item)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isAlreadyAdded) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onToggle(item)
    }
  }

  return (
    <div
      role="button"
      tabIndex={isAlreadyAdded ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={isAlreadyAdded}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={clx(
        "group relative flex flex-col rounded-lg border p-2 text-left transition-all outline-none",
        isAlreadyAdded
          ? "cursor-not-allowed border-ui-border-base bg-ui-bg-subtle/40 opacity-70"
          : isSelected
            ? "cursor-pointer border-ui-border-interactive bg-ui-bg-interactive/5 ring-2 ring-ui-border-interactive shadow-sm"
            : "cursor-pointer border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong hover:shadow-xs focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
      )}
    >
      {/* Top action row: Checkbox or Already Added badge */}
      <div className="absolute top-3 right-3 z-10">
        {isAlreadyAdded ? (
          <Badge size="2xsmall" color="grey" className="font-medium text-[10px]">
            Already added
          </Badge>
        ) : (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(item)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select image from ${item.productTitle}`}
          />
        )}
      </div>

      {/* Image Preview Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-ui-bg-subtle flex items-center justify-center p-2">
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-2 text-center text-ui-fg-muted">
            <span className="text-[10px]">Image unavailable</span>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.productTitle || "Product media"}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        )}
      </div>

      {/* Product metadata */}
      <div className="mt-2 min-w-0 flex-1 space-y-0.5">
        <Text
          size="xsmall"
          weight="plus"
          className="truncate text-ui-fg-base"
          title={item.productTitle}
        >
          {item.productTitle}
        </Text>
        {item.variantSku && (
          <Text
            size="2xsmall"
            className="truncate text-ui-fg-muted font-mono"
            title={`SKU: ${item.variantSku}`}
          >
            SKU: {item.variantSku}
          </Text>
        )}
      </div>
    </div>
  )
}

