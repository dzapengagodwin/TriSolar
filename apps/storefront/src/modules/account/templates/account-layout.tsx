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
  return (
    <div className="flex-1 py-8 sm:py-16 bg-[#F9FAFB]" data-testid="account-page">
      <div className="content-container max-w-5xl mx-auto flex flex-col gap-y-8">
        {customer ? (
          /* Dashboard 2-column layout */
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 sm:gap-12 py-4">
              <aside className="border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                <AccountNav customer={customer} />
              </aside>
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          </div>
        ) : (
          /* Centered Auth Card for Login/Register */
          <div className="max-w-md mx-auto w-full bg-white border border-gray-100 rounded-3xl shadow-md p-8 sm:p-10 my-4">
            {children}
          </div>
        )}

        {/* Got Questions footer block */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Got questions?</h3>
            <p className="text-xs text-gray-500 font-normal">
              You can find frequently asked questions and answers on our customer service page.
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
