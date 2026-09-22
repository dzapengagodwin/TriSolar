import { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import {
  isPickupShippingOption,
  isDeliveryShippingOption,
} from "@lib/util/fulfillment"
import CartDropdown from "../cart-dropdown"

export default async function CartButton({
  cart: initialCart,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const cart = initialCart ?? (await retrieveCart().catch(() => null))
  let isPickupOnly = false

  if (cart?.id) {
    const shippingMethods = await listCartShippingMethods(cart.id).catch(() => [])
    const pickupOptions = shippingMethods.filter(isPickupShippingOption)
    const deliveryOptions = shippingMethods.filter(isDeliveryShippingOption)
    isPickupOnly = pickupOptions.length > 0 && deliveryOptions.length === 0
  }

  return <CartDropdown cart={cart} isPickupOnly={isPickupOnly} />
}
