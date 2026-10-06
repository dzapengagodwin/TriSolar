import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer Help | Laptopzone",
  description: "Get help with a Laptopzone order, delivery, returns, or account.",
  alternates: { canonical: "/customer-help" },
}

export default function CustomerHelpPage() {
  return (
    <main className="content-container py-12">
      <h1 className="text-3xl font-semibold text-gray-900">Customer help</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        For help with an order, include your order reference when contacting us. You can also review
        delivery and returns information or check orders linked to your account.
      </p>
      <nav aria-label="Customer help links" className="mt-6 flex flex-wrap gap-4">
        <LocalizedClientLink href="/contact-us" className="rounded-md bg-primary px-5 py-3 text-white">
          Contact us
        </LocalizedClientLink>
        <LocalizedClientLink href="/track-order" className="rounded-md border border-gray-300 px-5 py-3 text-gray-800">
          Track an order
        </LocalizedClientLink>
        <LocalizedClientLink href="/faq" className="rounded-md border border-gray-300 px-5 py-3 text-gray-800">
          FAQs
        </LocalizedClientLink>
      </nav>
    </main>
  )
}
