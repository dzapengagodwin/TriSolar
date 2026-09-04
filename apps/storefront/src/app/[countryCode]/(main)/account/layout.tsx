import { retrieveCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"
import { createNoIndexMetadata } from "@lib/seo/metadata"
import { Metadata } from "next"

export const metadata: Metadata = createNoIndexMetadata(
  "Account",
  "Manage your Laptopzone customer account, orders, and profile."
)

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
    </AccountLayout>
  )
}
