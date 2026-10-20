import { Suspense } from "react"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import {
  OptionValueIds,
  extractScopedProductOptions,
} from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  q,
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  viewMode = "grid",
}: {
  sortBy?: SortOptions
  page?: string
  q?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  viewMode?: "grid" | "list"
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch candidate products and categories in parallel
  const [{ response: { products: scopedProducts } }, categories] = await Promise.all([
    listProducts({
      queryParams: {
        ...(q ? { q } : {}),
        limit: 100,
      },
      countryCode,
    }).catch(() => ({ response: { products: [], count: 0 } })),
    listCategories({ limit: 50 }).catch(() => []),
  ])

  const scopedOptions = extractScopedProductOptions(scopedProducts)

  const title = q ? `Search results for "${q}"` : "All Products"
  const breadcrumbs = q ? [{ name: q }] : [{ name: "Catalog" }]

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-6"
      data-testid="category-container"
    >
      <Suspense fallback={<div className="w-full small:w-[240px] h-64 bg-gray-50 animate-pulse rounded-2xl" />}>
        <RefinementList
          sortBy={sort}
          options={scopedOptions}
          categories={categories}
          scopedProducts={scopedProducts}
        />
      </Suspense>

      <div className="w-full flex-1 min-w-0">
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            q={q}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            viewMode={viewMode}
            showVariantsAsProducts
            title={title}
            breadcrumbs={breadcrumbs}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
