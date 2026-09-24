import { HttpTypes } from "@medusajs/types"

export type OrderStatusBadge = {
  label: string
  variant: "success" | "warning" | "info" | "neutral" | "danger"
}

export function getOrderStatusBadge(order: HttpTypes.StoreOrder): OrderStatusBadge {
  if (order.status === "canceled") {
    return { label: "Canceled", variant: "danger" }
  }

  const fulfillment = order.fulfillment_status
  if (fulfillment === "delivered") {
    return { label: "Delivered", variant: "success" }
  }
  if (fulfillment === "shipped" || fulfillment === "partially_delivered") {
    return { label: "Shipped", variant: "info" }
  }
  if (fulfillment === "fulfilled" || fulfillment === "partially_shipped") {
    return { label: "Ready for Dispatch", variant: "info" }
  }

  const payment = order.payment_status
  if (payment === "captured") {
    return { label: "Processing", variant: "info" }
  }
  if (payment === "authorized") {
    return { label: "Paid", variant: "info" }
  }
  if (payment === "awaiting" || payment === "not_paid") {
    return { label: "Awaiting Payment", variant: "warning" }
  }
  if (payment === "refunded" || payment === "partially_refunded") {
    return { label: "Refunded", variant: "neutral" }
  }

  if (order.status === "completed") {
    return { label: "Completed", variant: "success" }
  }

  return { label: "Confirmed", variant: "neutral" }
}

export function getStatusBadgeClass(variant: OrderStatusBadge["variant"]): string {
  switch (variant) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/70"
    case "info":
      return "bg-sky-50 text-sky-700 border-sky-200/70"
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200/70"
    case "danger":
      return "bg-rose-50 text-rose-700 border-rose-200/70"
    case "neutral":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200/70"
  }
}

