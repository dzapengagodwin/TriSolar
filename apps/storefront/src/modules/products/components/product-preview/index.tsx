import { getProductPrice, getPricesForVariant } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductImageAlt } from "@lib/seo"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import QuickAddToCart from "../quick-add-to-cart"

export default function ProductPreview({
  product,
  isFeatured,
  viewMode = "grid",
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  viewMode?: "grid" | "list"
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

  // Horizontal List View Mode
  if (viewMode === "list") {
    return (
      <div
        data-testid="product-wrapper"
        className="group bg-white p-4 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative transition-all duration-200 shadow-xs hover:shadow-md w-full"
      >
        {/* Left: Thumbnail & Badges */}
        <div className="relative shrink-0 w-full sm:w-44 flex items-center justify-center">
          {isSale && (
            <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
              {discountText}
            </span>
          )}
          <LocalizedClientLink href={`/products/${product.handle}`} className="block w-full">
            <div className="relative overflow-hidden bg-gray-50/50 flex items-center justify-center w-36 h-36 mx-auto sm:mx-0">
              <Thumbnail
                thumbnail={product.thumbnail}
                images={product.images}
                size="full"
                isFeatured={isFeatured}
                alt={getProductImageAlt({
                  title: product.title,
                  brand:
                    ((product as unknown as Record<string, unknown>).brand as { name?: string } | undefined)?.name ||
                    (product.metadata?.brand as string),
                })}
                className="w-full h-full !bg-transparent !shadow-none !border-none !p-0 !aspect-auto !rounded-none"
                objectFit="contain"
              />
            </div>
          </LocalizedClientLink>
        </div>

        {/* Center: Info, Category, Title, Short Description */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="text-[11px] font-medium text-gray-500">
            {categoriesString}
          </div>

          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3
              className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>
          </LocalizedClientLink>

          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
              {product.description}
            </p>
          )}

          {/* Options tags preview if available */}
          {product.options && product.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.options.slice(0, 3).map((opt) => (
                <span
                  key={opt.id}
                  className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded"
                >
                  {opt.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Price & Add to Cart */}
        <div className="w-full sm:w-48 shrink-0 flex flex-col sm:items-end justify-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-6">
          {priceInfo && <PreviewPrice price={priceInfo} />}

          <QuickAddToCart
            product={product}
            size="lg"
            viewMode="list"
          />
        </div>
      </div>
    )
  }

  // Standard Multi-column Grid View Mode
  return (
    <div
      data-testid="product-wrapper"
      className="group bg-white p-3.5 sm:p-4 border border-gray-100 flex flex-col justify-between h-full relative transition-all duration-200 shadow-xs hover:shadow-md"
    >
      {/* Product Image & Sale Badge */}
      <div className="relative mb-3 flex items-center justify-center">
        {isSale && (
          <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
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
              alt={getProductImageAlt({
                title: product.title,
                brand:
                  ((product as unknown as Record<string, unknown>).brand as { name?: string } | undefined)?.name ||
                  (product.metadata?.brand as string),
              })}
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
          <div className="text-[11px] font-medium text-gray-500 line-clamp-1">
            {categoriesString}
          </div>

          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3
              className="text-[13px] sm:text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>
          </LocalizedClientLink>
        </div>

        {/* Bottom Bar: Price & Add to Cart (Instant on mobile, revealed on hover on desktop) */}
        <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
          {priceInfo && <PreviewPrice price={priceInfo} />}

          <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <QuickAddToCart
              product={product}
              size="md"
              viewMode="grid"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
