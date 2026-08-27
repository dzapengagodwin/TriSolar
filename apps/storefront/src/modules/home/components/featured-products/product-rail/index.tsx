import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function ProductRail({
  collectionId,
  categoryId,
  searchQuery,
  fallbackToAll,
  viewAllHref,
  region,
  title,
}: {
  collectionId?: string
  categoryId?: string
  searchQuery?: string
  fallbackToAll?: boolean
  viewAllHref?: string
  region: HttpTypes.StoreRegion
  title: string
}) {
  let pricedProducts: HttpTypes.StoreProduct[] = []

  const queryParams: HttpTypes.StoreProductListParams = {
    limit: 10,
    fields: "*variants.calculated_price,*categories",
  }

  // Determine filter query
  if (categoryId) {
    queryParams.category_id = [categoryId]
  } else if (collectionId) {
    queryParams.collection_id = [collectionId]
  } else if (searchQuery) {
    queryParams.q = searchQuery
  }

  // Execute query if filter is present or fallback is requested
  if (categoryId || collectionId || searchQuery || fallbackToAll) {
    const res = await listProducts({
      regionId: region.id,
      queryParams,
    }).catch(() => null)

    if (res?.response?.products?.length) {
      pricedProducts = res.response.products
    } else if (fallbackToAll) {
      // If specific search had no products and fallbackToAll is true, fetch general products
      const fallbackRes = await listProducts({
        regionId: region.id,
        queryParams: {
          limit: 10,
          fields: "*variants.calculated_price,*categories",
        },
      }).catch(() => null)

      if (fallbackRes?.response?.products?.length) {
        pricedProducts = fallbackRes.response.products
      }
    }
  }

  // If no products matched, don't show an empty rail
  if (pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="content-container py-6 sm:py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
        {viewAllHref && (
          <LocalizedClientLink
            href={viewAllHref}
            className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </LocalizedClientLink>
        )}
      </div>

      {/* 5 Columns Product Grid */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
