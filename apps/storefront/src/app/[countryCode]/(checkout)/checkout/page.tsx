import { getOrSetCart, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout | NexCart",
}

export default async function Checkout(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const cart = await getOrSetCart(countryCode).catch(async () => {
    return await retrieveCart().catch(() => null)
  })

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] medium:grid-cols-[1fr_400px] content-container gap-6 sm:gap-8 py-8 sm:py-12 items-start">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
