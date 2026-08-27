"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { removeFromWishlist } from "@lib/data/wishlist"
import { addToCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { Trash, ShoppingBag } from "@medusajs/icons"
import { convertToLocale } from "@lib/util/money"

type WishlistItem = {
  id: string
  variant_id: string
  product_variant?: {
    id: string
    title?: string | null
    calculated_price?: {
      calculated_amount?: number | null
      currency_code?: string | null
    }
    prices?: {
      amount?: number | null
      currency_code?: string | null
    }[]
    product?: {
      id: string
      title?: string | null
      handle?: string | null
      thumbnail?: string | null
    }
  }
}

type WishlistTemplateProps = {
  wishlist?: {
    id?: string
    items?: WishlistItem[]
  } | null
}

export default function WishlistTemplate({ wishlist }: WishlistTemplateProps) {
  const [items, setItems] = useState<WishlistItem[]>(wishlist?.items || [])
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(new Set())
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "zw"

  const handleRemove = async (itemId: string) => {
    const nextRemoving = new Set(removingIds)
    nextRemoving.add(itemId)
    setRemovingIds(nextRemoving)

    try {
      const res = await removeFromWishlist(itemId)
      if (res.success) {
        setItems(items.filter((i) => i.id !== itemId))
      }
    } catch (err) {
      console.error("Error removing item", err)
    } finally {
      const nextRemoving = new Set(removingIds)
      nextRemoving.delete(itemId)
      setRemovingIds(nextRemoving)
    }
  }

  const handleAddToCart = async (itemId: string, variantId: string) => {
    const nextAdding = new Set(addingToCartIds)
    nextAdding.add(itemId)
    setAddingToCartIds(nextAdding)

    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      alert("Added to Cart successfully!")
    } catch (err: unknown) {
      console.error("Error adding to cart", err)
      const message = err instanceof Error ? err.message : "Failed to add to cart"
      alert(message)
    } finally {
      const nextAdding = new Set(addingToCartIds)
      nextAdding.delete(itemId)
      setAddingToCartIds(nextAdding)
    }
  }

  const getPriceString = (item: WishlistItem) => {
    const calc = item.product_variant?.calculated_price
    if (calc && typeof calc.calculated_amount === "number") {
      return convertToLocale({
        amount: calc.calculated_amount,
        currency_code: calc.currency_code || "usd",
      })
    }
    const price = item.product_variant?.prices?.[0]
    if (price && typeof price.amount === "number") {
      return convertToLocale({
        amount: price.amount,
        currency_code: price.currency_code || "usd",
      })
    }
    return "-"
  }

  return (
    <div className="content-container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Your Wishlist ❤️</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Saved items you want to keep an eye on.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4">
            <span className="text-4xl">💔</span>
            <h2 className="text-lg font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Explore our store to find laptops, computers, printers, and accessories to add to your list.
            </p>
            <LocalizedClientLink
              href="/store"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-bold text-xs transition-colors uppercase tracking-wider shadow-sm mt-2"
            >
              Shop Catalog
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const product = item.product_variant?.product
              const variant = item.product_variant
              const isRemoving = removingIds.has(item.id)
              const isAdding = addingToCartIds.has(item.id)

              if (!product || !variant) return null

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center justify-between hover:border-gray-200 transition-all"
                >
                  <div className="flex gap-4 items-center flex-1">
                    <LocalizedClientLink href={`/products/${product.handle}`} className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <Thumbnail thumbnail={product.thumbnail} size="square" />
                    </LocalizedClientLink>
                    <div className="flex flex-col gap-0.5">
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="text-sm font-extrabold text-gray-900 hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.title}
                      </LocalizedClientLink>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                        {variant.title !== "Default Variant" ? variant.title : "Standard"}
                      </span>
                      <span className="text-sm font-extrabold text-primary mt-1">
                        {getPriceString(item)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isAdding}
                      onClick={() => handleAddToCart(item.id, variant.id)}
                      className="bg-black hover:bg-gray-800 text-white font-bold text-xs p-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline">Add to Cart</span>
                    </button>
                    <button
                      disabled={isRemoving}
                      onClick={() => handleRemove(item.id)}
                      className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 hover:text-gray-900 p-3 rounded-full transition-all disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
