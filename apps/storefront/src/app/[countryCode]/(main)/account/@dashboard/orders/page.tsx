import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full space-y-6" data-testid="orders-page-wrapper">
      <div className="pb-5 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Your Orders
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your previous purchases, check delivery status, and view invoices.
        </p>
      </div>
      <div className="space-y-8">
        <OrderOverview orders={orders} />
        <div className="pt-6 border-t border-gray-100">
          <TransferRequestForm />
        </div>
      </div>
    </div>
  )
}
