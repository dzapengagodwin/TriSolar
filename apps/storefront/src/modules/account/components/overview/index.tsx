import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper" className="space-y-8">
      {/* Welcome & Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight" data-testid="welcome-message" data-value={customer?.first_name}>
            Hello, {customer?.first_name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back to your Laptop Zone dashboard.
          </p>
        </div>
        <div className="text-xs text-gray-500 font-normal">
          Signed in as:{" "}
          <span
            className="font-bold text-gray-900"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[90px]">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Profile Completion
          </h3>
          <div className="flex items-baseline gap-x-1.5 mt-2">
            <span
              className="text-2xl font-black text-gray-900 leading-none"
              data-testid="customer-profile-completion"
              data-value={getProfileCompletion(customer)}
            >
              {getProfileCompletion(customer)}%
            </span>
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              Completed
            </span>
          </div>
        </div>

        {/* Addresses Card */}
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[90px]">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Saved Addresses
          </h3>
          <div className="flex items-baseline gap-x-1.5 mt-2">
            <span
              className="text-2xl font-black text-gray-900 leading-none"
              data-testid="addresses-count"
              data-value={customer?.addresses?.length || 0}
            >
              {customer?.addresses?.length || 0}
            </span>
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              Saved
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
          Recent orders
        </h3>
        <ul className="space-y-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => {
              return (
                <li
                  key={order.id}
                  data-testid="order-wrapper"
                  data-value={order.id}
                  className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-all duration-200"
                >
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="grid grid-cols-3 gap-4 text-xs flex-1">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[9px] text-gray-400 uppercase tracking-wider">
                          Date placed
                        </span>
                        <span className="text-gray-800 font-bold mt-0.5" data-testid="order-created-date">
                          {new Date(order.created_at).toDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[9px] text-gray-400 uppercase tracking-wider">
                          Order number
                        </span>
                        <span className="text-gray-800 font-bold mt-0.5" data-testid="order-id" data-value={order.display_id}>
                          #{order.display_id}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[9px] text-gray-400 uppercase tracking-wider">
                          Total amount
                        </span>
                        <span className="text-[#FF9F0D] font-extrabold mt-0.5" data-testid="order-amount">
                          {convertToLocale({
                            amount: order.total,
                            currency_code: order.currency_code,
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors"
                      data-testid="open-order-button"
                      aria-hidden="true"
                    >
                      <ChevronDown className="-rotate-90 w-3.5 h-3.5" />
                    </span>
                  </LocalizedClientLink>
                </li>
              )
            })
          ) : (
            <div className="text-center py-8 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs text-gray-500 font-medium">
              <span data-testid="no-orders-message">No recent orders found.</span>
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
