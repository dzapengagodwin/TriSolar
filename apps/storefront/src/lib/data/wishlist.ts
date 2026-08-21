"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { getAuthHeaders } from "./cookies"
import { HttpTypes } from "@medusajs/types"

type WishlistItemRecord = {
  id: string
  variant_id: string
  product_id?: string
  created_at: string
}

const WISHLIST_COOKIE_KEY = "_medusa_wishlist_data"

// Read wishlist items from cookie
async function getStoredWishlistItems(): Promise<WishlistItemRecord[]> {
  try {
    const cookies = await nextCookies()
    const raw = cookies.get(WISHLIST_COOKIE_KEY)?.value
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Write wishlist items to cookie
async function setStoredWishlistItems(items: WishlistItemRecord[]) {
  try {
    const cookies = await nextCookies()
    cookies.set(WISHLIST_COOKIE_KEY, JSON.stringify(items), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    })
  } catch (e) {
    console.error("Failed to write wishlist cookie:", e)
  }
}

// Retrieve hydrated wishlist
export async function getWishlist() {
  const records = await getStoredWishlistItems()
  if (!records.length) {
    return {
      id: "wishlist_default",
      items: [],
    }
  }

  try {
    const authHeaders = await getAuthHeaders()

    // Fetch product details for stored wishlist items
    const productIds = Array.from(
      new Set(records.map((r) => r.product_id).filter(Boolean))
    ) as string[]

    const query: Record<string, string | number | string[]> = {
      limit: 50,
      fields:
        "*variants.calculated_price,*variants.prices,*variants.images,*images,*categories",
    }

    if (productIds.length > 0) {
      query.id = productIds
    }

    const { products } = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[] }>("/store/products", {
        query,
        headers: authHeaders,
        cache: "no-store",
      })
      .catch(() => ({ products: [] }))

    // Hydrate items with variant and product information
    const hydratedItems = records
      .map((record) => {
        let foundProduct: HttpTypes.StoreProduct | undefined
        let foundVariant: HttpTypes.StoreProductVariant | undefined

        for (const p of products) {
          const v = p.variants?.find((v) => v.id === record.variant_id)
          if (v) {
            foundProduct = p
            foundVariant = v
            break
          }
        }

        if (!foundProduct || !foundVariant) {
          // If not in matched products, check if product_id matched directly
          foundProduct = products.find((p) => p.id === record.product_id)
          foundVariant = foundProduct?.variants?.[0]
        }

        if (!foundProduct || !foundVariant) return null

        return {
          id: record.id,
          variant_id: record.variant_id,
          product_variant: {
            ...foundVariant,
            product: foundProduct,
          },
          created_at: record.created_at,
        }
      })
      .filter(Boolean)

    return {
      id: "wishlist_default",
      items: hydratedItems,
    }
  } catch (err) {
    console.error("Error hydrating wishlist:", err)
    return {
      id: "wishlist_default",
      items: [],
    }
  }
}

// Add item to wishlist
export async function addToWishlist(variantId: string, _countryCode?: string) {
  if (!variantId) {
    return { success: false, error: "Variant ID is required" }
  }

  try {
    const existing = await getStoredWishlistItems()

    // Check if already in wishlist
    if (existing.some((i) => i.variant_id === variantId)) {
      const wishlist = await getWishlist()
      return { success: true, wishlist }
    }

    const authHeaders = await getAuthHeaders()

    // Find product_id for this variant
    const { products } = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[] }>("/store/products", {
        query: {
          limit: 100,
          fields: "*variants",
        },
        headers: authHeaders,
        cache: "no-store",
      })
      .catch(() => ({ products: [] }))

    const matchedProduct = products.find((p) =>
      p.variants?.some((v) => v.id === variantId)
    )

    const newItem: WishlistItemRecord = {
      id: `wl_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      variant_id: variantId,
      product_id: matchedProduct?.id,
      created_at: new Date().toISOString(),
    }

    const updated = [newItem, ...existing]
    await setStoredWishlistItems(updated)

    revalidateTag("wishlist")
    const wishlist = await getWishlist()

    return { success: true, wishlist }
  } catch (err: unknown) {
    console.error("Failed to add to wishlist:", err)
    const message = err instanceof Error ? err.message : "Failed to add to wishlist"
    return { success: false, error: message }
  }
}

// Remove item from wishlist
export async function removeFromWishlist(itemIdOrVariantId: string) {
  if (!itemIdOrVariantId) {
    return { success: false, error: "Item ID is required" }
  }

  try {
    const existing = await getStoredWishlistItems()
    const updated = existing.filter(
      (item) =>
        item.id !== itemIdOrVariantId && item.variant_id !== itemIdOrVariantId
    )

    await setStoredWishlistItems(updated)
    revalidateTag("wishlist")

    const wishlist = await getWishlist()
    return { success: true, wishlist }
  } catch (err: unknown) {
    console.error("Failed to remove from wishlist:", err)
    const message = err instanceof Error ? err.message : "Failed to remove from wishlist"
    return {
      success: false,
      error: message,
    }
  }
}
