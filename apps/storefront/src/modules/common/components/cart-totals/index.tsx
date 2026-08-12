"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code = "usd",
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div className="flex flex-col gap-y-3 text-xs font-medium text-gray-600">
      <div className="flex items-center justify-between">
        <span>Subtotal (excl. shipping & taxes)</span>
        <span className="font-bold text-gray-900" data-testid="cart-subtotal" data-value={item_subtotal || 0}>
          {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span>Shipping</span>
        <span className="font-bold text-gray-900" data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
          {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
        </span>
      </div>

      {!!discount_subtotal && (
        <div className="flex items-center justify-between text-emerald-600 font-bold">
          <span>Discount</span>
          <span data-testid="cart-discount" data-value={discount_subtotal || 0}>
            - {convertToLocale({ amount: discount_subtotal ?? 0, currency_code })}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span>Taxes</span>
        <span className="font-bold text-gray-900" data-testid="cart-taxes" data-value={tax_total || 0}>
          {convertToLocale({ amount: tax_total ?? 0, currency_code })}
        </span>
      </div>

      <div className="h-px w-full bg-gray-100 my-2" />

      <div className="flex items-center justify-between text-black text-base font-black">
        <span>Total</span>
        <span data-testid="cart-total" data-value={total || 0} className="text-xl">
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
