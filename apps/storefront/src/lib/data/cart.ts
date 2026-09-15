"use server"

import { isManual, isPesepay, isStripeLike } from "@lib/constants"
import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale } from "./locale-actions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  const cart = await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      next,
      cache: "no-store",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)

  if (
    cart &&
    (cart.completed_at ||
      (cart as unknown as Record<string, unknown>).status === "completed")
  ) {
    await removeCartId()
    return null
  }

  return cart
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (
    !cart ||
    cart.completed_at ||
    (cart as unknown as Record<string, unknown>).status === "completed"
  ) {
    await removeCartId()
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    return await retrieveCart(cart.id)
  }

  if (cart && (cart?.region_id !== region.id || cart?.currency_code !== region.currency_code)) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    return await retrieveCart(cart.id)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Retrieve the latest cart state to ensure the existing payment_collection is present
  const freshCart = (await retrieveCart(cart.id)) || cart

  try {
    const resp = await sdk.store.payment.initiatePaymentSession(
      freshCart,
      data,
      {},
      headers
    )
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return { success: true, ...resp }
  } catch (err: unknown) {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
    const message =
      errorObj?.response?.data?.message ||
      errorObj?.message ||
      "Could not initiate payment session with the selected provider"
    return { error: message }
  }
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(_code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(_code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  _codeToRemove: string,
  _giftCards: unknown[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "Failed to apply promotion"
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data: Record<string, unknown> = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    }

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data as HttpTypes.StoreUpdateCart)
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "Failed to update addresses"
  }

  const countryCode =
    formData.get("shipping_address.country_code")?.toString().toLowerCase() ||
    "zw"

  redirect(`/${countryCode}/checkout?step=delivery`)
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return { error: "No existing cart found when placing an order" }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  let cartRes
  try {
    cartRes = await sdk.store.cart.complete(id, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  } catch (err: unknown) {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
    const message =
      errorObj?.response?.data?.message ||
      errorObj?.message ||
      "Unable to complete order. Please try again."
    return { error: message }
  }

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase() ||
      cartRes.order.billing_address?.country_code?.toLowerCase() ||
      "zw"

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    await removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  if (cartRes?.type === "cart") {
    const cartError = (cartRes as { error?: { message?: string } }).error
    return {
      error:
        cartError?.message ||
        "Payment could not be completed. Please check your shipping and payment selections.",
    }
  }

  return { error: "Unable to complete order. Please try again." }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}

export type CheckoutAddressData = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  company?: string
  postal_code?: string
  city: string
  country_code: string
  province?: string
  phone: string
}

export type CheckoutFormData = {
  email: string
  shipping_address: CheckoutAddressData
  billing_address?: CheckoutAddressData
  same_as_billing?: boolean
  shipping_method_id: string
  payment_provider_id: string
}

