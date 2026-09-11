"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type SubcategoryCardsProps = {
  category: HttpTypes.StoreProductCategory
}

export default function SubcategoryCards({ category }: SubcategoryCardsProps) {
  // Only display subcategory navigation on top-level (root) categories
  if (category.parent_category_id || category.parent_category) {
    return null
  }

  const children = category.category_children || []
  if (children.length === 0) {
    return null
  }

  const activeChildren = children
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  if (activeChildren.length === 0) {
    return null
  }

  const items = activeChildren.map((child) => {
    const meta = (child.metadata && typeof child.metadata === "object" ? child.metadata : {}) as Record<string, unknown>
    const rawImage = meta.image || meta.icon
    const image = typeof rawImage === "string" && rawImage.trim().length > 0 ? rawImage.trim() : null

    const rawCount = meta.product_count
    let count: number | undefined
    if (typeof rawCount === "number" && !isNaN(rawCount)) {
      count = rawCount
    } else if (typeof rawCount === "string") {
      const parsed = parseInt(rawCount, 10)
      if (!isNaN(parsed)) count = parsed
    }

    return {
      name: child.name,
      handle: child.handle,
      image,
      count,
    }
  })

  // Dynamic grid column sizing based on number of subcategories
  const gridColsClass =
    items.length >= 6
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      : items.length === 5
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        : items.length === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : items.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2"

  return (
    <div className="w-full mb-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Subcategories
        </h2>
        <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
          {items.length} {items.length === 1 ? "Subcategory" : "Subcategories"}
        </span>
      </div>

      {/* Subcategory Cards */}
      <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3`}>
        {items.map((item) => (
          <LocalizedClientLink
            key={item.handle}
            href={`/categories/${item.handle}`}
            className="group relative bg-white hover:bg-gray-50/80 border border-gray-200/90 hover:border-primary/60 rounded-xl p-3 flex items-center justify-between gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-sm"
          >
            {/* If an image is explicitly available, display it */}
            {item.image && (
              <div className="relative w-10 h-10 shrink-0 bg-gray-50 rounded-lg p-1 flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="40px"
                  className="object-contain object-center group-hover:scale-108 transition-transform duration-200"
                />
              </div>
            )}

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                {item.name}
              </span>
              {item.count !== undefined && (
                <span className="block text-[11px] text-[#7b91a8] font-normal mt-0.5">
                  {item.count} {item.count === 1 ? "Product" : "Products"}
                </span>
              )}
            </div>

            {/* Arrow indicator when text-only */}
            {!item.image && (
              <span className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-sm shrink-0">
                &rarr;
              </span>
            )}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
