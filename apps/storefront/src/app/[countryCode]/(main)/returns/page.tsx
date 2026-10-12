import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Laptopzone",
  description:
    "Review our 7-day defective replacement guarantee, 14-day return conditions, RMA procedure, and refund timelines for laptops and electronics.",
  alternates: { canonical: "/returns-and-refunds" },
}

export default async function ReturnsPage() {
  return (
    <PolicyPageLayout
      title="Returns & Refunds Policy"
      subtitle="We stand behind the quality and authenticity of every product we sell. Here is everything you need to know about returns, exchanges, and refunds."
      activePolicy="returns"
      lastUpdated="September 2026"
    >
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">7-Day DOA Replacement Guarantee</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            If your laptop or hardware presents a manufacturer defect within 7 days of delivery, we provide priority diagnostics and an immediate direct replacement.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-600 shrink-0" />
            <h3 className="font-bold text-gray-900 text-sm">14-Day Unopened Returns</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Changed your mind? Return any unopened, brand new item in its original sealed manufacturer packaging within 14 calendar days for a refund or store credit.
          </p>
        </div>
      </div>

      {/* 1. Defective Products */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. Defective or Damaged Products (Dead on Arrival)
        </h2>
        <p>
          We take immense pride in delivering 100% genuine, brand-new hardware. If your item arrives visibly damaged in transit or suffers from an out-of-the-box hardware failure (e.g., failure to power on, defective display, keyboard failure):
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            <span className="font-semibold text-gray-900">Notify us within 48 hours</span> of delivery if the item has transit damage or missing components.
          </li>
          <li>
            <span className="font-semibold text-gray-900">7-Day DOA window:</span> If a hardware defect occurs within 7 calendar days of receipt, Laptopzone will arrange expedited collection/drop-off, perform technical verification, and immediately supply a brand-new replacement unit.
          </li>
          <li>
            If an identical replacement model is unavailable in stock, you may choose an equivalent model, an upgrade (paying the difference), or a full refund.
          </li>
          <li>
            For hardware defects that arise after the initial 7-day DOA window, repairs or replacements are provided under our dedicated{" "}
            <LocalizedClientLink href="/warranty" className="text-primary font-semibold hover:underline">
              Warranty Policy
            </LocalizedClientLink>
            .
          </li>
        </ul>
      </section>

      {/* 2. Standard 14-Day Returns */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Standard 14-Day Returns (Unopened Merchandise)
        </h2>
        <p>
          You may request a return within <span className="font-semibold text-gray-900">14 calendar days</span> from the date of delivery or collection, provided the following conditions are met:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>The product must be completely unopened with all manufacturer factory tamper seals unbroken.</li>
          <li>All original retail packaging, protective films, documentation, accessories, power cords, and warranty cards must be intact.</li>
          <li>Original invoice or proof of purchase must accompany the return.</li>
        </ul>
      </section>

      {/* 3. Non-Returnable Items */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. Non-Returnable &amp; Non-Refundable Items
        </h2>
        <p>Due to licensing agreements, copyright laws, and hygiene standards, the following items cannot be returned or refunded:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-red-900">
            <span className="font-bold block text-red-950 mb-0.5">Software &amp; Digital Licenses</span>
            Opened software packaging, digital product keys (e.g., Windows OS, Microsoft 365, Antivirus licenses).
          </div>
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-red-900">
            <span className="font-bold block text-red-950 mb-0.5">Consumable Supplies</span>
            Opened ink cartridges, toner bottles, printheads, or thermal paste once seal is broken.
          </div>
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-red-900">
            <span className="font-bold block text-red-950 mb-0.5">In-Ear Audio Products</span>
            In-ear earphones and headsets where hygiene seals have been removed.
          </div>
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-red-900">
            <span className="font-bold block text-red-950 mb-0.5">Customer-Damaged Goods</span>
            Items with liquid spills, drop damage, burnt components due to power surges, or scratched casings.
          </div>
        </div>
      </section>

      {/* 4. Step-by-Step Return Process */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. How to Initiate a Return (RMA Process)
        </h2>
        <div className="space-y-3 pt-1">
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Submit Return Request</p>
              <p className="text-xs text-gray-600">
                Contact our support team via email (
                <a href="mailto:support@laptopzone.co.zw" className="text-primary hover:underline">
                  support@laptopzone.co.zw
                </a>
                ) or WhatsApp (071 821 1330) with your Order ID, product serial number, and reason for return. Attach photos or video if claiming a defect.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold shrink-0 mt-0.5">
              2
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">RMA Authorization</p>
              <p className="text-xs text-gray-600">
                Our support team will verify eligibility and issue a Return Merchandise Authorization (RMA) reference code with instructions.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Return Handover or Courier</p>
              <p className="text-xs text-gray-600">
                Drop off the securely packaged item at our service location (64 Ridgeway, Borrowdale, Harare) or dispatch via our authorized courier partner.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold shrink-0 mt-0.5">
              4
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Technical Inspection</p>
              <p className="text-xs text-gray-600">
                Our technicians will inspect the product within 2 to 4 business days to verify hardware condition, serial numbers, and reported issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Refund Method & Processing Time */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Refund Timelines &amp; Methods
        </h2>
        <p>
          Once your return is inspected and approved, your refund will be processed through the original payment method used during checkout:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            <span className="font-semibold text-gray-900">Card Payments (Visa / Mastercard):</span> Refund reflected on your card account within 5 to 10 banking days depending on your issuing bank.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Mobile Money (EcoCash / Pesepay):</span> Refund credited to your mobile wallet within 24 to 48 hours following approval.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Direct Bank Transfer (EFT):</span> Processed within 2 to 3 business days.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Store Credit:</span> Available immediately upon approval with no deductions.
          </li>
        </ul>
      </section>

      {/* 6. Return Shipping Fees */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          6. Return Shipping Costs
        </h2>
        <p>
          If the return is due to an error on our part (incorrect model dispatched) or a verified manufacturer defect within the 7-day DOA window, Laptopzone will cover 100% of the return courier fees.
        </p>
        <p>
          For change-of-mind returns on eligible unopened goods, the customer is responsible for courier return costs to our Harare technical facility.
        </p>
      </section>
    </PolicyPageLayout>
  )
}
