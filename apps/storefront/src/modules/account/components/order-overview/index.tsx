"use client"

import { Button } from "@modules/common/components/ui"
import { ShoppingBag } from "@medusajs/icons"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center py-12 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl"
      data-testid="no-orders-container"
    >
      <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-2xs mb-3">
        <ShoppingBag className="w-5 h-5" />
      </div>
      <h2 className="text-base font-bold text-gray-900 tracking-tight">
        No orders found
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6">
        You haven&apos;t placed any orders yet. Discover our latest tech and upgrade your gear.
      </p>
      <div>
        <LocalizedClientLink href="/" passHref>
          <Button
            data-testid="continue-shopping-button"
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all shadow-xs"
          >
            Start shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
