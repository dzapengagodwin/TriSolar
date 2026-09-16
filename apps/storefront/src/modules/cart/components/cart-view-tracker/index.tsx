"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  trackViewCart,
  transformLineItemToGA4Item,
} from "@lib/analytics/ecommerce"

export default function CartViewTracker({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
}) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0 || trackedRef.current) {
      return
    }

    const items = cart.items.map((item) => transformLineItemToGA4Item(item))
    const total = cart.total ?? 0
    const currency = cart.currency_code?.toUpperCase() || "USD"

    trackViewCart({
      items,
      total,
      currency,
    })

    trackedRef.current = true
  }, [cart])

  return null
}

