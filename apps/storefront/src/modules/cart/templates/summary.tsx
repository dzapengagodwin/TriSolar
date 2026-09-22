"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { ArrowRight } from "@medusajs/icons"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  isPickup?: boolean
}

export function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, isPickup }: SummaryProps) => {
  return (
    <div className="flex flex-col gap-y-5">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
        Order Summary
      </h2>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} isPickup={isPickup} />
      <LocalizedClientLink
        href="/checkout"
        data-testid="checkout-button"
        className="w-full"
      >
        <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-sm py-3.5 px-6 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <span>Go to checkout</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
