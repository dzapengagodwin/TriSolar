import { getProductPrice, getPricesForVariant } from "@lib/util/get-product-price"
import { getDistinguishingVariantOptions } from "@lib/util/product-variants"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductImageAlt } from "@lib/seo"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import QuickAddToCart from "../quick-add-to-cart"
import WhatsAppOrderButton from "../whatsapp-order-button"

export default function ProductPreview({
  product,
  variant,
  variantOptions,
  isFeatured,
  viewMode = "grid",
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  variantOptions?: HttpTypes.StoreProductOption[]
  isFeatured?: boolean
  viewMode?: "grid" | "list"
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const priceInfo = variant
    ? getPricesForVariant(variant)
    : cheapestPrice ||
      (product.variants?.[0]
        ? getPricesForVariant(product.variants[0])
        : null)

  const optionGroups =
    variantOptions ?? getDistinguishingVariantOptions(product)

  const variantSummary = variant
    ? optionGroups
        .map((option) => {
          const value = variant.options?.find(
            (variantOption) => variantOption.option_id === option.id
          )?.value

          return value ? `${option.title}: ${value}` : null
        })
        .filter((value): value is string => Boolean(value))
        .join(", ")
    : ""

  const displayTitle =
    variant && variantOptions !== undefined
      ? variant.title || product.title
      : product.title

  const productHref = `/products/${product.handle}${
    variant ? `?v_id=${encodeURIComponent(variant.id)}` : ""
  }`

  const variantImage =
    variant?.images?.[0]?.url || product.thumbnail || undefined

  const variantImages =
    variant?.images?.length ? variant.images : product.images

  const brand =
    ((product as unknown as Record<string, unknown>).brand as
      | { name?: string }
      | undefined)?.name || (product.metadata?.brand as string)

  const categoriesString =
    product.categories && product.categories.length > 0
      ? product.categories
          .map((category: HttpTypes.StoreProductCategory) => category.name)
          .join(", ")
      : "General Category"

  const isSale = Boolean(
    priceInfo &&
      (priceInfo.price_type === "sale" ||
        (typeof priceInfo.percentage_diff === "number" &&
          priceInfo.percentage_diff > 0) ||
        (typeof priceInfo.percentage_diff === "string" &&
          parseInt(priceInfo.percentage_diff) > 0) ||
        priceInfo.original_price_number > priceInfo.calculated_price_number)
  )

  const discountText =
    priceInfo?.percentage_diff &&
    parseInt(String(priceInfo.percentage_diff)) > 0
      ? `-${priceInfo.percentage_diff}%`
      : "Sale!"

  if (viewMode === "list") {
    return (
      <div
        data-testid="product-wrapper"
        className="group relative flex w-full flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 sm:flex-row sm:items-center sm:p-5"
      >
        <div className="relative flex w-full shrink-0 items-center justify-center sm:w-44">
          {isSale && (
            <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
              {discountText}
            </span>
          )}

          <LocalizedClientLink href={productHref} className="block w-full">
            <div className="relative mx-auto flex h-40 w-full max-w-[190px] items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:mx-0 sm:h-36 sm:w-36">
              <Thumbnail
                thumbnail={variantImage}
                images={variantImages}
                size="full"
                isFeatured={isFeatured}
                alt={getProductImageAlt({
                  title: displayTitle,
                  brand,
                })}
                className="h-full w-full !rounded-xl !border-0 !bg-transparent !p-2 !shadow-none !aspect-auto transition-transform duration-500 group-hover:scale-105"
                objectFit="contain"
              />
            </div>
          </LocalizedClientLink>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="inline-flex max-w-full rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            {categoriesString}
          </div>

          <LocalizedClientLink href={productHref}>
            <h3
              className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 sm:text-base"
              data-testid="product-title"
            >
              {displayTitle}
            </h3>
          </LocalizedClientLink>

          {product.description && (
            <p className="line-clamp-2 text-xs font-normal leading-relaxed text-slate-500">
              {product.description}
            </p>
          )}

          {optionGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {optionGroups.slice(0, 3).map((option) => {
                const value = variant?.options?.find(
                  (variantOption) => variantOption.option_id === option.id
                )?.value

                return (
                  <span
                    key={option.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    {value ? `${option.title}: ${value}` : option.title}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-slate-100 pt-4 sm:w-48 sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          {priceInfo && <PreviewPrice price={priceInfo} />}

          <div className="w-full space-y-1.5">
            <QuickAddToCart
              product={product}
              variant={variant}
              size="lg"
              viewMode="list"
            />

            <WhatsAppOrderButton
              productTitle={displayTitle}
              productHandle={product.handle}
              variantTitle={variantSummary || undefined}
              size="lg"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="product-wrapper"
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-4"
    >
      <div className="relative mb-4 flex items-center justify-center">
        {isSale && (
          <span className="absolute top-0 left-0 z-10 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs">
            {discountText}
          </span>
        )}

        <LocalizedClientLink href={productHref} className="block w-full">
          <div className="relative mx-auto flex aspect-square w-full max-w-none items-center justify-center overflow-hidden rounded-xl bg-slate-50">
            <Thumbnail
              thumbnail={variantImage}
              images={variantImages}
              size="full"
              isFeatured={isFeatured}
              alt={getProductImageAlt({
                title: displayTitle,
                brand,
              })}
              className="h-full w-full !rounded-xl !border-0 !bg-transparent !p-2 !shadow-none !aspect-auto transition-transform duration-500 group-hover:scale-105"
              objectFit="contain"
            />
          </div>
        </LocalizedClientLink>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="mb-1 inline-flex max-w-full rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            {categoriesString}
          </div>

          <LocalizedClientLink href={productHref}>
            <h3
              className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700"
              data-testid="product-title"
            >
              {displayTitle}
            </h3>
          </LocalizedClientLink>
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          {priceInfo && <PreviewPrice price={priceInfo} />}

          <div className="space-y-2">
            <QuickAddToCart
              product={product}
              variant={variant}
              size="md"
              viewMode="grid"
            />

            <WhatsAppOrderButton
              productTitle={displayTitle}
              productHandle={product.handle}
              variantTitle={variantSummary || undefined}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}