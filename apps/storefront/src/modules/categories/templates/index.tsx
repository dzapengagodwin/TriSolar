import { notFound } from "next/navigation"
import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
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

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  viewMode = "grid",
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  viewMode?: "grid" | "list"
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  // Fetch candidate products in this category and all categories for navigation in parallel
  const [{ response: { products: scopedProducts } }, allCategories] = await Promise.all([
    listProducts({
      queryParams: {
        category_id: [category.id],
        limit: 100,
      },
      countryCode,
    }).catch(() => ({ response: { products: [], count: 0 } })),
    listCategories({ limit: 50 }).catch(() => []),
  ])

  const scopedOptions = extractScopedProductOptions(scopedProducts)

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.unshift(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  const breadcrumbs = [
    ...parents.map((p) => ({
      name: p.name,
      href: `/categories/${p.handle}`,
    })),
    { name: category.name },
  ]

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-6"
      data-testid="category-container"
    >
      <Suspense fallback={<div className="w-full small:w-[240px] h-64 bg-gray-50 animate-pulse rounded-2xl" />}>
        <RefinementList
          sortBy={sort}
          data-testid="sort-by-container"
          options={scopedOptions}
          categories={allCategories}
          activeCategoryHandle={category.handle}
        />
      </Suspense>

      <div className="w-full flex-1 min-w-0">
        {category.description && (
          <div className="mb-4 text-xs text-gray-500">
            <p>{category.description}</p>
          </div>
        )}

        {category.category_children && category.category_children.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {category.category_children.map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                >
                  {c.name}
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        )}

        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            minPrice={minPrice}
            maxPrice={maxPrice}
            viewMode={viewMode}
            title={category.name}
            breadcrumbs={breadcrumbs}
          />
        </Suspense>
      </div>
    </div>
  )
}
