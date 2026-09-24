import React from "react"
import Image from "next/image"
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
  const fullName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.email?.split("@")[0] ||
      "Customer"
    : ""

  const avatarUrl =
    (typeof customer?.metadata?.avatar_url === "string" && customer.metadata.avatar_url.trim()) ||
    "/default-avatar.svg"

  return (
    <div className="flex-1 py-6 sm:py-10 bg-[#F9FAFB]" data-testid="account-page">
      <div className="content-container max-w-6xl mx-auto flex flex-col gap-y-6">
        {customer ? (
          <div className="flex flex-col gap-y-6">
            {/* Customer Profile Header Banner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:px-6 sm:py-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-x-4">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs shrink-0 flex items-center justify-center select-none">
                  <Image
                    src={avatarUrl}
                    alt={fullName || "Account Profile"}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                    {fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                    {customer.email}
                  </p>
                </div>
              </div>

              {customer.created_at && (
                <div className="text-xs text-gray-500 font-normal sm:text-right sm:border-l sm:border-gray-100 sm:pl-6">
                  <span className="block text-xs text-gray-400">
                    Member since
                  </span>
                  <span className="font-medium text-gray-700">
                    {new Date(customer.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Main Portal Dashboard Container */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden p-5 sm:p-7 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-6 md:gap-8">
                <aside className="md:border-r md:border-gray-100 md:pr-6 lg:pr-8">
                  <AccountNav customer={customer} />
                </aside>
                <main className="flex-1 min-w-0">{children}</main>
              </div>
            </div>
          </div>
        ) : (
          /* Centered Auth Card for Login/Register */
          <div className="max-w-md mx-auto w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 my-4">
            {children}
          </div>
        )}

        {/* Support & Assistance Strip */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-gray-900">
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
