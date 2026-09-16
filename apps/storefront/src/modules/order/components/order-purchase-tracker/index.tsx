"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackPurchase } from "@lib/analytics/ecommerce"

export default function OrderPurchaseTracker({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!order || !order.id || trackedRef.current) {
      return
    }

    const storageKey = `ga4_purchase_tracked_${order.id}`
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        if (window.sessionStorage.getItem(storageKey) === "true") {
          return
        }
        window.sessionStorage.setItem(storageKey, "true")
      }
    } catch {
      // In case sessionStorage is blocked or unavailable
    }

    trackPurchase({ order })
    trackedRef.current = true
  }, [order])

  return null
}

