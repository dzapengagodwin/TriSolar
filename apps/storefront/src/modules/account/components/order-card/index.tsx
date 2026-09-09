import { Button } from "@modules/common/components/ui"
import { useMemo } from "react"
import { ChevronRight } from "@medusajs/icons"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

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

  return (
    <div
      className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs flex flex-col gap-y-5"
      data-testid="order-card"
    >
      {/* Order Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
            Order #<span data-testid="order-display-id">{order.display_id}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span
            className="text-xs text-gray-500 font-medium"
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
            Confirmed
          </span>
        </div>
      </div>

      {/* Items Preview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70 border border-gray-100/80"
              data-testid="order-item"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                <Thumbnail
                  thumbnail={i.thumbnail}
                  images={[]}
                  size="square"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs font-semibold text-gray-900 truncate"
                  data-testid="item-title"
                  title={i.title}
                >
                  {i.title}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                  Qty: <span data-testid="item-quantity">{i.quantity}</span>
                </span>
              </div>
            </div>
          )
        })}

        {numberOfProducts > 3 && (
          <div className="flex items-center justify-center p-3 rounded-xl bg-gray-50/50 border border-dashed border-gray-200 text-xs text-gray-500 font-semibold">
            + {numberOfProducts - 3} more {numberOfProducts - 3 === 1 ? "item" : "items"}
          </div>
        )}
      </div>

      {/* Order Card Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Total:
          </span>
          <span
            className="text-sm sm:text-base font-extrabold text-gray-900"
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
              className="text-xs font-semibold py-2 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 transition-all flex items-center gap-1 cursor-pointer"
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
