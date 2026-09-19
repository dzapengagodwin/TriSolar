import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default async function ProductRail({
  collectionId,
  categoryId,
  limit = 10,
  viewAllHref,
  region,
  title,
  bannerImage,
}: {
  collectionId?: string
  categoryId?: string
  limit?: number
  viewAllHref?: string
  region: HttpTypes.StoreRegion
  title: string
  bannerImage?: string | null
}) {
  let pricedProducts: HttpTypes.StoreProduct[] = []

  const queryParams: HttpTypes.StoreProductListParams = {
    limit: Math.max(limit * 3, 20),
    fields: "*variants.calculated_price,*categories,*images",
  }

  // Determine filter query
  if (categoryId) {
    queryParams.category_id = [categoryId]
  } else if (collectionId) {
    queryParams.collection_id = [collectionId]
  }

  // Execute query if filter is present
  if (categoryId || collectionId) {
    const res = await listProducts({
      regionId: region.id,
      queryParams,
    }).catch(() => null)

    if (res?.response?.products?.length) {
      pricedProducts = res.response.products
        .filter((product) => {
          const price = getProductPrice({ product }).cheapestPrice
          const hasPrice = Boolean(
            price && price.calculated_price_number > 0
          )
          const hasImage = Boolean(
            product.thumbnail || product.images?.some((image) => Boolean(image.url))
          )

          return hasPrice && hasImage
        })
        .slice(0, limit)
    }
  }

  // If no products matched, don't show an empty rail
  if (pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="content-container py-6 sm:py-8">
      {/* Optional Banner Image */}
      {bannerImage && (
        <div className="mb-4 sm:mb-6 overflow-hidden  shadow-sm">
          {viewAllHref ? (
            <LocalizedClientLink
              href={viewAllHref}
              className="block group"
            >
              <Image
                src={bannerImage}
                alt={title}
                width={1440}
                height={136}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </LocalizedClientLink>
          ) : (
            <Image
              src={bannerImage}
              alt={title}
              width={1440}
              height={136}
              className="w-full h-auto"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          )}
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
        {viewAllHref && (
          <LocalizedClientLink
            href={viewAllHref}
            className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
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

      {/* Five products on desktop; four products in a 2x2 grid below lg. */}
      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {pricedProducts.map((product, index) => (
          <li key={product.id} className={index === 4 ? "hidden lg:list-item" : undefined}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
