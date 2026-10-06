import { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import {
  isPickupShippingOption,
  isDeliveryShippingOption,
} from "@lib/util/fulfillment"
import CartDropdown from "../cart-dropdown"

export default async function CartButton({
  cart: initialCart,
  shippingOptions = [],
}: {
  cart?: HttpTypes.StoreCart | null
  shippingOptions?: HttpTypes.StoreCartShippingOption[]
}) {
  const cart = initialCart ?? (await retrieveCart().catch(() => null))
  let isPickupOnly = false

  if (cart?.id && shippingOptions.length) {
    const pickupOptions = shippingOptions.filter(isPickupShippingOption)
    const deliveryOptions = shippingOptions.filter(isDeliveryShippingOption)
    isPickupOnly = pickupOptions.length > 0 && deliveryOptions.length === 0
  }

  return <CartDropdown cart={cart} isPickupOnly={isPickupOnly} />
}
