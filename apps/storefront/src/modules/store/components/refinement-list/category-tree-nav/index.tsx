"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clsx from "clsx"
import { ChevronDown } from "@medusajs/icons"
import { getCategoryPublicPath } from "@lib/seo/canonical"

type CategoryTreeNavProps = {
  categories?: HttpTypes.StoreProductCategory[]
  activeCategoryHandle?: string
  scopedProducts?: HttpTypes.StoreProduct[]
}

export default function CategoryTreeNav({
  categories = [],
  activeCategoryHandle,
  scopedProducts,
}: CategoryTreeNavProps) {
  const normalizeHandle = (handle?: string | null) =>
    handle?.trim().toLowerCase().replace(/_/g, "-") || ""

  const activeHandle = normalizeHandle(activeCategoryHandle)

  // Track expanded state for accordion dropdown per category
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (activeHandle) {
      initial[activeHandle] = true
    }
    return initial
  })

  useEffect(() => {
    if (!activeHandle) {
      return
    }

    setExpandedCategories((prev) => ({
      ...prev,
      ...(activeHandle ? { [activeHandle]: true } : {}),
    }))
  }, [activeHandle])

  if (!categories || categories.length === 0) {
    return null
  }

  const toggleExpand = (handle: string, e: React.MouseEvent) => {
    const normalizedHandle = normalizeHandle(handle)
    e.preventDefault()
    e.stopPropagation()
    setExpandedCategories((prev) => ({
      ...prev,
      [normalizedHandle]: !prev[normalizedHandle],
    }))
  }

  // Calculate product count for a category
  const getCategoryCount = (cat: HttpTypes.StoreProductCategory): number => {
    if (scopedProducts && scopedProducts.length > 0) {
      const match = scopedProducts.filter((p) =>
        p.categories?.some((c) => c.id === cat.id || c.handle === cat.handle)
      ).length
      if (match > 0) return match
    }
    if (cat.products?.length) return cat.products.length
    if (typeof cat.metadata?.product_count === "number") return cat.metadata.product_count
    return 0
  }

  // Root level categories (no parent)
  const rootCategories = categories.filter((c) => !c.parent_category_id)

  // If on a specific category page (e.g. /categories/laptops), only show that active category and its subcategories!
  const isIndividualCategoryPage = Boolean(activeCategoryHandle)
  const activeCategory = isIndividualCategoryPage
    ? categories.find(
        (c) =>
          c.handle.toLowerCase() === activeCategoryHandle?.toLowerCase() ||
          c.id === activeCategoryHandle
      )
    : null

  const displayCategories = activeCategory
    ? [activeCategory]
    : rootCategories.length > 0
    ? rootCategories
    : categories

  return (
    <div className="flex flex-col gap-y-3.5">
      {/* Header with back link if inside individual category */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
          CATEGORIES
        </h3>
        {isIndividualCategoryPage && (
          <LocalizedClientLink
            href="/shop"
            className="text-[11px] font-semibold text-gray-500 hover:text-black transition-colors"
          >
            &larr; All
          </LocalizedClientLink>
        )}
      </div>

      <nav className="flex flex-col space-y-2 text-xs">
        {displayCategories.map((rootCat) => {
          const handleKey = normalizeHandle(rootCat.handle)
          const isRootActive = activeHandle === handleKey

          const productCount = getCategoryCount(rootCat)

          // Subcategories from category_children, parent_category_id, or fallback map
          const childrenMap = new Map<string, HttpTypes.StoreProductCategory>()
          ;(rootCat.category_children || []).forEach((c) => childrenMap.set(c.id, c))
          categories
            .filter((c) => c.parent_category_id === rootCat.id)
            .forEach((c) => childrenMap.set(c.id, c))

          const dbChildren = Array.from(childrenMap.values()).filter(
            (child) => Boolean(child.handle)
          )
          const hasChildren = dbChildren.length > 0

          // Automatically expand if on this category's individual page
          const isExpanded =
            isIndividualCategoryPage ||
            Boolean(expandedCategories[handleKey]) ||
            isRootActive

          return (
            <div key={rootCat.id} className="space-y-1.5">
              {/* Parent Category Row */}
              <div
                className={clsx(
                  "flex items-center justify-between py-1 px-1 rounded-md transition-colors group cursor-pointer",
                  {
                    "text-primary font-semibold bg-primary/5": isRootActive,
                    "text-gray-700 hover:text-primary": !isRootActive,
                  }
                )}
              >
                <LocalizedClientLink
                  href={getCategoryPublicPath(rootCat.handle)}
                  className="flex-1 flex items-center justify-between pr-1 min-w-0"
                >
                  <span
                    className={clsx(
                      "text-xs sm:text-[13px] transition-colors truncate",
                      isRootActive
                        ? "font-semibold text-primary"
                        : "font-medium text-gray-700 group-hover:text-primary"
                    )}
                  >
                    {rootCat.name}
                  </span>
                  <span className="text-xs text-gray-400 font-normal ml-2 shrink-0">
                    ({productCount})
                  </span>
                </LocalizedClientLink>

                {/* Accordion dropdown toggle chevron (only needed if multiple root categories shown) */}
                {hasChildren && !isIndividualCategoryPage && (
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(handleKey, e)}
                    className="p-1 text-gray-400 hover:text-gray-900 transition-transform cursor-pointer"
                    aria-label={`Toggle ${rootCat.name} subcategories`}
                  >
                    <ChevronDown
                      className={clsx(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        {
                          "rotate-180 text-primary": isExpanded,
                        }
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Subcategories Dropdown (Always shown for the individual category page) */}
              {hasChildren && isExpanded && (
                <div className="pl-3 py-1 space-y-2 border-l-2 border-primary/20 ml-2 mt-1 animate-fade-in">
                  {dbChildren.map((childCat) => {
                    const isChildActive =
                      activeHandle === normalizeHandle(childCat.handle)
                    const childCount = getCategoryCount(childCat)

                    return (
                      <LocalizedClientLink
                        key={childCat.id}
                        href={getCategoryPublicPath(childCat.handle)}
                        className={clsx(
                          "flex items-center justify-between py-0.5 px-1 rounded transition-colors group text-xs",
                          {
                            "text-primary font-semibold": isChildActive,
                            "text-gray-600 hover:text-primary": !isChildActive,
                          }
                        )}
                      >
                        <span className="truncate group-hover:underline">
                          {childCat.name}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1.5 shrink-0">
                          ({childCount})
                        </span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
