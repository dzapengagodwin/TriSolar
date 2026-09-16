"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackViewItem } from "@lib/analytics/ecommerce"
import { GA_TRACKING_ID } from "@lib/analytics/gtag"

export default function ProductViewTracker({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region?: HttpTypes.StoreRegion | null
}) {
  const trackedProductIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!GA_TRACKING_ID || !product?.id) return

    // Prevent duplicate events on same product during re-renders or StrictMode
    if (trackedProductIdRef.current === product.id) {
      return
    }

    trackedProductIdRef.current = product.id
    trackViewItem({
      product,
      currency: region?.currency_code?.toUpperCase() || "USD",
    })
  }, [product, region])

  return null
}

