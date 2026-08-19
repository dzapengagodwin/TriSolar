import { getProductPrice, getPricesForVariant } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const priceInfo = cheapestPrice || (product.variants?.[0] ? getPricesForVariant(product.variants[0]) : null)

  // Format category breadcrumb / tags string
  const categoriesString = product.categories && product.categories.length > 0
    ? product.categories.map((c: HttpTypes.StoreProductCategory) => c.name).join(", ")
    : "General Category"

  const isSale = Boolean(
    priceInfo &&
      (priceInfo.price_type === "sale" ||
        (typeof priceInfo.percentage_diff === "number" && priceInfo.percentage_diff > 0) ||
        (typeof priceInfo.percentage_diff === "string" && parseInt(priceInfo.percentage_diff) > 0) ||
        priceInfo.original_price_number > priceInfo.calculated_price_number)
  )

  const discountText =
    priceInfo?.percentage_diff && parseInt(String(priceInfo.percentage_diff)) > 0
      ? `-${priceInfo.percentage_diff}%`
      : "Sale!"

  return (
    <div
      data-testid="product-wrapper"
      className="group bg-white rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-full relative hover:border-black transition-colors shadow-xs"
    >
      {/* Product Image & Sale Badge */}
      <div className="relative mb-3">
        {isSale && (
          <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {discountText}
          </span>
        )}

        <LocalizedClientLink href={`/products/${product.handle}`} className="block">
          <div className="relative overflow-hidden bg-gray-50/50 flex items-center justify-center h-44 rounded-xl">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="w-full h-full !bg-transparent !shadow-none !border-none !p-0 !aspect-auto"
              objectFit="cover"
            />
          </div>
        </LocalizedClientLink>
      </div>

      {/* Category Subtitle */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-400 line-clamp-1">
            {categoriesString}
          </div>

          {/* Product Title */}
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3
              className="text-xs font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-2 leading-snug mt-1"
              data-testid="product-title"
            >
              {product.title}
            </h3>
          </LocalizedClientLink>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-2 border-t border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            {priceInfo && <PreviewPrice price={priceInfo} />}

            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="bg-black hover:bg-gray-800 text-white text-[10px] font-bold py-2 px-4 rounded-full transition-colors uppercase tracking-wider text-center w-full sm:w-auto shrink-0"
            >
              Add to Cart
            </LocalizedClientLink>
          </div>
        </div>

      </div>
    </div>
  )
}
