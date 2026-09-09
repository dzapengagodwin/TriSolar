import { Metadata } from "next"

import ProfileForm from "@modules/account/components/profile-form"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Laptopzone profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer().catch(() => null)
  const regions = await listRegions().catch(() => null)

  if (!customer || !regions) {
    return null
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
      <ProfileForm customer={customer} regions={regions} />
    </div>
  )
}
