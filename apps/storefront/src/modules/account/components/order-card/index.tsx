import { Button } from "@modules/common/components/ui"
import { useMemo } from "react"
import { ChevronRight } from "@medusajs/icons"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getOrderStatusBadge, getStatusBadgeClass } from "@lib/util/order-status"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  const statusBadge = getOrderStatusBadge(order)

  return (
    <div
      className="bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-150 shadow-2xs flex flex-col gap-y-4"
      data-testid="order-card"
    >
      {/* Order Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
            Order #<span data-testid="order-display-id">{order.display_id}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span
            className="text-xs text-gray-500 font-normal"
            data-testid="order-created-at"
          >
            {new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
              statusBadge.variant
            )}`}
            data-testid="order-status-badge"
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Items Preview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/70 border border-gray-100/80"
              data-testid="order-item"
            >
              <div className="w-11 h-11 rounded-md overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                <Thumbnail
                  thumbnail={i.thumbnail}
                  images={[]}
                  size="square"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs font-medium text-gray-900 truncate"
                  data-testid="item-title"
                  title={i.title}
                >
                  {i.title}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                  Qty: <span data-testid="item-quantity">{i.quantity}</span>
                </span>
              </div>
            </div>
          )
        })}

        {numberOfProducts > 3 && (
          <div className="flex items-center justify-center p-2.5 rounded-lg bg-gray-50/50 border border-dashed border-gray-200 text-xs text-gray-500 font-medium">
            + {numberOfProducts - 3} more {numberOfProducts - 3 === 1 ? "item" : "items"}
          </div>
        )}
      </div>

      {/* Order Card Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-gray-400">
            Total:
          </span>
          <span
            className="text-sm sm:text-base font-semibold text-gray-900"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          <span className="text-xs text-gray-400 font-normal ml-1">
            ({numberOfLines} {numberOfLines === 1 ? "item" : "items"})
          </span>
        </div>

        <div>
          <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
            <Button
              data-testid="order-details-link"
              variant="secondary"
              className="text-xs font-medium py-1.5 px-3.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default OrderCard
