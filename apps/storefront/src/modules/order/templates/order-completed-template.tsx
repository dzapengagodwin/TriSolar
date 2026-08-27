import { convertToLocale } from "@lib/util/money"
import { paymentInfoMap } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"
import { cookies as nextCookies } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import Thumbnail from "@modules/products/components/thumbnail"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  const payment = order.payment_collections?.[0]?.payments?.[0]
  const shippingMethod = order.shipping_methods?.[0] as
    | { name?: string; total?: number }
    | undefined

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/60 py-8 sm:py-12">
      <div className="content-container max-w-3xl mx-auto px-4">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        {/* Success Header */}
        <div className="text-center mb-8" data-testid="order-complete-container">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-5">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Thank you!
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            Your order has been successfully placed.
          </p>
          <p className="text-xs text-gray-400">
            Confirmation sent to{" "}
            <span
              className="font-medium text-gray-600"
              data-testid="order-email"
            >
              {order.email}
            </span>
          </p>
        </div>

        {/* Order Number Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Order
            </span>
            <span
              className="text-sm font-bold text-gray-900"
              data-testid="order-id"
            >
              #{order.display_id}
            </span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400" data-testid="order-date">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              Order Summary
            </h2>
          </div>

          <div className="divide-y divide-gray-50" data-testid="products-table">
            {order.items
              ?.sort((a, b) =>
                (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <Thumbnail
                      thumbnail={item.thumbnail}
                      images={[]}
                      size="square"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product_title}
                    </p>
                    {item.variant_title && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variant_title}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {convertToLocale({
                      amount: (item.unit_price ?? 0) * item.quantity,
                      currency_code: order.currency_code,
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span
                  className="font-medium text-gray-700"
                  data-testid="cart-subtotal"
                >
                  {convertToLocale({
                    amount: order.item_subtotal ?? 0,
                    currency_code: order.currency_code,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span
                  className="font-medium text-gray-700"
                  data-testid="cart-shipping"
                >
                  {convertToLocale({
                    amount: order.shipping_subtotal ?? 0,
                    currency_code: order.currency_code,
                  })}
                </span>
              </div>
              {!!order.discount_total && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium" data-testid="cart-discount">
                    -{" "}
                    {convertToLocale({
                      amount: order.discount_total ?? 0,
                      currency_code: order.currency_code,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span
                  className="font-medium text-gray-700"
                  data-testid="cart-taxes"
                >
                  {convertToLocale({
                    amount: order.tax_total ?? 0,
                    currency_code: order.currency_code,
                  })}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between text-gray-900 text-base font-bold">
                <span>Total</span>
                <span data-testid="cart-total">
                  {convertToLocale({
                    amount: order.total ?? 0,
                    currency_code: order.currency_code,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Cards - 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Shipping Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              Shipping
            </h2>

            <div data-testid="shipping-address-summary">
              <p className="text-xs font-medium text-gray-700 mb-1">
                {order.shipping_address?.first_name}{" "}
                {order.shipping_address?.last_name}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {order.shipping_address?.address_1}
                {order.shipping_address?.address_2 &&
                  `, ${order.shipping_address.address_2}`}
                <br />
                {order.shipping_address?.city}
                {order.shipping_address?.postal_code &&
                  `, ${order.shipping_address.postal_code}`}
                <br />
                {order.shipping_address?.country_code?.toUpperCase()}
              </p>
            </div>

            {order.shipping_address?.phone && (
              <p
                className="text-xs text-gray-400 mt-3"
                data-testid="shipping-contact-summary"
              >
                {order.shipping_address.phone}
              </p>
            )}

            {shippingMethod?.name && (
              <div
                className="mt-4 pt-3 border-t border-gray-100"
                data-testid="shipping-method-summary"
              >
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {shippingMethod.name}
                  </span>{" "}
                  &middot;{" "}
                  {convertToLocale({
                    amount: shippingMethod.total ?? 0,
                    currency_code: order.currency_code,
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Payment Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              Payment
            </h2>

            {payment && (
              <div data-testid="payment-method">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100">
                    {paymentInfoMap[payment.provider_id]?.icon || (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {paymentInfoMap[payment.provider_id]?.title ||
                      payment.provider_id}
                  </span>
                </div>

                <p
                  className="text-xs text-gray-500"
                  data-testid="payment-amount"
                >
                  {convertToLocale({
                    amount: payment.amount,
                    currency_code: order.currency_code,
                  })}{" "}
                  paid on{" "}
                  {new Date(payment.created_at ?? "").toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <LocalizedClientLink
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-full text-sm transition-all shadow-md hover:shadow-lg"
          >
            Continue Shopping
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 px-8 rounded-full text-sm border border-gray-200 transition-all"
          >
            Need Help?
          </LocalizedClientLink>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-300 mt-8">
          A confirmation email has been sent. If you have questions, please{" "}
          <LocalizedClientLink
            href="/contact"
            className="underline hover:text-gray-500"
          >
            contact us
          </LocalizedClientLink>
          .
        </p>
      </div>
    </div>
  )
}
