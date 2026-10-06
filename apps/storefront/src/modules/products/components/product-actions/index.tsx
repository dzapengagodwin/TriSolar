"use client"

import { addToCart } from "@lib/data/cart"
import { trackAddToCart, transformProductToGA4Item } from "@lib/analytics/ecommerce"
import {
  addToWishlist,
  isVariantInWishlist,
  removeFromWishlist,
} from "@lib/data/wishlist"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import isEqual from "lodash/isEqual"
import { useParams, useSearchParams } from "next/navigation"
import { Dispatch, SetStateAction, Suspense, useEffect, useMemo, useRef, useState } from "react"
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
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

function LegacyVariantInitializer({
  variants,
  setOptions,
}: {
  variants?: HttpTypes.StoreProductVariant[]
  setOptions: Dispatch<SetStateAction<Record<string, string | undefined>>>
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const initialVariantId = searchParams.get("v_id")
    if (!initialVariantId) return

    const initialVariant = variants?.find(
      (variant) => variant.id === initialVariantId
    )
    if (initialVariant) {
      setOptions(optionsAsKeymap(initialVariant.options) ?? {})
    }
  }, [searchParams, setOptions, variants])

  return null
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

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

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

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
    <>
      <Suspense fallback={null}>
        <LegacyVariantInitializer
          variants={product.variants}
          setOptions={setOptions}
        />
      </Suspense>
      <div className="flex flex-col gap-y-3" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
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
                    ? "Select variant"
                    : !inStock || !isValidVariant
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
            variantTitle={selectedVariant?.title}
            size="full"
            className="flex-1 min-w-0"
          />

          {/* 4. Circular Wishlist Button */}
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isAddingToWishlist
            }
            aria-label={isInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
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
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isAddingToWishlist}
        />
      </div>
    </>
  )
}
