import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PolicyType = "terms" | "privacy" | "returns" | "warranty" | "shipping" | "cookies"

interface PolicyPageLayoutProps {
  title: string
  subtitle: string
  activePolicy: PolicyType
  lastUpdated?: string
  children: React.ReactNode
}

const POLICIES: { id: PolicyType; label: string; href: string }[] = [
  { id: "terms", label: "Terms & Conditions", href: "/terms" },
  { id: "privacy", label: "Privacy Policy", href: "/privacy" },
  { id: "returns", label: "Returns & Refunds", href: "/returns" },
  { id: "warranty", label: "Warranty Policy", href: "/warranty" },
  { id: "shipping", label: "Delivery & Shipping", href: "/shipping" },
  { id: "cookies", label: "Cookie Policy", href: "/cookies" },
]

export default function PolicyPageLayout({
  title,
  subtitle,
  activePolicy,
  lastUpdated = "September 2026",
  children,
}: PolicyPageLayoutProps) {
  return (
    <div className="content-container py-10 sm:py-14 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
            Legal & Compliance
          </span>
          <span className="text-xs text-gray-400">
            Last Updated: {lastUpdated}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Policy Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 mb-8 border-b border-gray-200 no-scrollbar">
        {POLICIES.map((policy) => {
          const isActive = policy.id === activePolicy
          return (
            <LocalizedClientLink
              key={policy.id}
              href={policy.href}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              {policy.label}
            </LocalizedClientLink>
          )
        })}
      </div>

      {/* Main Document Body */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-12 shadow-sm space-y-10 text-gray-700 text-xs sm:text-sm leading-relaxed">
        {children}

        {/* Standard Contact / Support Help Box */}
        <div className="border-t border-gray-100 pt-8 mt-12 bg-gray-50/70 -mx-6 sm:-mx-12 -mb-6 sm:-mb-12 p-6 sm:p-10 rounded-b-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Have questions about our policies?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Our support team is available Monday to Friday from 8:00 AM to 5:00 PM CAT.
              </p>
            </div>
            <LocalizedClientLink
              href="/contact-us"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors shadow-sm self-start sm:self-auto"
            >
              Contact Support
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-gray-600">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200/70">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Email
              </span>
              <a
                href="mailto:support@laptopzone.co.zw"
                className="font-semibold text-gray-900 hover:text-primary transition-colors"
              >
                support@laptopzone.co.zw
              </a>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200/70">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Phone & WhatsApp
              </span>
              <a
                href="tel:+263772953946"
                className="font-semibold text-gray-900 hover:text-primary transition-colors"
              >
                +263 77 295 3946
              </a>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200/70">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Store Location
              </span>
              <span className="font-semibold text-gray-900">
                64 Ridgeway, Borrowdale, Harare
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

