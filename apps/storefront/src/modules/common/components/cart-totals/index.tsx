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

  const rawTaxTotal = Number(tax_total) || Number((totals as unknown as Record<string, unknown>)?.item_tax_total) || 0
  const grossAmount = Number(item_subtotal) || Number(total) || 0
  const calculatedTax =
    rawTaxTotal > 0
      ? rawTaxTotal
      : grossAmount > 0
      ? Math.round((grossAmount * (15.5 / 115.5)) * 100) / 100
      : 0

  const subtotalAmount =
    rawTaxTotal > 0
      ? Number(item_subtotal) || 0
      : grossAmount > 0
      ? Math.round((grossAmount - calculatedTax) * 100) / 100
      : 0

  return (
    <div className="flex flex-col gap-y-3 text-xs font-medium text-gray-600">
      <div className="flex items-center justify-between">
        <span>Subtotal (excl. shipping & taxes)</span>
        <span className="font-bold text-gray-900" data-testid="cart-subtotal" data-value={subtotalAmount}>
          {convertToLocale({ amount: subtotalAmount, currency_code })}
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
        <span className="font-bold text-gray-900" data-testid="cart-taxes" data-value={calculatedTax}>
          {convertToLocale({ amount: calculatedTax, currency_code })}
        </span>
      </div>

      <div className="h-px w-full bg-gray-100 my-2" />

      <div className="flex items-center justify-between text-gray-900 text-base font-bold">
        <span>Total</span>
        <span data-testid="cart-total" data-value={total || 0} className="text-xl">
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals
