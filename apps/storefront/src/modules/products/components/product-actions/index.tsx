"use client"

import { Heart } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { trackAddToCart, transformProductToGA4Item } from "@lib/analytics/ecommerce"
import {
  addToWishlist,
  isVariantInWishlist,
  removeFromWishlist,
} from "@lib/data/wishlist"
import { useIntersection } from "@lib/hooks/use-in-view"
import { getDistinguishingVariantOptions } from "@lib/util/product-variants"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import ProductPrice from "../product-price"
import ProductTrustBadge from "../product-trust-badge"
import WhatsAppOrderButton from "../whatsapp-order-button"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"] | undefined
) =>
  variantOptions?.reduce((acc: Record<string, string>, variantOption) => {
    if (variantOption.option_id) {
      acc[variantOption.option_id] = variantOption.value
    }

    return acc
  }, {})

function VariantOptionsInitializer({
  variants,
  optionGroups,
  setOptions,
}: {
  variants?: HttpTypes.StoreProductVariant[] | null
  optionGroups: HttpTypes.StoreProductOption[]
  setOptions: Dispatch<SetStateAction<Record<string, string | undefined>>>
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const variantId = searchParams.get("v_id")
    const variant = variants?.find((item) => item.id === variantId)

    if (variant) {
      const variantOptions = optionsAsKeymap(variant.options)

      setOptions(
        optionGroups.reduce<Record<string, string | undefined>>(
          (selectedOptions, option) => {
            selectedOptions[option.id] = variantOptions?.[option.id]
            return selectedOptions
          },
          {}
        )
      )
      return
    }

    if (variants?.length === 1) {
      const variantOptions = optionsAsKeymap(variants[0].options)

      setOptions(
        optionGroups.reduce<Record<string, string | undefined>>(
          (selectedOptions, option) => {
            selectedOptions[option.id] = variantOptions?.[option.id]
            return selectedOptions
          },
          {}
        )
      )
    }
  }, [searchParams, variants, optionGroups, setOptions])

  return null
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialVariantId = searchParams.get("v_id")
  const { options: productOptions, variants } = product

  const optionGroups = useMemo(
    () =>
      getDistinguishingVariantOptions({
        options: productOptions,
        variants,
      }),
    [productOptions, variants]
  )

  const initialVariant =
    variants?.find((variant) => variant.id === initialVariantId) ||
    (variants?.length === 1 ? variants[0] : undefined)

  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => {
      const initialOptions = optionsAsKeymap(initialVariant?.options)

      return optionGroups.reduce<Record<string, string | undefined>>(
        (selectedOptions, option) => {
          selectedOptions[option.id] = initialOptions?.[option.id]
          return selectedOptions
        },
        {}
      )
    }
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [buyNowError, setBuyNowError] = useState<string | null>(null)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null)

  const params = useParams()
  const countryCode =
    (params.countryCode as string) ||
    process.env.NEXT_PUBLIC_DEFAULT_REGION ||
    "zw"

  const hasVariantChoices = (variants?.length ?? 0) > 1

  const selectedVariant = useMemo(() => {
    const productVariants = variants || []

    if (productVariants.length === 0) {
      return
    }

    if (optionGroups.length === 0) {
      return (
        productVariants.find((variant) => variant.id === initialVariantId) ||
        productVariants[0]
      )
    }

    if (optionGroups.some((option) => !options[option.id])) {
      return
    }

    return productVariants.find((variant) =>
      optionGroups.every((option) => {
        const value = variant.options?.find(
          (variantOption) => variantOption.option_id === option.id
        )?.value

        return value === options[option.id]
      })
    )
  }, [variants, optionGroups, options, initialVariantId])

  const hasCompleteSelection = optionGroups.every((option) =>
    Boolean(options[option.id])
  )
  const isValidVariant = Boolean(selectedVariant)
  const isUnavailable = hasCompleteSelection && !selectedVariant

  useEffect(() => {
    let isMounted = true

    if (!selectedVariant?.id) {
      setIsInWishlist(false)

      return () => {
        isMounted = false
      }
    }

    isVariantInWishlist(selectedVariant.id).then((saved) => {
      if (isMounted) {
        setIsInWishlist(saved)
      }
    })

    return () => {
      isMounted = false
    }
  }, [selectedVariant?.id])

  const updateVariantUrl = (variantId?: string) => {
    const url = new URL(window.location.href)
    const currentVariantId = url.searchParams.get("v_id")

    if (variantId) {
      url.searchParams.set("v_id", variantId)
    } else {
      url.searchParams.delete("v_id")
    }

    if (currentVariantId === (variantId || null)) {
      return
    }

    const href = `${url.pathname}${url.search}${url.hash}`

    if (variantId) {
      router.push(href, { scroll: false })
    } else {
      router.replace(href, { scroll: false })
    }
  }

  const setOptionValue = (optionId: string, value: string) => {
    const nextOptions = {
      ...options,
      [optionId]: value,
    }

    setOptions(nextOptions)

    const selectionIsComplete = optionGroups.every((option) =>
      Boolean(nextOptions[option.id])
    )

    const matchingVariant = selectionIsComplete
      ? variants?.find((variant) =>
          optionGroups.every((option) => {
            const variantValue = variant.options?.find(
              (variantOption) => variantOption.option_id === option.id
            )?.value

            return variantValue === nextOptions[option.id]
          })
        )
      : undefined

    updateVariantUrl(matchingVariant?.id)
  }

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || isBuyingNow) {
      return
    }

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      trackAddToCart({
        item: transformProductToGA4Item(product, selectedVariant, quantity),
        quantity,
        currency: region.currency_code?.toUpperCase() || "USD",
      })
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (
      !selectedVariant?.id ||
      !inStock ||
      !isValidVariant ||
      disabled ||
      isAdding ||
      isBuyingNow
    ) {
      return
    }

    setIsBuyingNow(true)
    setBuyNowError(null)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      trackAddToCart({
        item: transformProductToGA4Item(product, selectedVariant, quantity),
        quantity,
        currency: region.currency_code?.toUpperCase() || "USD",
      })

      window.location.href = "/checkout"
    } catch (error) {
      console.error("Failed to buy item:", error)
      setBuyNowError(
        error instanceof Error ? error.message : "Failed to proceed to checkout"
      )
      setIsBuyingNow(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!selectedVariant?.id) {
      return
    }

    setIsAddingToWishlist(true)

    try {
      const result = isInWishlist
        ? await removeFromWishlist(selectedVariant.id)
        : await addToWishlist(selectedVariant.id, countryCode, product.id)

      if (result.success) {
        setIsInWishlist(!isInWishlist)
        setWishlistFeedback(
          isInWishlist ? "Removed from wishlist" : "Saved to wishlist"
        )
        router.refresh()
      } else {
        setWishlistFeedback(result.error || "Could not save this item")
      }
    } catch (error: unknown) {
      console.error(error)
      setWishlistFeedback(
        error instanceof Error ? error.message : "Could not save this item"
      )
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const variantOptionSummary = selectedVariant
    ? optionGroups
        .map((option) => {
          const value = selectedVariant.options?.find(
            (variantOption) => variantOption.option_id === option.id
          )?.value

          return value ? `${option.title}: ${value}` : null
        })
        .filter((value): value is string => Boolean(value))
        .join(", ") || selectedVariant.title || undefined
    : undefined

  return (
    <>
      <Suspense fallback={null}>
        <VariantOptionsInitializer
          variants={variants}
          optionGroups={optionGroups}
          setOptions={setOptions}
        />
      </Suspense>

      <div className="flex flex-col gap-y-3" ref={actionsRef}>
        {optionGroups.length > 0 && (
          <div className="flex flex-col gap-y-4">
            {optionGroups.map((option) => (
              <div key={option.id}>
                <OptionSelect
                  option={option}
                  current={options[option.id]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  data-testid="product-options"
                  disabled={
                    !!disabled ||
                    isAdding ||
                    isBuyingNow ||
                    isAddingToWishlist
                  }
                />
              </div>
            ))}
            <Divider />
          </div>
        )}

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="flex items-center gap-2 sm:gap-2.5 pt-2">
          <div className="flex items-center justify-between bg-orange-50/70 border border-orange-100 rounded-full p-1 h-12 w-24 sm:w-28 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() =>
                setQuantity((previous) => (previous > 1 ? previous - 1 : 1))
              }
              disabled={quantity <= 1 || isAdding || isBuyingNow}
              className="w-8 h-8 rounded-full bg-white border border-orange-100 text-primary flex items-center justify-center font-bold text-sm hover:bg-orange-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer select-none"
              aria-label="Decrease quantity"
            >
              –
            </button>

            <span className="text-sm sm:text-base font-bold text-gray-900 select-none">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity((previous) => previous + 1)}
              disabled={isAdding || isBuyingNow}
              className="w-8 h-8 rounded-full bg-white border border-orange-100 text-primary flex items-center justify-center font-bold text-sm hover:bg-orange-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer select-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isBuyingNow ||
              isAddingToWishlist ||
              !isValidVariant
            }
            className="flex-1 min-w-0 h-12 rounded-full border-2 border-[#F9501F] bg-white hover:bg-orange-50 active:scale-[0.99] text-[#F9501F] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 px-2.5 sm:px-3 shadow-xs transition-all disabled:cursor-not-allowed cursor-pointer whitespace-nowrap overflow-hidden"
            data-testid="add-product-button"
          >
            {isAdding ? (
              <Spinner className="w-4 h-4 animate-spin text-primary shrink-0" />
            ) : (
              <>
                <span className="truncate">
                  {selectedVariant && !inStock
                    ? "Out of stock"
                    : !selectedVariant && isUnavailable
                    ? "Unavailable"
                    : !selectedVariant && hasVariantChoices
                    ? "Select variant"
                    : "Add to Cart"}
                </span>

                <svg
                  className="w-4 h-4 text-current shrink-0 hidden 2xl:inline"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </>
            )}
          </button>

          <WhatsAppOrderButton
            productTitle={product.title}
            productHandle={product.handle}
            variantTitle={variantOptionSummary}
            size="full"
            iconOnly
            className="shrink-0"
          />

          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isBuyingNow ||
              isAddingToWishlist
            }
            aria-label={
              isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"
            }
            className="w-12 h-12 rounded-full border border-orange-100 bg-white hover:bg-orange-50 flex items-center justify-center text-gray-700 hover:text-red-500 hover:border-red-200 shadow-2xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isInWishlist
                  ? "fill-primary text-primary"
                  : "text-gray-700 hover:text-primary"
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            isBuyingNow ||
            isAddingToWishlist ||
            !isValidVariant
          }
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary hover:bg-[#D83D0F] active:scale-[0.99] px-4 text-sm font-bold text-white shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          data-testid="buy-now-button"
        >
          {isBuyingNow ? (
            <>
              <Spinner className="h-4 w-4 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Buy now</span>
          )}
        </button>

        {buyNowError && (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {buyNowError}
          </p>
        )}

        {wishlistFeedback && (
          <p role="status" className="text-xs font-semibold text-gray-700">
            {wishlistFeedback}
          </p>
        )}

        <ProductTrustBadge />

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isBuyingNow || isAddingToWishlist}
        />
      </div>
    </>
  )
}