import { Metadata } from "next"

import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Laptopzone profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full space-y-6" data-testid="profile-page-wrapper">
      <div className="pb-5 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal details, contact preferences, and default billing address.
        </p>
      </div>
      <div className="flex flex-col gap-y-3 w-full">
        <ProfileName customer={customer} />
        <ProfileEmail customer={customer} />
        <ProfilePhone customer={customer} />
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}
