import React from "react"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  const initials = customer
    ? [customer.first_name, customer.last_name]
        .filter(Boolean)
        .map((n) => n?.[0]?.toUpperCase())
        .join("") || (customer.email ? customer.email[0].toUpperCase() : "U")
    : "U"

  const fullName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.email?.split("@")[0] ||
      "Customer"
    : ""

  return (
    <div className="flex-1 py-6 sm:py-10 bg-[#F9FAFB]" data-testid="account-page">
      <div className="content-container max-w-6xl mx-auto flex flex-col gap-y-6">
        {customer ? (
          <div className="flex flex-col gap-y-6">
            {/* Customer Profile Header Banner */}
            <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-900 text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-xs select-none">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-2">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      {fullName}
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Member
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 text-xs text-gray-500 sm:border-l sm:border-gray-100 sm:pl-6">
                <span className="inline-flex sm:hidden items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Member
                </span>
                <span className="text-[11px] text-gray-400">
                  Customer ID: #{customer.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Main Portal Dashboard Container */}
            <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden p-5 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-6 md:gap-10">
                <aside className="md:border-r md:border-gray-100 md:pr-6 lg:pr-8">
                  <AccountNav customer={customer} />
                </aside>
                <main className="flex-1 min-w-0">{children}</main>
              </div>
            </div>
          </div>
        ) : (
          /* Centered Auth Card for Login/Register */
          <div className="max-w-md mx-auto w-full bg-white border border-gray-100 rounded-3xl shadow-md p-8 sm:p-10 my-4">
            {children}
          </div>
        )}

        {/* Minimalist Help Strip */}
        <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Need assistance?
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Browse order FAQs, return guidelines, and contact support on our help center.
            </p>
          </div>
          <UnderlineLink href="/customer-service">
            Customer Service
          </UnderlineLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
