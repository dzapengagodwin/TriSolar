"use client"

import { useState, useTransition, useMemo, MouseEvent } from "react"
import { useParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { trackAddToCart, transformProductToGA4Item } from "@lib/analytics/ecommerce"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"

type QuickAddToCartProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  className?: string
  size?: "sm" | "md" | "lg"
  viewMode?: "grid" | "list" | "deals"
}

export default function QuickAddToCart({
  product,
  variant: propVariant,
  className = "",
  size = "md",
  viewMode: _viewMode,
}: QuickAddToCartProps) {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "zw"
  const [isPending, startTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)

  // 1. Identify which variant to add
  const variants = useMemo(() => product.variants || [], [product.variants])
  const hasMultipleVariants = variants.length > 1

  const targetVariant = useMemo(() => {
    if (propVariant) return propVariant
    if (variants.length === 1) return variants[0]
    // If multiple variants exist, find if one is marked in stock or default
    return variants.find((v) => {
      const manage = v.manage_inventory ?? false
      const allowBackorder = v.allow_backorder ?? false
      const qty = v.inventory_quantity ?? 0
      return !manage || allowBackorder || qty > 0
    }) || variants[0]
  }, [propVariant, variants])

  // 2. Check in-stock status
  const inStock = useMemo(() => {
    if (!targetVariant) return false
    const manage = targetVariant.manage_inventory ?? false
    const allowBackorder = targetVariant.allow_backorder ?? false
    const qty = targetVariant.inventory_quantity ?? 0
    return !manage || allowBackorder || qty > 0
  }, [targetVariant])

  // 3. Handle Add to Cart action
  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!targetVariant?.id || isPending || !inStock) return

    startTransition(async () => {
      try {
        await addToCart({
          variantId: targetVariant.id,
          quantity: 1,
          countryCode,
        })
        trackAddToCart({
          item: transformProductToGA4Item(product, targetVariant, 1),
          quantity: 1,
        })
        setIsAdded(true)
        // Automatically trigger cart slideout drawer
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("open-cart"))
        }
        setTimeout(() => {
          setIsAdded(false)
        }, 1500)
      } catch (err) {
        console.error("Failed to add to cart:", err)
      }
    })
  }

  // 4. Out of Stock button state
  if (!inStock && !hasMultipleVariants) {
    return (
      <button
        disabled
        className={`w-full bg-gray-100 text-gray-400 text-xs font-semibold py-2 px-3 rounded-none uppercase tracking-wider text-center cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    )
  }

  // 5. If product has multiple selectable option variants, provide direct link to configure
  if (hasMultipleVariants && !propVariant) {
    return (
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className={`w-full block bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-3 transition-colors uppercase tracking-wider text-center shadow-xs ${className}`}
      >
        Select Options
      </LocalizedClientLink>
    )
  }

  // 6. Active Quick Add Button (Single variant / Selected variant)
  const sizeClasses = {
    sm: "py-1.5 px-3 text-[10px]",
    md: "py-2 px-3 text-[11px]",
    lg: "py-2.5 px-4 text-xs",
  }[size]

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-1.5 font-bold transition-all duration-200 uppercase tracking-wider text-center shadow-xs cursor-pointer ${
        isAdded
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : isPending
          ? "bg-gray-800 text-white cursor-wait opacity-90"
          : "bg-primary hover:bg-primary-hover text-white"
      } ${sizeClasses} ${className}`}
      data-testid="quick-add-to-cart-button"
      aria-label={`Add ${product.title} to cart`}
    >
      {isPending ? (
        <>
          <Spinner className="w-3.5 h-3.5 animate-spin" />
          <span>Adding...</span>
        </>
      ) : isAdded ? (
        <>
          <svg
            className="w-3.5 h-3.5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added!</span>
        </>
      ) : (
        <span>Add to Cart</span>
      )}
    </button>
  )
}
