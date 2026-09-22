import { getOrSetCart, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import {
  isPickupShippingOption,
  isDeliveryShippingOption,
} from "@lib/util/fulfillment"
import CartTemplate from "@modules/cart/templates"
import { createNoIndexMetadata } from "@lib/seo/metadata"
import { Metadata } from "next"

export const metadata: Metadata = createNoIndexMetadata("Shopping Cart", "View and manage items in your shopping cart.")

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const cart = await getOrSetCart(countryCode).catch(async () => {
    return await retrieveCart().catch(() => null)
  })

  let isPickupOnly = false
  if (cart?.id) {
    const shippingMethods = await listCartShippingMethods(cart.id).catch(() => [])
    const pickupOptions = shippingMethods.filter(isPickupShippingOption)
    const deliveryOptions = shippingMethods.filter(isDeliveryShippingOption)
    isPickupOnly = pickupOptions.length > 0 && deliveryOptions.length === 0
  }

  const customer = await retrieveCustomer()

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      isPickupOnly={isPickupOnly}
    />
  )
}
