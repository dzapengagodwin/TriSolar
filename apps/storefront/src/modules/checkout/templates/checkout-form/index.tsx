import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import OnePageCheckoutForm from "@modules/checkout/components/one-page-checkout-form"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const [shippingMethodsResult, paymentMethodsResult] = await Promise.all([
    listCartShippingMethods(cart.id),
    listCartPaymentMethods(cart.region?.id ?? ""),
  ])

  const shippingMethods = shippingMethodsResult ?? []
  const paymentMethods = paymentMethodsResult ?? []

  return (
    <OnePageCheckoutForm
      cart={cart}
      customer={customer}
      availableShippingMethods={shippingMethods}
      availablePaymentMethods={paymentMethods}
    />
  )
}

