import { Metadata } from "next"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    return null
  }

  return (
    <div className="w-full space-y-6" data-testid="addresses-page-wrapper">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          Shipping Addresses
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Manage your saved delivery destinations for quick and seamless checkout.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
