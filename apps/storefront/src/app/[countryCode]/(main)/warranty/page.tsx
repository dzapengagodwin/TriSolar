import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Warranty Policy | Laptopzone",
  description:
    "Explore Laptopzone's warranty coverage for new and certified pre-owned laptops, hardware defect protections, exclusions, and warranty claim procedures in Zimbabwe.",
    "Explore Laptopzone's warranty coverage for brand-new laptops and computers, hardware defect protections, exclusions, and warranty claim procedures in Zimbabwe.",
}

export default async function WarrantyPage() {
  return (
    <PolicyPageLayout
      title="Warranty Policy"
      subtitle="We stand behind our computers and electronic devices with genuine warranty protection and local repair support."
      activePolicy="warranty"
      lastUpdated="September 2026"
    >
      {/* Overview Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-gray-200 rounded-2xl overflow-hidden">
          <thead className="bg-gray-100/70 text-gray-800 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5 sm:p-4 border-b border-gray-200">Product Category</th>
              <th className="p-3.5 sm:p-4 border-b border-gray-200">Warranty Term</th>
              <th className="p-3.5 sm:p-4 border-b border-gray-200">Coverage Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="p-3.5 sm:p-4 font-semibold text-gray-900">Brand-New Laptops &amp; Desktops</td>
              <td className="p-3.5 sm:p-4 text-gray-600">12 to 24 Months</td>
              <td className="p-3.5 sm:p-4 text-gray-600">Official Manufacturer / Local Retailer Warranty</td>
              <td className="p-3.5 sm:p-4 text-gray-600">Official Manufacturer / Authorized Retailer Warranty</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3.5 sm:p-4 font-semibold text-gray-900">Certified Pre-Owned Laptops</td>
              <td className="p-3.5 sm:p-4 text-gray-600">6 Months</td>
              <td className="p-3.5 sm:p-4 text-gray-600">Laptopzone Certified Hardware Warranty</td>
            </tr>
            <tr>
              <td className="p-3.5 sm:p-4 font-semibold text-gray-900">Laptop Batteries &amp; AC Adapters</td>
              <td className="p-3.5 sm:p-4 text-gray-600">3 to 6 Months</td>
              <td className="p-3.5 sm:p-4 text-gray-600">6 to 12 Months</td>
              <td className="p-3.5 sm:p-4 text-gray-600">Consumable Component Limited Warranty</td>
            </tr>
            <tr className="bg-gray-50/50">
            <tr>
              <td className="p-3.5 sm:p-4 font-semibold text-gray-900">Peripherals &amp; Accessories</td>
              <td className="p-3.5 sm:p-4 text-gray-600">6 to 12 Months</td>
              <td className="p-3.5 sm:p-4 text-gray-600">Manufacturer Limited Warranty</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 1. What is Covered */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. What is Covered Under Warranty
        </h2>
        <p>
          Our warranty protects you against defects in materials and workmanship under normal, intended operating conditions. Covered components include:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>Motherboard and logic board circuitry failures</li>
          <li>Internal processor (CPU) and graphics chip (GPU) hardware faults</li>
          <li>Display panels exhibiting internal lines, flickering, or dead backlights (free from external glass impact)</li>
          <li>Factory-installed internal solid-state drives (SSD), hard drives (HDD), and RAM modules</li>
          <li>Internal cooling fans, charging port hardware, and integrated keyboard/trackpad hardware defects</li>
        </ul>
      </section>

      {/* 2. Warranty Exclusions */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Warranty Exclusions (What is NOT Covered)
        </h2>
        <div className="bg-red-50/60 border border-red-100 rounded-2xl p-5 space-y-2 text-red-950">
          <p className="text-xs font-bold uppercase tracking-wider text-red-800">
            Warranty will be immediately voided under the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-red-900/90 leading-relaxed">
            <li>
              <span className="font-bold">Physical &amp; Accidental Damage:</span> Cracked screens, broken hinges from drops or excessive force, dented or bent chassis, damaged USB ports.
            </li>
            <li>
              <span className="font-bold">Liquid Damage:</span> Any evidence of liquid spills, moisture corrosion, or immersion.
            </li>
            <li>
              <span className="font-bold">Electrical Surge &amp; Lightning:</span> Damage caused by power surges, unstable generators, lightning strikes, or use of substandard unapproved power adapters. (We strongly recommend using certified surge protectors).
            </li>
            <li>
              <span className="font-bold">Tampering &amp; Unauthorized Repairs:</span> Removal of warranty stickers, unauthorized opening of the casing, or repair attempts by third-party technicians.
            </li>
            <li>
              <span className="font-bold">Software Corruptions &amp; Viruses:</span> Operating system corruption, malware/ransomware infections, or corrupt custom BIOS/firmware flashes.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Batteries and Consumables */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. Battery &amp; Charger Terms
        </h2>
        <p>
          Rechargeable lithium-ion batteries naturally degrade over time depending on charge cycles and environmental temperatures.
        </p>
        <p>
          Laptop batteries are covered for a period of <span className="font-semibold text-gray-900">3 months (pre-owned)</span> or <span className="font-semibold text-gray-900">6 months (new)</span> against sudden complete cell failure or refusal to hold a charge. Natural capacity decrease over time (such as battery run-time decreasing by 15-20% after months of usage) is considered normal wear-and-tear and is not considered a defect.
          Laptop batteries and chargers are covered for a period of <span className="font-semibold text-gray-900">6 to 12 months</span> against sudden complete cell failure or refusal to hold a charge. Natural capacity decrease over time (such as battery run-time decreasing by 15-20% after months of usage) is considered normal wear-and-tear and is not considered a defect.
        </p>
      </section>

      {/* 4. Claim Procedure */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. How to Submit a Warranty Claim
        </h2>
        <div className="space-y-3 pt-1">
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Initiate Technical Support</p>
              <p className="text-xs text-gray-600">
                Contact our support team via WhatsApp (+263 77 295 3946) or email (
                <a href="mailto:support@laptopzone.co.zw" className="text-primary hover:underline">
                  support@laptopzone.co.zw
                </a>
                ) with your purchase invoice and serial number. Our technicians may provide initial troubleshooting to resolve common software issues remotely.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">
              2
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Device Booking</p>
              <p className="text-xs text-gray-600">
                Bring or courier the unit with its original charger to our technical center at 64 Ridgeway, Borrowdale, Harare. You will be issued a service booking receipt.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">Diagnostics &amp; Repair Turnaround</p>
              <p className="text-xs text-gray-600">
                Hardware diagnostics are typically completed within 2 to 4 business days. Warranty repairs are performed using genuine manufacturer parts. If a device cannot be repaired within 14 business days, Laptopzone will provide an equivalent replacement unit or store credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Data Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Customer Data Backup Disclaimer
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-gray-700">
          <p className="font-bold text-gray-900">
            IMPORTANT: Backup Your Files Prior to Service
          </p>
          <p className="leading-relaxed">
            During diagnostic testing and motherboard or drive replacements, data on the device may be erased or drives may be formatted. <span className="font-semibold text-gray-900">Laptopzone is not responsible for any loss of confidential, personal, or business data, photos, documents, or installed software programs</span>. Customers are solely responsible for creating complete external backups before handing in devices for warranty service.
          </p>
        </div>
      </section>

      {/* 6. Out of Warranty Services */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          6. Post-Warranty &amp; Accidental Damage Repairs
        </h2>
        <p>
          If your device has suffered accidental damage or is outside its warranty window, our certified technical workshop offers paid repair services, screen replacements, RAM/SSD upgrades, and battery replacements at competitive rates.
        </p>
        <p>
          Visit our{" "}
          <LocalizedClientLink href="/contact" className="text-primary font-semibold hover:underline">
            Contact Page
          </LocalizedClientLink>{" "}
          to request a repair quote.
        </p>
      </section>
    </PolicyPageLayout>
  )
}

