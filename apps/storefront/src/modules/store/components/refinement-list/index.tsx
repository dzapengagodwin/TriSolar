"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
  ScopedProductOption,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import PriceFilterSlider from "./price-filter-slider"
import CategoryTreeNav from "./category-tree-nav"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy?: SortOptions
  search?: boolean
  hideOptionsPicker?: boolean
  hidePriceFilter?: boolean
  hideCategoryTree?: boolean
  options?: ScopedProductOption[]
  categories?: HttpTypes.StoreProductCategory[]
  activeCategoryHandle?: string
  scopedProducts?: HttpTypes.StoreProduct[]
  "data-testid"?: string
}

const RefinementList = ({
  hideOptionsPicker = false,
  hidePriceFilter = false,
  hideCategoryTree = false,
  options = [],
  categories = [],
  activeCategoryHandle,
  scopedProducts,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  return (
    <aside className="flex flex-col gap-y-6 py-2 mb-8 w-full small:w-[240px] medium:w-[260px] shrink-0 small:pr-6">
      {/* Category Tree Navigation with counts */}
      {!hideCategoryTree && categories.length > 0 && (
        <div className="border-b border-gray-100 pb-5">
          <CategoryTreeNav
            categories={categories}
            activeCategoryHandle={activeCategoryHandle}
            scopedProducts={scopedProducts}
          />
        </div>
      )}

      {/* Interactive Price Filter Slider */}
      {!hidePriceFilter && (
        <div className="border-b border-gray-100 pb-5">
          <PriceFilterSlider />
        </div>
      )}

      {/* Dynamic Scoped Product Options (RAM, Storage, Size, etc.) */}
      {!hideOptionsPicker && options.length > 0 && (
        <div>
          <OptionsPicker
            options={options}
            selectedValueIds={selectedOptionValueIds}
            setOptionValueIds={setOptionValueIds}
          />
        </div>
      )}
    </aside>
  )
}

export default RefinementList
