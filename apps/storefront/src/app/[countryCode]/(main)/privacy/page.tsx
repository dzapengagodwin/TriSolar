import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Privacy Policy | Laptopzone",
  description:
    "Learn how Laptopzone collects, uses, and safeguards your personal information in accordance with data privacy laws and cybersecurity standards.",
  alternates: { canonical: "/privacy-policy" },
}

export default async function PrivacyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is paramount. This policy explains what personal data we collect, why we collect it, and how we protect your information."
      activePolicy="privacy"
      lastUpdated="September 2026"
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. Introduction &amp; Scope
        </h2>
        <p>
          Laptopzone (<span className="font-semibold text-gray-900">&quot;we&quot;</span>,{" "}
          <span className="font-semibold text-gray-900">&quot;our&quot;</span>, or{" "}
          <span className="font-semibold text-gray-900">&quot;us&quot;</span>) is committed to protecting and respecting your personal privacy. This Privacy Policy details how we handle personal data collected when you visit our website (laptopzone.co.zw), purchase hardware or accessories, or communicate with our support team.
        </p>
        <p>
          We adhere to applicable data privacy legislation, including the Cyber and Data Protection Act of Zimbabwe [Chapter 12:07] and international data protection standards (GDPR-aligned privacy principles).
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Information We Collect
        </h2>
        <p>We may collect, use, and process the following categories of personal information:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">Identity &amp; Contact Information</h3>
            <p className="text-xs text-gray-600">
              Your first name, last name, phone number, email address, physical delivery address, city, and postal details.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">Order &amp; Transaction Details</h3>
            <p className="text-xs text-gray-600">
              Details of items purchased, serial numbers, payment reference identifiers, order value, and invoice records.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">Technical &amp; Device Information</h3>
            <p className="text-xs text-gray-600">
              Internet Protocol (IP) address, browser type and version, time zone setting, operating system, and session tokens.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">Support &amp; Communication Logs</h3>
            <p className="text-xs text-gray-600">
              Records of warranty claims, return requests, customer service inquiries via email, phone, or WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How We Use Your Information */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. How We Use Your Personal Data
        </h2>
        <p>We process your personal information strictly for legitimate commercial and legal purposes, including:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>Fulfilling, packaging, and dispatching your orders to your delivery address</li>
          <li>Communicating order status updates, dispatch tracking, and electronic receipts</li>
          <li>Administering hardware warranties, technical support, and return claims</li>
          <li>Detecting and preventing fraudulent transactions, cyber attacks, and unauthorized activities</li>
          <li>Complying with statutory accounting, tax, and consumer protection requirements</li>
          <li>Sending occasional promotional newsletters (only with your explicit opt-in consent; you may unsubscribe at any time)</li>
        </ul>
      </section>

      {/* 4. Payment Security */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. Payment Security &amp; PCI-DSS Compliance
        </h2>
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-2 text-amber-900">
          <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No Raw Card Data Is Ever Stored on Laptopzone Servers
          </h3>
          <p className="text-xs leading-relaxed text-amber-800">
            All credit/debit card transactions and mobile wallet authorizations are executed directly through certified, PCI-DSS Level 1 compliant payment gateways (including Pesepay and verified banking partners). We only receive encrypted transaction tokens and confirmation statuses. Your full 16-digit card number, CVV/CVC, and PIN numbers never touch our servers.
          </p>
        </div>
      </section>

      {/* 5. Sharing Your Information */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Third-Party Disclosures &amp; Service Providers
        </h2>
        <p>
          We do not sell, rent, or trade your personal data to third-party marketers or brokers. We share information only with trusted service partners strictly necessary to conduct our business:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li><span className="font-semibold text-gray-900">Courier &amp; Logistics Partners:</span> To deliver your orders to your doorstep across Harare and nationwide Zimbabwe.</li>
          <li><span className="font-semibold text-gray-900">Payment Processors:</span> To process and verify transactions securely.</li>
          <li><span className="font-semibold text-gray-900">Cloud Infrastructure:</span> Secure cloud hosting providers maintaining encrypted database storage and backups.</li>
          <li><span className="font-semibold text-gray-900">Regulatory Authorities:</span> Only when strictly required by lawful subpoena, court order, or national tax/statutory regulations.</li>
        </ul>
      </section>

      {/* 6. Data Retention */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          6. Data Retention
        </h2>
        <p>
          We retain your personal data for only as long as necessary to fulfill the purposes for which it was collected, including fulfilling purchase agreements, providing ongoing warranty services (typically up to 2 years after purchase), and satisfying statutory tax and accounting retention requirements.
        </p>
      </section>

      {/* 7. Cookies */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          7. Cookies &amp; Tracking Technologies
        </h2>
        <p>
          Our storefront utilizes cookies and local storage tokens to manage your shopping cart session, remember your regional settings, and ensure site security. For detailed information regarding the types of cookies we deploy and how to manage them, please consult our dedicated{" "}
          <LocalizedClientLink href="/cookies" className="text-primary font-semibold hover:underline">
            Cookie Policy
          </LocalizedClientLink>
          .
        </p>
      </section>

      {/* 8. Your Data Protection Rights */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          8. Your Data Protection Rights
        </h2>
        <p>Under applicable data privacy regulations, you have the following rights regarding your personal data:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs mb-1">Right of Access</h4>
            <p className="text-xs text-gray-600">Request a copy of the personal data we hold about you.</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs mb-1">Right to Rectification</h4>
            <p className="text-xs text-gray-600">Request correction of inaccurate or incomplete information.</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs mb-1">Right to Erasure</h4>
            <p className="text-xs text-gray-600">Request deletion of your account and personal data, subject to statutory retention limits.</p>
          </div>
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs mb-1">Right to Opt-Out</h4>
            <p className="text-xs text-gray-600">Withdraw consent for marketing communications at any time with one click.</p>
          </div>
        </div>
      </section>

      {/* 9. Data Security */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          9. Security Measures
        </h2>
        <p>
          We implement rigorous administrative, technical, and physical safeguards designed to prevent unauthorized access, alteration, or disclosure of your personal data. All network traffic between your browser and our servers is secured using modern TLS 1.3 encryption.
        </p>
      </section>

      {/* 10. Privacy Inquiries */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          10. Privacy Contact &amp; Inquiries
        </h2>
        <p>
          If you have any questions or wish to exercise your data rights, please contact our Data Protection representative at{" "}
          <a href="mailto:support@laptopzone.co.zw" className="text-primary font-semibold hover:underline">
            support@laptopzone.co.zw
          </a>{" "}
          or by visiting our support desk at 64 Ridgeway, Borrowdale, Harare, Zimbabwe.
        </p>
      </section>
    </PolicyPageLayout>
  )
}

