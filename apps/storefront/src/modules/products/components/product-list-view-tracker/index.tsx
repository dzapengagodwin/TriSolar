"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  trackViewItemList,
  transformProductToGA4Item,
} from "@lib/analytics/ecommerce"

export default function ProductListViewTracker({
  products,
  listId,
  listName,
}: {
  products: HttpTypes.StoreProduct[]
  listId?: string
  listName?: string
}) {
  const trackedKeyRef = useRef<string>("")

  useEffect(() => {
    if (!products || products.length === 0) return

    const currentKey = `${listId || "all"}_${products.map((p) => p.id).join(",")}`
    if (trackedKeyRef.current === currentKey) return

    const items = products.map((product, index) => ({
      ...transformProductToGA4Item(product, null, 1),
      index: index + 1,
    }))

    trackViewItemList({
      items,
      listId,
      listName: listName || "Product Catalog",
    })

    trackedKeyRef.current = currentKey
  }, [products, listId, listName])

  return null
}

