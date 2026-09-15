"use client"

import { convertToLocale } from "@lib/util/money"
import { deleteLineItem, updateLineItem, addToCart } from "@lib/data/cart"
import { getCartAccessoryRecommendations } from "@lib/data/recommendations"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname, useParams } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { ShoppingBag, Trash, Spinner } from "@medusajs/icons"
import Image from "next/image"

type CartDropdownProps = {
  cart?: HttpTypes.StoreCart | null
}

const CartDropdown = ({ cart: cartState }: CartDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null)
  const [accessories, setAccessories] = useState<HttpTypes.StoreProduct[]>([])
  const [addingAccessoryId, setAddingAccessoryId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const pathname = usePathname()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "zw"

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  // Fetch dynamic accessory recommendations from backend for current cart items
  useEffect(() => {
    let isMounted = true
    const fetchAccessories = async () => {
      if (!cartState?.items || cartState.items.length === 0) {
        setAccessories([])
        return
      }

      const productIds = cartState.items
        .map((item) => {
          const itemRecord = item as unknown as Record<string, unknown>
          const variantRecord = item.variant as unknown as Record<string, unknown> | undefined
          const productRecord = item.product as unknown as Record<string, unknown> | undefined
          return (
            (itemRecord?.product_id as string | undefined) ||
            (variantRecord?.product_id as string | undefined) ||
            (productRecord?.id as string | undefined) ||
            (item.variant?.product?.id as string | undefined)
          )
        })
        .filter(Boolean) as string[]

      if (productIds.length === 0) {
        setAccessories([])
        return
      }

      try {
        const recs = await getCartAccessoryRecommendations(productIds)
        if (isMounted) {
          setAccessories(recs || [])
        }
      } catch {
        if (isMounted) setAccessories([])
      }
    }

    fetchAccessories()

    return () => {
      isMounted = false
    }
  }, [cartState?.items])

  const handleAddAccessory = (accessory: HttpTypes.StoreProduct) => {
    const variantId = accessory.variants?.[0]?.id
    if (!variantId) return

    setAddingAccessoryId(accessory.id)
    startTransition(async () => {
      try {
        await addToCart({
          variantId,
          quantity: 1,
          countryCode,
        })
      } finally {
        setAddingAccessoryId(null)
      }
    })
  }

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const subtotal = cartState?.item_subtotal ?? 0
  const taxes = cartState?.tax_total ?? 0
  const total = cartState?.total ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  // Auto-open drawer when modifying cart items, unless on cart/checkout pages
  useEffect(() => {
    if (
      itemRef.current !== totalItems &&
      !pathname.includes("/cart") &&
      !pathname.includes("/checkout")
    ) {
      open()
    }
    itemRef.current = totalItems
  }, [totalItems, pathname])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    const handleOpenCartEvent = () => open()

    window.addEventListener("open-cart", handleOpenCartEvent)

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-cart", handleOpenCartEvent)
    }
  }, [isOpen])

  const handleUpdateQuantity = (lineId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty < 1) {
      handleDelete(lineId)
      return
    }

    setUpdatingLineId(lineId)
    startTransition(async () => {
      try {
        await updateLineItem({ lineId, quantity: newQty })
      } finally {
        setUpdatingLineId(null)
      }
    })
  }

  const handleDelete = (lineId: string) => {
    setUpdatingLineId(lineId)
    startTransition(async () => {
      try {
        await deleteLineItem(lineId)
      } finally {
        setUpdatingLineId(null)
      }
    })
  }

  return (
    <>
      {/* Trigger Button in Nav */}
      <button
        onClick={open}
        className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-2.5 sm:px-4 py-2 rounded-full font-bold text-xs transition-colors shadow-sm shrink-0"
        data-testid="nav-cart-link"
        aria-label="Open Shopping Cart"
      >
        <span className="hidden sm:inline">
          {convertToLocale({
            amount: subtotal,
            currency_code: cartState?.currency_code || "usd",
          })}
        </span>
        <div className="relative">
          <ShoppingBag className="w-4 h-4 text-white" />
          <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </div>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-[2px]"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[420px] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Cart"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Your Cart
          </h2>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Items Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cartState && cartState.items?.length ? (
            <>
              {/* Item List */}
              <div className="divide-y divide-gray-100">
                {cartState.items
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item) => {
                    const isUpdating = updatingLineId === item.id

                    return (
                      <div
                        key={item.id}
                        className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                        data-testid="cart-item"
                      >
                        {/* Trash Remove Button on Far Left */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isUpdating}
                          className="text-gray-400 hover:text-red-500 pt-1 transition-colors shrink-0"
                          title="Remove item"
                          aria-label={`Remove ${item.title}`}
                        >
                          {isUpdating ? (
                            <Spinner className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                        </button>

                        {/* Title, Price & Quantity Selector in Center */}
                        <div className="flex-1 min-w-0 pr-2">
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            onClick={close}
                            className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                          >
                            {item.title}
                          </LocalizedClientLink>

                          {item.variant_title && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {item.variant_title}
                            </p>
                          )}

                          <div className="text-sm font-bold text-gray-900 mt-1.5">
                            {convertToLocale({
                              amount: (item.unit_price ?? 0) * item.quantity,
                              currency_code: cartState.currency_code,
                            })}
                          </div>

                          {/* Stepper Pill: [ -  qty  + ] */}
                          <div className="inline-flex items-center border border-gray-200 rounded-lg mt-2 bg-white shadow-2xs">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-40 transition-colors text-xs font-bold rounded-l-lg"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-gray-800 min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-40 transition-colors text-xs font-bold rounded-r-lg"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Thumbnail on Far Right */}
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          onClick={close}
                          className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                      </div>
                    )
                  })}
              </div>

              {/* "Before you go" Dynamic Accessory Recommendations from Backend */}
              {accessories.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    Before you go
                  </h3>

                  {accessories.map((accessory) => {
                    const variant = accessory.variants?.[0]
                    const price = getPricesForVariant(variant)
                    const variantCalc = variant?.calculated_price as Record<string, unknown> | undefined
                    const formattedPrice =
                      price?.calculated_price ||
                      (variantCalc
                        ? convertToLocale({
                            amount:
                              (variantCalc.calculated_amount as number) ??
                              (variantCalc.amount as number) ??
                              0,
                            currency_code: cartState?.currency_code || "usd",
                          })
                        : "$ 17.39")
                    const isAdding = addingAccessoryId === accessory.id

                    return (
                      <div
                        key={accessory.id}
                        className="border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 bg-white hover:border-gray-300 transition-all shadow-2xs"
                      >
                        {/* Accessory Image */}
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                          {accessory.thumbnail ? (
                            <img
                              src={accessory.thumbnail}
                              alt={accessory.title || "Accessory"}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                              P
                            </div>
                          )}
                        </div>

                        {/* Accessory Details */}
                        <div className="flex-1 min-w-0">
                          <LocalizedClientLink
                            href={`/products/${accessory.handle}`}
                            onClick={close}
                            className="text-xs font-semibold text-gray-900 hover:text-primary transition-colors truncate block"
                          >
                            {accessory.title}
                          </LocalizedClientLink>
                          <p className="text-xs font-bold text-amber-600 mt-0.5">
                            {formattedPrice}
                          </p>
                        </div>

                        {/* Click to add CTA */}
                        <button
                          type="button"
                          onClick={() => handleAddAccessory(accessory)}
                          disabled={isAdding || !accessory.variants?.length}
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {isAdding && (
                            <Spinner className="w-3 h-3 animate-spin text-gray-500" />
                          )}
                          <span>Click to add</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Empty Cart View */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <LocalizedClientLink
                href="/store"
                onClick={close}
                className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors shadow-sm"
              >
                Start Shopping
              </LocalizedClientLink>
            </div>
          )}
        </div>

        {/* Drawer Footer with Totals & Actions */}
        {cartState && cartState.items?.length ? (
          <div className="border-t border-gray-200 px-6 py-5 bg-white space-y-3.5">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Subtotal (excl. shipping & taxes)</span>
              <span
                className="font-bold text-gray-900"
                data-testid="cart-subtotal"
                data-value={subtotal}
              >
                {convertToLocale({
                  amount: subtotal,
                  currency_code: cartState.currency_code,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Taxes</span>
              <span className="font-bold text-gray-900">
                {convertToLocale({
                  amount: taxes,
                  currency_code: cartState.currency_code,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-base text-gray-900">
                {convertToLocale({
                  amount: total,
                  currency_code: cartState.currency_code,
                })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <LocalizedClientLink
                href="/cart"
                onClick={close}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl border border-gray-200 text-sm flex items-center justify-center transition-colors shadow-2xs"
                data-testid="go-to-cart-button"
              >
                View basket
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/checkout"
                onClick={close}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Checkout</span>
              </LocalizedClientLink>
            </div>

            {/* Payment Method Badges Row */}
            <div className="pt-2 flex items-center justify-center">
              <Image
                src="/payment-methods.png"
                alt="Accepted Payment Methods - Visa, Mastercard, ZimSwitch, EcoCash, InnBucks"
                width={260}
                height={28}
                className="h-5 w-auto object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default CartDropdown
