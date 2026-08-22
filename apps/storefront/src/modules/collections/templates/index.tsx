import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import {
  OptionValueIds,
  extractScopedProductOptions,
} from "@lib/util/product-option-filters"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  viewMode = "grid",
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  viewMode?: "grid" | "list"
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch candidate products in this collection and categories in parallel
  const [{ response: { products: scopedProducts } }, categories] = await Promise.all([
    listProducts({
      queryParams: {
        collection_id: [collection.id],
        limit: 100,
      },
      countryCode,
    }).catch(() => ({ response: { products: [], count: 0 } })),
    listCategories({ limit: 50 }).catch(() => []),
  ])

  const scopedOptions = extractScopedProductOptions(scopedProducts)

  const breadcrumbs = [{ name: collection.title }]

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-6">
      <Suspense fallback={<div className="w-full small:w-[240px] h-64 bg-gray-50 animate-pulse rounded-2xl" />}>
        <RefinementList
          sortBy={sort}
          options={scopedOptions}
          categories={categories}
          scopedProducts={scopedProducts}
        />
      </Suspense>

      <div className="w-full flex-1 min-w-0">
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            viewMode={viewMode}
            title={collection.title}
            breadcrumbs={breadcrumbs}
          />
        </Suspense>
      </div>
    </div>
  )
}
