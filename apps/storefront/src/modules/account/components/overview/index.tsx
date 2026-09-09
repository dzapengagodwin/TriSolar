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

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const totalOrders = orders?.length || 0
  const savedAddressesCount = customer?.addresses?.length || 0

  return (
    <div data-testid="overview-page-wrapper" className="space-y-8">
      {/* Welcome & Account Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Hello, {customer?.first_name || "there"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Welcome back. Manage your orders, delivery addresses, and profile details.
          </p>
        </div>
        <div className="text-xs text-gray-500 font-normal sm:text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Account Email
          </span>
          <span
            className="font-semibold text-gray-900 text-xs sm:text-sm"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </div>
      </div>

      {/* Modern 3-Column Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Orders Metric */}
        <LocalizedClientLink
          href="/account/orders"
          className="group bg-gray-50/60 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                {totalOrders}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {totalOrders === 1 ? "order" : "orders"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-2">
              <span>View order history</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>

        {/* Saved Addresses Metric */}
        <LocalizedClientLink
          href="/account/addresses"
          className="group bg-gray-50/60 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Saved Addresses
            </span>
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-x-2">
              <span
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none"
                data-testid="addresses-count"
                data-value={savedAddressesCount}
              >
                {savedAddressesCount}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {savedAddressesCount === 1 ? "address" : "addresses"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-2">
              <span>Manage addresses</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>

        {/* Profile Completion Metric */}
        <LocalizedClientLink
          href="/account/profile"
          className="group bg-gray-50/60 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Profile Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-x-2">
              <span
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none"
                data-testid="customer-profile-completion"
                data-value={profileCompletion}
              >
                {profileCompletion}%
              </span>
              <span className="text-xs text-gray-400 font-medium">
                complete
              </span>
            </div>
            <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-2">
              <span>Update details</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </LocalizedClientLink>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Recent Orders
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Your most recent purchases and their shipping statuses.
            </p>
          </div>
          {orders && orders.length > 0 && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View all orders ({orders.length})</span>
              <ChevronRight className="w-3 h-3" />
            </LocalizedClientLink>
          )}
        </div>

        <ul className="space-y-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => {
              const itemCount =
                order.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0

              return (
                <li
                  key={order.id}
                  data-testid="order-wrapper"
                  data-value={order.id}
                  className="group bg-white hover:bg-gray-50/50 border border-gray-100 hover:border-gray-200 rounded-2xl p-4 sm:p-5 transition-all duration-150"
                >
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1">
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
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Order
                          </span>
                          <span
                            className="text-gray-900 font-bold mt-0.5"
                            data-testid="order-id"
                            data-value={order.display_id}
                          >
                            #{order.display_id}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Date Placed
                          </span>
                          <span
                            className="text-gray-700 font-medium mt-0.5"
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
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Total ({itemCount} {itemCount === 1 ? "item" : "items"})
                          </span>
                          <span
                            className="text-gray-900 font-extrabold mt-0.5 text-xs sm:text-sm"
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        Completed
                      </span>
                      <span
                        className="w-8 h-8 bg-gray-50 group-hover:bg-primary group-hover:text-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-colors shadow-2xs shrink-0"
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