export async function submitOnePageCheckout(data: CheckoutFormData) {
  const cartId = await getCartId()
  if (!cartId) {
    return { error: "No active cart found." }
  }

  const headers = await getAuthHeaders()

  try {
    const shippingAddress = {
      first_name: data.shipping_address.first_name.trim(),
      last_name: data.shipping_address.last_name.trim(),
      address_1: data.shipping_address.address_1.trim(),
      address_2: data.shipping_address.address_2?.trim() || "",
      company: data.shipping_address.company?.trim() || "",
      postal_code: data.shipping_address.postal_code?.trim() || "",
      city: data.shipping_address.city.trim(),
      country_code: data.shipping_address.country_code.trim().toLowerCase(),
      province: data.shipping_address.province?.trim() || "",
      phone: data.shipping_address.phone.trim(),
    }

    const billingAddress =
      data.same_as_billing !== false &&
      (!data.billing_address || !data.billing_address.address_1)
        ? shippingAddress
        : {
            first_name:
              data.billing_address?.first_name?.trim() ||
              shippingAddress.first_name,
            last_name:
              data.billing_address?.last_name?.trim() ||
              shippingAddress.last_name,
            address_1:
              data.billing_address?.address_1?.trim() ||
              shippingAddress.address_1,
            address_2: data.billing_address?.address_2?.trim() || "",
            company: data.billing_address?.company?.trim() || "",
            postal_code:
              data.billing_address?.postal_code?.trim() || "",
            city:
              data.billing_address?.city?.trim() || shippingAddress.city,
            country_code: (
              data.billing_address?.country_code?.trim() ||
              shippingAddress.country_code
            ).toLowerCase(),
            province: data.billing_address?.province?.trim() || "",
            phone:
              data.billing_address?.phone?.trim() || shippingAddress.phone,
          }

    // 1. Update cart with email & addresses
    await sdk.store.cart.update(
      cartId,
      {
        email: data.email.trim(),
        shipping_address: shippingAddress,
        billing_address: billingAddress,
      },
      {},
      headers
    )

    // 2. Set shipping method if provided
    if (data.shipping_method_id) {
      await sdk.store.cart.addShippingMethod(
        cartId,
        { option_id: data.shipping_method_id },
        {},
        headers
      )
    }

    // 3. Re-fetch fresh cart state
    const freshCart = await retrieveCart(cartId)
    if (!freshCart) {
      return { error: "Failed to retrieve cart details after saving addresses." }
    }

    // 4. Validate payment provider
    if (!data.payment_provider_id) {
      return { error: "Please select a payment method." }
    }

    // 5. Initiate payment session
    let paymentSessionRes: HttpTypes.StorePaymentCollectionResponse | undefined
    try {
      paymentSessionRes = await sdk.store.payment.initiatePaymentSession(
        freshCart,
        { provider_id: data.payment_provider_id },
        {},
        headers
      )
    } catch (payErr: unknown) {
      const errorObj = payErr as {
        response?: { data?: { message?: string } }
        message?: string
      }
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to initialize payment method."
      return { error: msg }
    }

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const countryCode =
      shippingAddress.country_code ||
      freshCart.shipping_address?.country_code?.toLowerCase() ||
      "zw"

    // 6. Provider-specific actions
    // A) Pesepay
    if (isPesepay(data.payment_provider_id)) {
      const sessions =
        paymentSessionRes?.payment_collection?.payment_sessions ||
        freshCart.payment_collection?.payment_sessions ||
        []
      const session =
        sessions.find((s) => isPesepay(s.provider_id)) || sessions[0]
      const sData = (session?.data || {}) as Record<string, unknown>
      const redirectUrl = (sData.redirectUrl ||
        sData.redirect_url ||
        sData.payment_url) as string | undefined

      if (redirectUrl) {
        return { success: true, redirectUrl }
      }
      return {
        error:
          "Pesepay payment gateway URL could not be generated. Please try again or choose another payment method.",
      }
    }

    // B) Manual / Pay on Collection
    if (
      isManual(data.payment_provider_id) ||
      data.payment_provider_id === "pp_system_default"
    ) {
      const completeRes = await sdk.store.cart.complete(cartId, {}, headers)
      if (completeRes?.type === "order" && completeRes.order) {
        const orderCacheTag = await getCacheTag("orders")
        revalidateTag(orderCacheTag)
        await removeCartId()
        return {
          success: true,
          orderId: completeRes.order.id,
          redirectUrl: `/${countryCode}/order/${completeRes.order.id}/confirmed`,
        }
      } else {
        const errorObj = completeRes as unknown as {
          error?: { message?: string }
        }
        const err =
          errorObj?.error?.message ||
          "Could not complete order with Pay on Collection. Please try again."
        return { error: err }
      }
    }

    // C) Stripe
    if (isStripeLike(data.payment_provider_id)) {
      const sessions =
        paymentSessionRes?.payment_collection?.payment_sessions || []
      const session = sessions.find((s) => isStripeLike(s.provider_id))
      return {
        success: true,
        requiresStripeConfirm: true,
        clientSecret: session?.data?.client_secret as string,
      }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error("submitOnePageCheckout error:", err)
    const errorObj = err as {
      response?: { data?: { message?: string } }
      message?: string
    }
    return {
      error:
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "An unexpected error occurred during checkout.",
    }
  }
}

