"use client"

import { addToCart } from "@lib/data/cart"
import {
  trackAddToCart,
  transformProductToGA4Item,
} from "@lib/analytics/ecommerce"
import {
  addToWishlist,
  isVariantInWishlist,
  removeFromWishlist,
} from "@lib/data/wishlist"
import { useIntersection } from "@lib/hooks/use-in-view"
import {
  getDistinctVariantOptions,
  getVariantOptionSummary,
} from "@lib/util/product-variants"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"
import { Heart } from "@medusajs/icons"
import Spinner from "@modules/common/icons/spinner"
import ProductTrustBadge from "../product-trust-badge"
import WhatsAppOrderButton from "../whatsapp-order-button"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"] | undefined
) =>
  variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialVariantId = searchParams.get("v_id")
  const selectedVariantId = initialVariantId
  const optionGroups = useMemo(
    () => getDistinctVariantOptions(product),
    [product]
  )
  const initialVariant =
    product.variants?.find((variant) => variant.id === initialVariantId) ||
    (product.variants?.length === 1 ? product.variants[0] : undefined)
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
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

  useEffect(() => {
    const variantId = searchParams.get("v_id")
    if (!variantId) {
      return
    }

    const variant = product.variants?.find((item) => item.id === variantId)
    if (!variant) {
      return
    }

    const variantOptions = optionsAsKeymap(variant?.options)

    setOptions(
      optionGroups.reduce<Record<string, string | undefined>>(
        (selectedOptions, option) => {
          selectedOptions[option.id] = variantOptions?.[option.id]
          return selectedOptions
        },
        {}
      )
    )
  }, [searchParams, product.variants, optionGroups])

  const selectedVariant = useMemo(() => {
    const variants = product.variants || []
    if (variants.length === 0) {
      return
    }

    if (optionGroups.length === 0) {
      return (
        variants.find((variant) => variant.id === selectedVariantId) ||
        variants[0]
      )
    }

    if (optionGroups.some((option) => !options[option.id])) {
      return
    }

    return variants.find((variant) =>
      optionGroups.every((option) => {
        const value = variant.options?.find(
          (variantOption) => variantOption.option_id === option.id
        )?.value
        return value === options[option.id]
      })
    )
  }, [product.variants, optionGroups, options, selectedVariantId])

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

    const hasCompleteSelection = optionGroups.every((option) =>
      Boolean(nextOptions[option.id])
    )
    const matchingVariant = hasCompleteSelection
      ? product.variants?.find((variant) =>
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

  const isValidVariant = Boolean(selectedVariant)
  const hasCompleteSelection = optionGroups.every((option) =>
    Boolean(options[option.id])
  )
  const isUnavailable = hasCompleteSelection && !selectedVariant

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

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

  // Toggle the selected variant in the wishlist
  const handleAddToWishlist = async () => {
    if (!selectedVariant?.id) return null

    setIsAddingToWishlist(true)
    try {
      const res = isInWishlist
        ? await removeFromWishlist(selectedVariant.id)
        : await addToWishlist(selectedVariant.id, countryCode, product.id)
      if (res.success) {
        setIsInWishlist(!isInWishlist)
        setWishlistFeedback(
          isInWishlist ? "Removed from wishlist" : "Saved to wishlist"
        )
        router.refresh()
      } else {
        setWishlistFeedback(res.error || "Could not save this item")
      }
    } catch (err: unknown) {
      console.error(err)
      setWishlistFeedback(
        err instanceof Error ? err.message : "Could not save this item"
      )
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-3" ref={actionsRef}>
      <div>
        {optionGroups.length > 0 && (
          <div className="flex flex-col gap-y-4">
            {optionGroups.map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding || isAddingToWishlist}
                  />
                </div>
              )
            })}
            <Divider />
          </div>
        )}
      </div>

      <ProductPrice product={product} variant={selectedVariant} />

      {/* 3-Element Horizontal Buy Actions Row matching reference image */}
      <div className="flex items-center gap-2 sm:gap-2.5 pt-2">
        {/* 1. Quantity Selector Pill */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200/90 rounded-full p-1 h-12 w-24 sm:w-28 shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            disabled={quantity <= 1 || isAdding}
            className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center font-bold text-sm hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer select-none"
            aria-label="Decrease quantity"
          >
            –
          </button>
          <span className="text-sm sm:text-base font-bold text-gray-900 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            disabled={isAdding}
            className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center font-bold text-sm hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer select-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* 2. Main Add to Cart Pill Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            isAddingToWishlist ||
            !isValidVariant
          }
          className="flex-1 min-w-0 h-12 rounded-full bg-primary hover:bg-orange-400 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 px-2.5 sm:px-3 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap overflow-hidden"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <Spinner className="w-4 h-4 animate-spin text-white shrink-0" />
          ) : (
            <>
              <span className="truncate">
                {!selectedVariant
                  ? isUnavailable
                    ? "Unavailable"
                    : "Select variant"
                  : !inStock
                  ? "Out of stock"
                  : "Add to Cart"}
              </span>
              <svg
                className="w-4 h-4 text-white shrink-0 hidden 2xl:inline"
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

        {/* 3. Order on WhatsApp Pill Button */}
        <WhatsAppOrderButton
          productTitle={product.title}
          productHandle={product.handle}
          variantTitle={
            getVariantOptionSummary(product, selectedVariant) || undefined
          }
          size="full"
          className="flex-1 min-w-0"
        />

        {/* 4. Circular Wishlist Button */}
        <button
          type="button"
          onClick={handleAddToWishlist}
          disabled={
            !selectedVariant || !!disabled || isAdding || isAddingToWishlist
          }
          aria-label={
            isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"
          }
          className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-red-500 hover:border-red-200 shadow-2xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
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

      {wishlistFeedback && (
        <p role="status" className="text-xs font-semibold text-gray-700">
          {wishlistFeedback}
        </p>
      )}

      {/* Delivery Guarantee & Payment Trust Badge */}
      <ProductTrustBadge />

      <MobileActions
        product={product}
        variant={selectedVariant}
        optionGroups={optionGroups}
        options={options}
        variantUnavailable={isUnavailable}
        updateOptions={setOptionValue}
        inStock={inStock}
        handleAddToCart={handleAddToCart}
        isAdding={isAdding}
        show={!inView}
        optionsDisabled={!!disabled || isAdding || isAddingToWishlist}
      />
    </div>
  )
}
