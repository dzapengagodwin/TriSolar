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

  const priceInfo =
    cheapestPrice ||
    (product.variants?.[0] ? getPricesForVariant(product.variants[0]) : null)

  // Format category breadcrumb / tags string
  const categoriesString =
    product.categories && product.categories.length > 0
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
      className="group bg-white p-3.5 sm:p-4 border border-gray-100 flex flex-col justify-between h-full relative hover:border-black transition-colors shadow-xs"
    >
      {/* Product Image & Sale Badge */}
      <div className="relative mb-3 flex items-center justify-center">
        {isSale && (
          <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
            {discountText}
          </span>
        )}

        <LocalizedClientLink href={`/products/${product.handle}`} className="block w-full">
          <div className="relative overflow-hidden bg-gray-50/50 flex items-center justify-center w-[209.75px] h-[209.75px] max-w-full mx-auto">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="w-full h-full !bg-transparent !shadow-none !border-none !p-0 !aspect-auto !rounded-none"
              objectFit="contain"
            />
          </div>
        </LocalizedClientLink>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Category Subtitle & Product Title */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-gray-400 line-clamp-1">
            {categoriesString}
          </div>

          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3
              className="text-xs font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-2 leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>
          </LocalizedClientLink>
        </div>

        {/* Bottom Bar: Price & Add to Cart (Only visible on hover) */}
        <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
          {priceInfo && <PreviewPrice price={priceInfo} />}

          <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="w-full block bg-black hover:bg-gray-800 text-white text-[11px] font-bold py-2 px-3 transition-colors uppercase tracking-wider text-center shadow-xs"
            >
              Add to Cart
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
