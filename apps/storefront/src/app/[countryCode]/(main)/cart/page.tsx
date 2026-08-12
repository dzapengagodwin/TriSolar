import { getOrSetCart, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const cart = await getOrSetCart(countryCode).catch(async () => {
    return await retrieveCart().catch(() => null)
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
