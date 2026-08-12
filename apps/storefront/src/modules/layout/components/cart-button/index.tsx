import { HttpTypes } from "@medusajs/types"
import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"

export default async function CartButton({
  cart: initialCart,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const cart = initialCart ?? (await retrieveCart().catch(() => null))

  return <CartDropdown cart={cart} />
}
