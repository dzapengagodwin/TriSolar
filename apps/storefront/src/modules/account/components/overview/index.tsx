import {
  ChevronRight,
  MapPin,
  ShoppingBag,
  User,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"
import { getOrderStatusBadge, getStatusBadgeClass } from "@lib/util/order-status"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const totalOrders = orders?.length || 0
  const savedAddressesCount = customer?.addresses?.length || 0

  return (
    <div data-testid="overview-page-wrapper" className="space-y-6 sm:space-y-7">
      {/* Welcome & Account Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Hello, {customer?.first_name || "there"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Welcome back. Manage your orders, delivery addresses, and profile details.
          </p>
        </div>
        <div className="hidden sm:block text-xs text-gray-500 text-right">
          <span className="block text-xs text-gray-400">Account email</span>
          <span
            className="font-medium text-gray-800"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </div>
      </div>

      {/* Modern 3-Column Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Orders Metric */}
        <LocalizedClientLink
          href="/account/orders"
          className="group bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-x-1.5">
              <span className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">
                {totalOrders}
              </span>
              <span className="text-xs text-gray-400">
                {totalOrders === 1 ? "order" : "orders"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary mt-2">
              <span>View order history</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>

        {/* Saved Addresses Metric */}
        <LocalizedClientLink
          href="/account/addresses"
          className="group bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Saved Addresses
            </span>
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-x-1.5">
              <span
                className="text-2xl font-semibold text-gray-900 tracking-tight leading-none"
                data-testid="addresses-count"
                data-value={savedAddressesCount}
              >
                {savedAddressesCount}
              </span>
              <span className="text-xs text-gray-400">
                {savedAddressesCount === 1 ? "address" : "addresses"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary mt-2">
              <span>Manage addresses</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>

        {/* Account Profile Metric */}
        <LocalizedClientLink
          href="/account/profile"
          className="group bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Account Profile
            </span>
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 tracking-tight truncate">
                {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Personal Details"}
              </span>
              <span className="text-xs text-gray-400 truncate mt-0.5">
                {customer?.phone || customer?.email || "Manage details"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary mt-2">
              <span>Edit profile</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>
      </div>

      {/* Recent Orders Section */}
      {/* Recent Orders Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">
              Recent Orders
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Your most recent purchases and their shipping statuses.
            </p>
          </div>
          {orders && orders.length > 0 && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View all orders ({orders.length})</span>
              <ChevronRight className="w-3 h-3" />
            </LocalizedClientLink>
          )}
        </div>

        <ul className="space-y-2.5" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => {
              const itemCount =
                order.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0
              const statusBadge = getOrderStatusBadge(order)

              return (
                <li
                  key={order.id}
                  data-testid="order-wrapper"
                  data-value={order.id}
                  className="group bg-white hover:bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-xl p-3.5 sm:p-4 transition-all duration-150"
                >
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      {/* Product Thumbnail Previews */}
                      <div className="flex items-center -space-x-2 overflow-hidden shrink-0">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-gray-100 shrink-0 shadow-2xs relative"
                          >
                            <Thumbnail
                              thumbnail={item.thumbnail}
                              images={[]}
                              size="square"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-6 text-xs flex-1">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">
                            Order
                          </span>
                          <span
                            className="text-gray-900 font-medium mt-0.5"
                            data-testid="order-id"
                            data-value={order.display_id}
                          >
                            #{order.display_id}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">
                            Date placed
                          </span>
                          <span
                            className="text-gray-600 font-normal mt-0.5"
                            data-testid="order-created-date"
                          >
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex flex-col col-span-2 sm:col-span-1">
                          <span className="text-xs text-gray-400">
                            Total ({itemCount} {itemCount === 1 ? "item" : "items"})
                          </span>
                          <span
                            className="text-gray-900 font-semibold mt-0.5 text-xs sm:text-sm"
                            data-testid="order-amount"
                          >
                            {convertToLocale({
                              amount: order.total,
                              currency_code: order.currency_code,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                          statusBadge.variant
                        )}`}
                        data-testid="order-status-badge"
                      >
                        {statusBadge.label}
                      </span>
                      <span
                        className="w-7 h-7 bg-gray-50 group-hover:bg-primary group-hover:text-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-colors shadow-2xs shrink-0"
                        data-testid="open-order-button"
                        aria-hidden="true"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </LocalizedClientLink>
                </li>
              )
            })
          ) : (
            <div
              className="text-center py-10 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-y-3"
              data-testid="no-orders-message"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-2xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">
                  No orders placed yet
                </h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  Once you place an order, you will be able to track its progress, delivery status, and invoices here.
                </p>
              </div>
              <LocalizedClientLink
                href="/"
                className="mt-2 text-xs font-semibold px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl transition-all shadow-xs"
              >
                Explore Laptops & Gear
              </LocalizedClientLink>
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Overview
