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

  const category = product.categories?.[0]?.name

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
      : "SPECIAL OFFER"

  const imageAlt = getProductImageAlt({
    title: displayTitle,
    brand,
  })

  if (viewMode === "list") {
    return (
      <article
        data-testid="product-wrapper"
        className="group relative flex w-full flex-col gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg sm:flex-row sm:items-center sm:gap-6 sm:p-5"
      >
        <div className="relative w-full shrink-0 sm:w-48">
          {isSale && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-700 px-3 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-sm">
              {discountText}
            </span>
          )}
          <LocalizedClientLink
            href={productHref}
            className="block overflow-hidden rounded-xl bg-slate-50"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[220px]">
              <Thumbnail
                thumbnail={variantImage}
                images={variantImages}
                size="full"
                isFeatured={isFeatured}
                alt={imageAlt}
                className="!aspect-auto !rounded-none !border-0 !bg-transparent !p-3 !shadow-none"
                objectFit="contain"
              />
            </div>
          </LocalizedClientLink>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {brand && (
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
                {brand}
              </span>
            )}
            {category && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                {category}
              </span>
            )}
          </div>
          <LocalizedClientLink href={productHref}>
            <h3
              className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 sm:text-lg"
              data-testid="product-title"
            >
              {displayTitle}
            </h3>
          </LocalizedClientLink>
          {product.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
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
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    {value ? `${option.title}: ${value}` : option.title}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:w-52 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          {priceInfo && (
            <div className="text-slate-950">
              <PreviewPrice price={priceInfo} />
            </div>
          )}
          <div className="space-y-2">
            <QuickAddToCart
              product={product}
              variant={variant}
              size="lg"
              viewMode="list"
              className="!rounded-lg !normal-case !tracking-normal"
            />
            <WhatsAppOrderButton
              productTitle={displayTitle}
              productHandle={product.handle}
              variantTitle={variantSummary || undefined}
              size="lg"
              className="!rounded-lg"
            />
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      data-testid="product-wrapper"
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
        {isSale && (
          <span className="absolute left-5 top-5 z-10 inline-flex items-center rounded-full bg-blue-700 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md sm:left-6 sm:top-6">
            {discountText}
          </span>
        )}
        <LocalizedClientLink
          href={productHref}
          className="block overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/70"
        >
          <div className="relative aspect-square w-full">
            <Thumbnail
              thumbnail={variantImage}
              images={variantImages}
              size="full"
              isFeatured={isFeatured}
              alt={imageAlt}
              className="!aspect-auto !rounded-none !border-0 !bg-transparent !p-3 !shadow-none transition-transform duration-500 group-hover:scale-[1.04] sm:!p-5"
              objectFit="contain"
            />
          </div>
        </LocalizedClientLink>
      </div>

      <div className="flex flex-1 flex-col p-3 pt-4 sm:p-4">
        <div className="mb-2 flex min-h-5 flex-wrap items-center gap-2">
          {brand && (
            <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-700 sm:text-[10px]">
              {brand}
            </span>
          )}
          {category && (
            <span className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
              {category}
            </span>
          )}
        </div>

        <LocalizedClientLink href={productHref} className="block">
          <h3
            className="line-clamp-2 min-h-[2.6rem] text-[13px] font-bold leading-[1.3] text-slate-900 transition-colors group-hover:text-blue-700 sm:text-sm"
            data-testid="product-title"
          >
            {displayTitle}
          </h3>
        </LocalizedClientLink>

        {optionGroups.length > 0 && (
          <div className="mt-2 flex min-h-5 flex-wrap gap-1">
            {optionGroups.slice(0, 2).map((option) => {
              const value = variant?.options?.find(
                (variantOption) => variantOption.option_id === option.id
              )?.value

              return (
                <span
                  key={option.id}
                  className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-500"
                >
                  {value ? `${option.title}: ${value}` : option.title}
                </span>
              )
            })}
          </div>
        )}

        <div className="mt-auto pt-3">
          {priceInfo && (
            <div className="mb-3 border-t border-slate-100 pt-3">
              <PreviewPrice price={priceInfo} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            <QuickAddToCart
              product={product}
              variant={variant}
              size="md"
              viewMode="grid"
              className="!min-h-10 !rounded-lg !py-2.5 !text-[10px] !normal-case !tracking-wide"
            />
            <WhatsAppOrderButton
              productTitle={displayTitle}
              productHandle={product.handle}
              variantTitle={variantSummary || undefined}
              size="md"
              className="!min-h-10 !rounded-lg !py-2.5 !text-[10px]"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
