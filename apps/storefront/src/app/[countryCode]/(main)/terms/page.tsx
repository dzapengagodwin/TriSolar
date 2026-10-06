import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Terms & Conditions | Laptopzone",
  description:
    "Official terms and conditions of sale and website usage for Laptopzone. Read our guidelines on ordering, payments, warranties, and consumer rights.",
  alternates: { canonical: "/terms-and-conditions" },
}

export default async function TermsPage() {
  return (
    <PolicyPageLayout
      title="Terms & Conditions"
      subtitle="These terms govern your access to and use of Laptopzone's website, online store, and purchase of tech products."
      activePolicy="terms"
      lastUpdated="September 2026"
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. Introduction & Acceptance
        </h2>
        <p>
          Welcome to Laptopzone (<span className="font-semibold text-gray-900">&quot;we&quot;</span>,{" "}
          <span className="font-semibold text-gray-900">&quot;our&quot;</span>, or{" "}
          <span className="font-semibold text-gray-900">&quot;us&quot;</span>). By browsing our website, registering an account, or placing an order, you agree to be bound by these Terms &amp; Conditions and our related policies, including our{" "}
          <LocalizedClientLink href="/privacy-policy" className="text-primary font-semibold hover:underline">
            Privacy Policy
          </LocalizedClientLink>
          ,{" "}
          <LocalizedClientLink href="/returns-and-refunds" className="text-primary font-semibold hover:underline">
            Returns &amp; Refunds Policy
          </LocalizedClientLink>
          , and{" "}
          <LocalizedClientLink href="/warranty" className="text-primary font-semibold hover:underline">
            Warranty Policy
          </LocalizedClientLink>
          .
        </p>
        <p>
          If you do not agree to these terms, please do not use our website or purchase products from us.
        </p>
      </section>

      {/* 2. Company Information */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Company Information
        </h2>
        <p>
          Laptopzone operates an online retail store and technical support center based in Harare, Zimbabwe.
        </p>
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1 text-xs">
          <p><span className="font-bold text-gray-900">Physical Address:</span> 64 Ridgeway, Borrowdale, Harare, Zimbabwe</p>
          <p><span className="font-bold text-gray-900">Customer Support:</span> support@laptopzone.co.zw | +263 77 295 3946 / +263 8612 600 600</p>
          <p><span className="font-bold text-gray-900">Website:</span> laptopzone.co.zw</p>
        </div>
      </section>

      {/* 3. Account Registration & Security */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. Account Registration &amp; Security
        </h2>
        <p>
          When you create an account on Laptopzone, you agree to provide accurate, complete, and current information. You are responsible for safeguarding your login credentials and for all activities that occur under your account.
        </p>
        <p>
          You must promptly notify Laptopzone if you suspect any unauthorized access to or compromise of your account. We reserve the right to suspend or terminate accounts that provide false information or violate our policies.
        </p>
      </section>

      {/* 4. Products, Specifications & Accuracy */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. Products, Specifications &amp; Stock Availability
        </h2>
        <p>
          We strive to provide accurate descriptions, technical specifications, and imagery for all laptops, desktop computers, accessories, and components listed on our catalog. However:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            Technical specifications (RAM, SSD capacities, CPU models, display resolutions, and ports) are sourced from official manufacturer documentation. Small variations may occur depending on hardware revisions.
          </li>
          <li>
            Product images are for illustrative purposes. Actual product finishes, keyboard layouts (e.g., US International vs UK), or packaging may differ slightly.
          </li>
          <li>
            All items are subject to stock availability. In the rare event that an item is ordered but found to be out of stock, we will contact you immediately to offer an equivalent upgrade, backorder timeline, or a prompt refund.
          </li>
        </ul>
      </section>

      {/* 5. Pricing, Currency & Payments */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Pricing, Currency &amp; Payment Terms
        </h2>
        <p>
          Prices listed on the website are denominated in United States Dollars (<span className="font-semibold text-gray-900">USD</span>) unless explicitly indicated otherwise.
        </p>
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">Accepted Payment Methods:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Visa &amp; Mastercard (processed securely via PCI-DSS compliant payment gateways)</li>
            <li>Mobile Money (EcoCash USD and local options via integrated gateways such as Pesepay)</li>
            <li>Direct Bank Transfer / Electronic Funds Transfer (orders dispatched upon confirmed clearance)</li>
            <li>Cash on Collection / Point-of-Sale swipe at our Borrowdale store</li>
          </ul>
        </div>
        <p>
          While we make every effort to prevent pricing errors, if a product is mistakenly listed at an incorrect price due to typographical or technical error, Laptopzone reserves the right to cancel the order and issue a full refund prior to dispatch.
        </p>
      </section>

      {/* 6. Order Confirmation & Acceptance */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          6. Order Placement &amp; Acceptance
        </h2>
        <p>
          Receipt of an electronic order confirmation does not signify our final acceptance of your order. Laptopzone reserves the right to accept, decline, or limit order quantities at any time after receipt of your order for reasons including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Suspected fraudulent transaction or failed identity verification</li>
          <li>Inability to obtain authorization for payment</li>
          <li>Inability to fulfill delivery to the requested address</li>
        </ul>
      </section>

      {/* 7. Shipping, Delivery & Title */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          7. Shipping, Delivery &amp; Risk of Loss
        </h2>
        <p>
          Delivery timelines and charges are calculated at checkout based on your selected delivery method and location. Risk of loss and title for all products pass to you upon delivery to your designated delivery address or upon physical pickup from our store.
        </p>
        <p>
          Please review our detailed{" "}
          <LocalizedClientLink href="/delivery-terms" className="text-primary font-semibold hover:underline">
            Delivery &amp; Shipping Policy
          </LocalizedClientLink>{" "}
          for full details on delivery times, courier coverage across Zimbabwe, and package inspection requirements.
        </p>
      </section>

      {/* 8. Warranty, Returns & Consumer Rights */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          8. Warranty, Returns &amp; Consumer Rights
        </h2>
        <p>
          Every laptop and hardware product sold by Laptopzone comes with warranty protection against manufacturer defects. In addition, we maintain clear guidelines for returns, replacements, and refunds:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>
            Our return conditions and step-by-step return instructions are set out in our{" "}
            <LocalizedClientLink href="/returns-and-refunds" className="text-primary font-semibold hover:underline">
              Returns &amp; Refunds Policy
            </LocalizedClientLink>
            .
          </li>
          <li>
            Hardware warranty terms, coverage scopes, and exclusions are set out in our{" "}
            <LocalizedClientLink href="/warranty" className="text-primary font-semibold hover:underline">
              Warranty Policy
            </LocalizedClientLink>
            .
          </li>
        </ul>
      </section>

      {/* 9. Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          9. Intellectual Property
        </h2>
        <p>
          All content included on this website—such as text, graphics, logos, button icons, software, and compilation of catalog data—is the property of Laptopzone or its content suppliers and protected by copyright and intellectual property laws.
        </p>
        <p>
          All manufacturer brand names, product logos, and registered trademarks (including HP, Dell, Lenovo, Apple, ASUS, Acer, Microsoft, Intel, AMD, and NVIDIA) belong solely to their respective trademark owners and are referenced on this site solely for compatibility, authenticity, and identification purposes.
        </p>
      </section>

      {/* 10. Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          10. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by applicable law, Laptopzone shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, loss of data, or business interruption arising out of or related to the use of or inability to use our products or services.
        </p>
        <p>
          In all circumstances, our total aggregate liability to you for any claim arising out of your purchase of a product shall be strictly limited to the actual purchase price paid by you for that specific product.
        </p>
      </section>

      {/* 11. Governing Law */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          11. Governing Law &amp; Jurisdiction
        </h2>
        <p>
          These Terms &amp; Conditions and any separate agreements whereby we provide you goods or services shall be governed by and construed in accordance with the laws of the Republic of Zimbabwe. You agree to submit to the exclusive jurisdiction of the competent courts in Harare, Zimbabwe.
        </p>
      </section>

      {/* 12. Changes to Terms */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          12. Changes to These Terms
        </h2>
        <p>
          We reserve the right to modify these Terms &amp; Conditions at any time. Any changes will become effective immediately upon posting to this page with an updated &quot;Last Updated&quot; date. Your continued use of the website following any modifications signifies your acceptance of the revised terms.
        </p>
      </section>
    </PolicyPageLayout>
  )
}

