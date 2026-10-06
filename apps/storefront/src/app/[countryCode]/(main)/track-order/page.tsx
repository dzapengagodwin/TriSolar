import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Track Your Order | Laptopzone",
  description: "Find your Laptopzone order status or contact customer support for order assistance.",
  alternates: { canonical: "/track-order" },
}

export default function TrackOrderPage() {
  return (
    <main className="content-container py-12">
      <h1 className="text-3xl font-semibold text-gray-900">Track your order</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Sign in to review orders placed through your account. If you checked out without an account,
        contact our support team with your order reference for assistance.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <LocalizedClientLink href="/account" className="rounded-md bg-primary px-5 py-3 text-white">
          View my account
        </LocalizedClientLink>
        <LocalizedClientLink href="/customer-help" className="rounded-md border border-gray-300 px-5 py-3 text-gray-800">
          Get order help
        </LocalizedClientLink>
      </div>
    </main>
  )
}
