import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy",
  description: "Learn about our warranty, replacement, and return policies for electronics and laptops.",
}

export default async function ReturnsPage() {
  return (
    <div className="content-container py-12 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Returns & Exchanges Policy
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We are committed to delivering genuine, quality hardware. Please review our guidelines on product returns, replacements, and warranty coverage.
          </p>
        </div>

        <div className="space-y-6 text-xs text-gray-600 leading-relaxed">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">7-Day Replacement Policy</h3>
            <p>
              If your laptop or accessory develops a factory defect within 7 days of delivery, you are eligible for an immediate inspection and direct replacement.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Eligibility for Returns</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Item must be in its original packaging with all included accessories and manuals.</li>
              <li>Proof of purchase (order confirmation email or receipt) must be presented.</li>
              <li>Software tampering, unauthorized hardware modifications, or physical liquid damage are not covered.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">How to Request a Return or Exchange</h3>
            <p>
              To initiate a return or exchange, please reach out to our team with your order reference number:
            </p>
            <div className="pt-2">
              <LocalizedClientLink
                href="/contact"
                className="inline-block bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors shadow-md"
              >
                Contact Support Team
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
