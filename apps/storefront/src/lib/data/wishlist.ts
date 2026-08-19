"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { getAuthHeaders } from "./cookies"
import { revalidateTag } from "next/cache"
import { getOrSetCart } from "./cart"

// 1. Get wishlist ID from cookie
export async function getWishlistIdCookie() {
  const cookies = await nextCookies()
  return cookies.get("_medusa_wishlist_id")?.value || null
}

// 2. Set wishlist ID in cookie
export async function setWishlistIdCookie(id: string) {
  const cookies = await nextCookies()
  cookies.set("_medusa_wishlist_id", id, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })
}

// 3. Delete wishlist ID cookie
export async function deleteWishlistIdCookie() {
  const cookies = await nextCookies()
  cookies.delete("_medusa_wishlist_id")
}

// 4. Retrieve current customer's wishlist
export async function getWishlist() {
  const authHeaders = await getAuthHeaders()
  
  // If user is authenticated, retrieve wishlist from backend
  if (authHeaders.authorization) {
    const res = await sdk.client.fetch<any>("/store/wishlists", {
      headers: authHeaders,
      cache: "no-store",
    })
    if (res.wishlists && res.wishlists.length > 0) {
      return res.wishlists[0]
    }
    return null
  }

  // If user is guest, try retrieving guest wishlist from cookie
  const guestWishlistId = await getWishlistIdCookie()
  if (guestWishlistId) {
    try {
      const res = await sdk.client.fetch<any>(`/store/wishlists/${guestWishlistId}`, {
        cache: "no-store",
      })
      return res.wishlist || null
    } catch (err: any) {
      console.error("Error fetching guest wishlist:", err)
      await deleteWishlistIdCookie()
      throw new Error(`Failed to fetch guest wishlist (${guestWishlistId}): ${err.message || err}`)
    }
  }

  return null
}

// 5. Create a new wishlist
export async function createWishlist(countryCode?: string) {
  const authHeaders = await getAuthHeaders()

  let salesChannelId: string | undefined = undefined
  if (countryCode) {
    try {
      const cart = await getOrSetCart(countryCode)
      salesChannelId = cart?.sales_channel_id
    } catch (e) {
      console.error("Failed to retrieve cart for sales channel:", e)
    }
  }

  const res = await sdk.client.fetch<any>("/store/wishlists", {
    method: "POST",
    headers: authHeaders,
    body: salesChannelId ? { sales_channel_id: salesChannelId } : {},
    cache: "no-store",
  })

  const wishlist = res.wishlist
  if (wishlist && !authHeaders.authorization) {
    await setWishlistIdCookie(wishlist.id)
  }
  
  return wishlist
}

// 6. Add item to wishlist
export async function addToWishlist(variantId: string, countryCode?: string) {
  let wishlist = null
  try {
    wishlist = await getWishlist()
    if (!wishlist) {
      wishlist = await createWishlist(countryCode)
    }
  } catch (err: any) {
    console.error("Failed to retrieve or create wishlist:", err)
    return { success: false, error: `Wishlist setup failed: ${err.message || err}` }
  }

  if (!wishlist) {
    return { success: false, error: "Could not retrieve or create wishlist (empty response)" }
  }

  const authHeaders = await getAuthHeaders()

  try {
    const res = await sdk.client.fetch<any>(`/store/wishlists/${wishlist.id}/add-item`, {
      method: "POST",
      headers: authHeaders,
      body: { variant_id: variantId },
      cache: "no-store",
    })
    
    revalidateTag("wishlist")
    return { success: true, wishlist: res.wishlist }
  } catch (err: any) {
    console.error("Error adding item to wishlist:", err)
    return { success: false, error: err.message || "Failed to add item" }
  }
}

// 8. Remove item from wishlist
export async function removeFromWishlist(itemId: string) {
  const wishlist = await getWishlist()
  if (!wishlist) {
    return { success: false, error: "No wishlist found" }
  }

  const authHeaders = await getAuthHeaders()

  try {
    const res = await sdk.client.fetch<any>(`/store/wishlists/${wishlist.id}/items/${itemId}`, {
      method: "DELETE",
      headers: authHeaders,
      cache: "no-store",
    })

    revalidateTag("wishlist")
    return { success: true, wishlist: res.wishlist }
  } catch (err: any) {
    console.error("Error removing item from wishlist:", err)
    return { success: false, error: err.message || "Failed to remove item" }
  }
}
