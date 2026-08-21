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

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch candidate products in this collection to dynamically extract only its native options
  const {
    response: { products: scopedProducts },
  } = await listProducts({
    queryParams: {
      collection_id: [collection.id],
      limit: 100,
    },
    countryCode,
  }).catch(() => ({ response: { products: [], count: 0 } }))

  const scopedOptions = extractScopedProductOptions(scopedProducts)

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <Suspense fallback={<div className="w-full small:w-1/4 h-32 bg-gray-50 animate-pulse rounded-2xl" />}>
        <RefinementList sortBy={sort} options={scopedOptions} />
      </Suspense>
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
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
          />
        </Suspense>
      </div>
    </div>
  )
}
