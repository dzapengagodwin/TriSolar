import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const orders = await listOrders().catch(() => null)

  if (!orders) {
    return null
  }

  return (
    <div className="w-full space-y-6" data-testid="orders-page-wrapper">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          Your Orders
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Review your previous purchases, check delivery status, and view invoices.
        </p>
      </div>
      <div className="space-y-6">
        <OrderOverview orders={orders} />
        <div className="pt-5 border-t border-gray-100">
          <TransferRequestForm />
        </div>
      </div>
    </div>
  )
}
