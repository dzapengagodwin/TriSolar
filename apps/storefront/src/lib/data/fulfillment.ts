"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag, getCartId } from "./cookies"


export const listCartShippingMethods = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(
      `/store/shipping-options`,
      {
        method: "GET",
        query: {
          cart_id: cartId,
          fields: "*service_zone.fulfillment_set",
        },
        headers,
        next,
        cache: "no-store",
      }
    )
    .then(({ shipping_options }) => shipping_options ?? [])
}

export const updateCheckoutAddressAndListShippingMethods = async ({
  cartId,
  email,
  address,
}: {
  cartId: string
  email?: string
  address: NonNullable<HttpTypes.StoreUpdateCart["shipping_address"]>
}) => {
  const activeCartId = await getCartId()
  if (!activeCartId || activeCartId !== cartId) {
    throw new Error("Your cart has changed. Refresh checkout and try again.")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }
  if (!("authorization" in headers)) {
    throw new Error("Please sign in to view checkout options.")
  }

  const customer = await sdk.client
    .fetch<{ customer: HttpTypes.StoreCustomer }>("/store/customers/me", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .catch(() => null)

  if (!customer?.customer) {
    throw new Error("Please sign in to view checkout options.")
  }

  await sdk.store.cart.update(
    cartId,
    {
      ...(email ? { email } : {}),
      shipping_address: address,
    },
    {},
    headers
  )

  const cartCacheTag = await getCacheTag("carts")
  if (cartCacheTag) {
    revalidateTag(cartCacheTag)
  }

  return listCartShippingMethods(cartId)
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((_e) => {
      return null
    })
}
