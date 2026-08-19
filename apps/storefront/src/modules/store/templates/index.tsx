import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  q,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  q?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <Suspense fallback={<div className="w-full small:w-1/4 h-32 bg-gray-50 animate-pulse rounded-2xl" />}>
        <RefinementList sortBy={sort} />
      </Suspense>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black tracking-tight" data-testid="store-page-title">
            {q ? `Search results for "${q}"` : "All products"}
          </h1>
          {q && (
            <p className="text-xs text-gray-500 mt-1">
              Showing matching products from catalog
            </p>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            q={q}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
