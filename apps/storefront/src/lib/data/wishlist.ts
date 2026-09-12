"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { getAuthHeaders } from "./cookies"
import { retrieveCart } from "./cart"
import { HttpTypes } from "@medusajs/types"

const GUEST_WISHLIST_COOKIE_KEY = "_medusa_wishlist_id"

export type BackendWishlistItem = {
  id: string
  wishlist_id: string
  product_id?: string | null
  product_variant_id: string
  variant_id?: string
  created_at: string
  product_variant?: {
    id: string
    title?: string | null
    sku?: string | null
    product_id?: string | null
    calculated_price?: {
      calculated_amount?: number | null
      currency_code?: string | null
    }
    prices?: {
      amount?: number | null
      currency_code?: string | null
    }[]
    manage_inventory?: boolean | null
    inventory_quantity?: number | null
    allow_backorder?: boolean | null
    product?: {
      id: string
      title?: string | null
      handle?: string | null
      thumbnail?: string | null
      images?: { url?: string }[] | null
    } | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export type BackendWishlist = {
  id: string
  name?: string | null
  customer_id?: string | null
  sales_channel_id?: string | null
  items_count?: number
  items?: BackendWishlistItem[]
  [key: string]: unknown
}

// 1. Manage guest wishlist ID in cookies
export async function getWishlistIdCookie(): Promise<string | null> {
  try {
    const cookies = await nextCookies()
    return cookies.get(GUEST_WISHLIST_COOKIE_KEY)?.value || null
  } catch {
    return null
  }
}

export async function setWishlistIdCookie(id: string): Promise<void> {
  try {
    const cookies = await nextCookies()
    cookies.set(GUEST_WISHLIST_COOKIE_KEY, id, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    })
  } catch (e) {
    console.error("Failed to write wishlist cookie:", e)
  }
}

export async function deleteWishlistIdCookie(): Promise<void> {
  try {
    const cookies = await nextCookies()
    cookies.delete(GUEST_WISHLIST_COOKIE_KEY)
  } catch {}
}

// 2. Resolve sales_channel_id required by @alphabite/medusa-wishlist
async function getSalesChannelId(): Promise<string | undefined> {
  try {
    const cart = await retrieveCart()
    if (cart?.sales_channel_id) {
      return cart.sales_channel_id
    }

    // Ephemeral cart query to obtain the default sales channel for this publishable key
    const ephemeral = await sdk.client
      .fetch<HttpTypes.StoreCartResponse>("/store/carts", {
        method: "POST",
        body: {},
        cache: "no-store",
      })
      .catch(() => null)

    return ephemeral?.cart?.sales_channel_id
  } catch {
    return undefined
  }
}

// 3. Create a new wishlist in Medusa backend
export async function createWishlist(_countryCode?: string): Promise<BackendWishlist | null> {
  const authHeaders = await getAuthHeaders()
  const salesChannelId = await getSalesChannelId()

  if (!salesChannelId) {
    console.error("Could not resolve sales_channel_id for wishlist creation")
    return null
  }

  const res = await sdk.client
    .fetch<BackendWishlist>("/store/wishlists", {
      method: "POST",
      headers: authHeaders,
      body: { sales_channel_id: salesChannelId },
      cache: "no-store",
    })
    .catch((err) => {
      console.error("Failed to create wishlist in Medusa backend:", err)
      return null
    })

  if (res?.id && !authHeaders.authorization) {
    await setWishlistIdCookie(res.id)
  }

  return res
}

// 4. Retrieve and hydrate wishlist
export async function getWishlist(): Promise<BackendWishlist> {
  const authHeaders = await getAuthHeaders()

  let wishlist: BackendWishlist | null = null

  if (authHeaders.authorization) {
    // Authenticated user
    // If guest wishlist cookie exists, transfer it to customer first
    const guestWishlistId = await getWishlistIdCookie()
    if (guestWishlistId) {
      try {
        await sdk.client.fetch(`/store/wishlists/${guestWishlistId}/transfer`, {
          method: "POST",
          headers: authHeaders,
          cache: "no-store",
        })
        await deleteWishlistIdCookie()
      } catch (e) {
        console.warn("Could not transfer guest wishlist to customer:", e)
      }
    }

    const res = await sdk.client
      .fetch<{ data: BackendWishlist[] }>("/store/wishlists", {
        headers: authHeaders,
        cache: "no-store",
      })
      .catch(() => ({ data: [] }))

    if (res?.data && res.data.length > 0) {
      wishlist = res.data[0]
    }
  } else {
    // Guest user
    const guestWishlistId = await getWishlistIdCookie()
    if (guestWishlistId) {
      const res = await sdk.client
        .fetch<BackendWishlist>(`/store/wishlists/${guestWishlistId}`, {
          cache: "no-store",
        })
        .catch(async () => {
          await deleteWishlistIdCookie()
          return null
        })

      if (res?.id) {
        wishlist = res
      }
    }
  }

  if (!wishlist || !wishlist.id) {
    return {
      id: "wishlist_default",
      items: [],
    }
  }

  const rawItems = wishlist.items || []
  if (!rawItems.length) {
    return {
      id: wishlist.id,
      items: [],
    }
  }

  // Enrich items with calculated prices, thumbnails, and category metadata
  try {
    const productIds = Array.from(
      new Set(
        rawItems
          .map(
            (i) =>
              i.product_id ||
              i.product_variant?.product_id ||
              i.product_variant?.product?.id
          )
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    )

    let products: HttpTypes.StoreProduct[] = []
    if (productIds.length > 0) {
      const prodRes = await sdk.client
        .fetch<{ products: HttpTypes.StoreProduct[] }>("/store/products", {
          query: {
            id: productIds,
            limit: 100,
            fields:
              "*variants.calculated_price,*variants.prices,*variants.images,*images,*categories",
          },
          headers: authHeaders,
          cache: "no-store",
        })
        .catch(() => ({ products: [] }))
      products = prodRes.products || []
    }

    const hydratedItems: BackendWishlistItem[] = rawItems
      .map((item) => {
        const variantId = item.product_variant_id || item.product_variant?.id || ""
        const productId = item.product_id || item.product_variant?.product?.id

        let foundProduct: HttpTypes.StoreProduct | undefined
        let foundVariant: HttpTypes.StoreProductVariant | undefined

        for (const p of products) {
          const v = p.variants?.find((v) => v.id === variantId)
          if (v) {
            foundProduct = p
            foundVariant = v
            break
          }
        }

        if (!foundProduct || !foundVariant) {
          foundProduct = products.find((p) => p.id === productId)
          foundVariant = foundProduct?.variants?.[0]
        }

        const baseVariant = item.product_variant || { id: variantId }

        return {
          id: item.id,
          wishlist_id: item.wishlist_id,
          variant_id: variantId,
          product_variant_id: variantId,
          product_variant: {
            ...baseVariant,
            ...(foundVariant || {}),
            product: foundProduct || baseVariant.product || null,
          },
          created_at: item.created_at,
        }
      })
      .filter((i): i is BackendWishlistItem => Boolean(i))

    return {
      id: wishlist.id,
      items: hydratedItems,
    }
  } catch (err) {
    console.error("Error enriching wishlist items:", err)
    return {
      id: wishlist.id,
      items: rawItems.map((item) => ({
        id: item.id,
        wishlist_id: item.wishlist_id,
        variant_id: item.product_variant_id,
        product_variant_id: item.product_variant_id,
        product_variant: item.product_variant,
        created_at: item.created_at,
      })),
    }
  }
}

// 5. Add an item to the backend wishlist
export async function addToWishlist(
  variantId: string,
  countryCode?: string,
  _productId?: string
): Promise<{ success: boolean; wishlist?: BackendWishlist | null; error?: string }> {
  if (!variantId) {
    return { success: false, error: "Variant ID is required" }
  }

  const authHeaders = await getAuthHeaders()

  try {
    let wishlistId: string | null = null

    if (authHeaders.authorization) {
      const res = await sdk.client
        .fetch<{ data: BackendWishlist[] }>("/store/wishlists", {
          headers: authHeaders,
          cache: "no-store",
        })
        .catch(() => ({ data: [] }))

      if (res?.data && res.data.length > 0) {
        wishlistId = res.data[0].id
      } else {
        const created = await createWishlist(countryCode)
        wishlistId = created?.id || null
      }
    } else {
      const guestWlId = await getWishlistIdCookie()
      if (guestWlId) {
        const existing = await sdk.client
          .fetch<BackendWishlist>(`/store/wishlists/${guestWlId}`, { cache: "no-store" })
          .catch(() => null)
        if (existing?.id) {
          wishlistId = existing.id
        }
      }

      if (!wishlistId) {
        const created = await createWishlist(countryCode)
        wishlistId = created?.id || null
      }
    }

    if (!wishlistId) {
      return {
        success: false,
        error: "Could not retrieve or create a wishlist on the server",
      }
    }

    await sdk.client.fetch(`/store/wishlists/${wishlistId}/add-item`, {
      method: "POST",
      headers: authHeaders,
      body: { product_variant_id: variantId },
      cache: "no-store",
    })

    revalidateTag("wishlist")
    const updatedWishlist = await getWishlist()
    return { success: true, wishlist: updatedWishlist }
  } catch (err: unknown) {
    console.error("Failed to add item to wishlist:", err)
    const message =
      err instanceof Error ? err.message : "Failed to add item to wishlist"
    return { success: false, error: message }
  }
}

// 6. Remove an item from the backend wishlist
export async function removeFromWishlist(
  itemIdOrVariantId: string
): Promise<{ success: boolean; wishlist?: BackendWishlist | null; error?: string }> {
  if (!itemIdOrVariantId) {
    return { success: false, error: "Item ID is required" }
  }

  const authHeaders = await getAuthHeaders()

  try {
    const wishlist = await getWishlist()
    if (!wishlist || !wishlist.id || wishlist.id === "wishlist_default") {
      return { success: true, wishlist: null }
    }

    const targetItem = wishlist.items?.find(
      (i) =>
        i.id === itemIdOrVariantId ||
        i.variant_id === itemIdOrVariantId ||
        i.product_variant_id === itemIdOrVariantId ||
        i.product_variant?.id === itemIdOrVariantId
    )

    if (!targetItem) {
      return { success: true, wishlist }
    }

    await sdk.client.fetch(
      `/store/wishlists/${wishlist.id}/items/${targetItem.id}`,
      {
        method: "DELETE",
        headers: authHeaders,
        cache: "no-store",
      }
    )

    revalidateTag("wishlist")
    const updated = await getWishlist()
    return { success: true, wishlist: updated }
  } catch (err: unknown) {
    console.error("Failed to remove item from wishlist:", err)
    const message =
      err instanceof Error ? err.message : "Failed to remove from wishlist"
    return { success: false, error: message }
  }
}

// 7. Check if variant is in the wishlist
export async function isVariantInWishlist(variantId: string): Promise<boolean> {
  if (!variantId) {
    return false
  }

  try {
    const wishlist = await getWishlist()
    return (
      wishlist?.items?.some(
        (i) =>
          i.variant_id === variantId ||
          i.product_variant_id === variantId ||
          i.product_variant?.id === variantId
      ) ?? false
    )
  } catch {
    return false
  }
}
