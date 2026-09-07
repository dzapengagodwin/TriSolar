import { Suspense } from "react"
import Image from "next/image"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import {
  OptionValueIds,
  extractScopedProductOptions,
} from "@lib/util/product-option-filters"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { StoreBrand } from "@lib/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function BrandTemplate({
  sortBy,
  brand,
  page,
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  viewMode = "grid",
}: {
  sortBy?: SortOptions
  brand: StoreBrand
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  viewMode?: "grid" | "list"
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const productIds = brand.product_ids || []
  const hasLinkedIds = productIds.length > 0

  // Fetch candidate products for this brand and categories in parallel for the sidebar filter
  const [{ response: { products: scopedProducts, count: scopedCount } }, categories] = await Promise.all([
    hasLinkedIds
      ? listProducts({
          queryParams: {
            id: productIds.slice(0, 100),
            limit: 100,
          },
          countryCode,
        }).catch(() => ({ response: { products: [], count: 0 } }))
      : listProducts({
          queryParams: {
            q: brand.name,
            limit: 100,
          },
          countryCode,
        }).catch(() => ({ response: { products: [], count: 0 } })),
    listCategories({ limit: 50 }).catch(() => []),
  ])

  const totalProductsCount =
    brand.total_products || brand.products_count || (hasLinkedIds ? productIds.length : scopedCount)

  const scopedOptions = extractScopedProductOptions(scopedProducts)
  const breadcrumbs = [
    { name: "Brands", href: "/brands" },
    { name: brand.name },
  ]

  const brandLogo = brand.logo || brand.image || null

  return (
    <div className="py-6 content-container space-y-6">
      {/* Brand Header Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {brandLogo && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50/80 border border-gray-100 rounded-2xl p-3 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src={brandLogo}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {brand.name}
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                  Brand
                </span>
              </div>

              {brand.description && (
                <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed line-clamp-2">
                  {brand.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs pt-1">
                <span className="font-bold text-gray-600">
                  {totalProductsCount} {totalProductsCount === 1 ? "Product" : "Products"} Available
                </span>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-laptopzone-blue hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Official Website
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <LocalizedClientLink
            href="/brands"
            className="text-xs font-extrabold uppercase tracking-wider text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-2 rounded-xl transition-all shrink-0 self-end sm:self-center"
          >
            ← View All Brands
          </LocalizedClientLink>
        </div>
      </div>

      {/* Main Catalog View with Filters and Products */}
      <div className="flex flex-col small:flex-row small:items-start gap-x-6">
        <Suspense
          fallback={
            <div className="w-full small:w-[240px] h-64 bg-gray-50 animate-pulse rounded-2xl" />
          }
        >
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
                numberOfProducts={totalProductsCount || 8}
              />
            }
          >
            {hasLinkedIds ? (
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                productsIds={productIds}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
                minPrice={minPrice}
                maxPrice={maxPrice}
                viewMode={viewMode}
                title={`${brand.name} Catalog`}
                breadcrumbs={breadcrumbs}
              />
            ) : scopedProducts.length > 0 ? (
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                q={brand.name}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
                minPrice={minPrice}
                maxPrice={maxPrice}
                viewMode={viewMode}
                title={`${brand.name} Catalog`}
                breadcrumbs={breadcrumbs}
              />
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No products found for {brand.name}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  We are currently updating our inventory for this brand. Check back soon or browse our other top brands in our directory.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <LocalizedClientLink
                    href="/brands"
                    className="inline-block bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors"
                  >
                    View All Brands
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/store"
                    className="inline-block bg-black hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors shadow-sm"
                  >
                    Browse Full Store
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
