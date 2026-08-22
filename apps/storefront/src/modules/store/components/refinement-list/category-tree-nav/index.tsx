"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

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
  const pathname = usePathname()

  if (!categories || categories.length === 0) {
    return null
  }

  // Helper to calculate product count for a specific category ID
  const getCategoryCount = (cat: HttpTypes.StoreProductCategory): number => {
    if (scopedProducts && scopedProducts.length > 0) {
      return scopedProducts.filter((p) =>
        p.categories?.some((c) => c.id === cat.id)
      ).length
    }
    return cat.products?.length || (cat.metadata?.product_count as number) || 0
  }

  // Filter root categories (no parent)
  const rootCategories = categories.filter((c) => !c.parent_category_id)

  // Build tree filtering out empty categories
  const validRootCategories = rootCategories
    .map((rootCat) => {
      // Find children belonging to this root
      const rawChildren = categories.filter(
        (c) => c.parent_category_id === rootCat.id
      )

      // Only keep children with at least 1 product
      const validChildren = rawChildren
        .map((child) => ({
          ...child,
          productCount: getCategoryCount(child),
        }))
        .filter((child) => child.productCount > 0)

      const rootDirectCount = getCategoryCount(rootCat)
      const childrenTotalCount = validChildren.reduce(
        (sum, child) => sum + child.productCount,
        0
      )
      const totalCount = Math.max(rootDirectCount, childrenTotalCount)

      return {
        ...rootCat,
        productCount: totalCount,
        children: validChildren,
      }
    })
    .filter((rootCat) => rootCat.productCount > 0)

  // If no categories have products, do not render the category tree at all
  if (validRootCategories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider">
          Categories
        </span>
      </div>

      <nav className="flex flex-col gap-y-3 text-xs">
        {validRootCategories.map((rootCat) => {
          const isRootActive =
            activeCategoryHandle === rootCat.handle ||
            pathname.includes(`/categories/${rootCat.handle}`)

          return (
            <div key={rootCat.id} className="space-y-1">
              {/* Root / Parent Category Link */}
              <LocalizedClientLink
                href={`/categories/${rootCat.handle}`}
                className={clsx(
                  "flex items-center justify-between font-bold py-1 px-1.5 rounded-md transition-colors group",
                  {
                    "text-primary font-black bg-primary/5": isRootActive,
                    "text-gray-900 hover:text-primary": !isRootActive,
                  }
                )}
              >
                <span className="truncate group-hover:underline">
                  {rootCat.name}
                </span>
                <span
                  className={clsx(
                    "text-[11px] font-normal ml-2 shrink-0 text-gray-400",
                    {
                      "text-primary font-bold": isRootActive,
                    }
                  )}
                >
                  ({rootCat.productCount})
                </span>
              </LocalizedClientLink>

              {/* Subcategories (only those with products) */}
              {rootCat.children.length > 0 && (
                <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-1.5 mt-0.5">
                  {rootCat.children.map((childCat) => {
                    const isChildActive =
                      activeCategoryHandle === childCat.handle ||
                      pathname.includes(`/categories/${childCat.handle}`)

                    return (
                      <LocalizedClientLink
                        key={childCat.id}
                        href={`/categories/${childCat.handle}`}
                        className={clsx(
                          "flex items-center justify-between py-0.5 px-1 rounded transition-colors group text-[11px]",
                          {
                            "text-primary font-bold": isChildActive,
                            "text-gray-600 hover:text-gray-900": !isChildActive,
                          }
                        )}
                      >
                        <span className="truncate group-hover:underline">
                          {childCat.name}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1.5 shrink-0">
                          ({childCat.productCount})
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
