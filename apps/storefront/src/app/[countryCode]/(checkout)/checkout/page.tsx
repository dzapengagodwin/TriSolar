import { getOrSetCart, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import {
  isPickupShippingOption,
  isDeliveryShippingOption,
} from "@lib/util/fulfillment"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Checkout | Laptopzone",
}

export default async function Checkout(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ step?: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const customer = await retrieveCustomer()
  if (!customer) {
    redirect("/account?return_to=%2Fcheckout")
  }

  const cart = await getOrSetCart(countryCode).catch(async () => {
    return await retrieveCart().catch(() => null)
  })

  if (!cart) {
    return notFound()
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const pickupOptions = shippingMethods.filter(isPickupShippingOption)
  const deliveryOptions = shippingMethods.filter(isDeliveryShippingOption)
  const isPickupOnly = pickupOptions.length > 0 && deliveryOptions.length === 0
  const isCartPickup =
    isPickupOnly ||
    cart.shipping_methods?.some((sm) =>
      pickupOptions.some((po) => po.id === sm.shipping_option_id)
    ) ||
    false

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] medium:grid-cols-[1fr_400px] content-container gap-6 sm:gap-8 py-8 sm:py-12 items-start">
      <Suspense
        fallback={
          <div className="w-full h-96 bg-gray-50 rounded-2xl animate-pulse" />
        }
      >
        <CheckoutForm
          cart={cart}
          customer={customer}
          initialShippingMethods={shippingMethods}
        />
      </Suspense>
      <CheckoutSummary cart={cart} isPickup={isCartPickup} />
    </div>
  )
}
