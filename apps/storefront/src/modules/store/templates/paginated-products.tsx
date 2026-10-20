import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CatalogToolbar from "@modules/store/components/catalog-toolbar"
import ProductListViewTracker from "@modules/products/components/product-list-view-tracker"
import clsx from "clsx"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  q,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  viewMode = "grid",
  showVariantsAsProducts = false,
  title,
  breadcrumbs,
}: {
  sortBy?: SortOptions
  page: number
  q?: string
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  viewMode?: "grid" | "list"
  showVariantsAsProducts?: boolean
  title?: string
  breadcrumbs?: { name: string; href?: string }[]
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (q) {
    queryParams["q"] = q
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count, variantOptionsByProductId },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
    minPrice,
    maxPrice,
    showVariantsAsProducts,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="w-full">
      {products.length > 0 && (
        <ProductListViewTracker
          products={products}
          listId={categoryId || collectionId || "catalog"}
          listName={title || "Product Catalog"}
        />
      )}
      {/* Top Catalog Status & Control Toolbar */}
      <CatalogToolbar
        totalCount={count}
        currentPage={page}
        pageSize={PRODUCT_LIMIT}
        sortBy={sortBy}
        viewMode={viewMode}
        title={title}
        breadcrumbs={breadcrumbs}
      />

      {products.length === 0 ? (
        <div className="py-12 text-center bg-white border border-gray-200 p-8 my-4">
          <p className="text-base font-bold text-gray-800">
            No products found {q ? `matching "${q}"` : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search terms, price filters, or options.
          </p>
        </div>
      ) : (
        <>
          {/* Products List: Grid or List Layout */}
          <ul
            className={clsx("w-full mb-8", {
              "grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8":
                viewMode === "grid",
              "flex flex-col gap-4": viewMode === "list",
            })}
            data-testid="products-list"
          >
            {products.map((p) => {
              return (
                <li
                  key={p.variants?.length === 1 ? p.variants[0].id : p.id}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  <ProductPreview
                    product={p}
                    variant={
                      showVariantsAsProducts && p.variants?.length === 1
                        ? p.variants[0]
                        : undefined
                    }
                    variantOptions={variantOptionsByProductId[p.id]}
                    region={region}
                    viewMode={viewMode}
                  />
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <Pagination
              data-testid="product-pagination"
              page={page}
              totalPages={totalPages}
            />
          )}
        </>
      )}
    </div>
  )
}
