import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getPageSeo } from "@lib/data/seo"
import { generatePageMetadata } from "@lib/seo/page"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const seo = await getPageSeo("shipping-policy")

  return generatePageMetadata(
    {
      path: "/shipping-policy",
    },
    params.countryCode,
    seo
  )
}

export default async function ShippingPage() {
  return (
    <PolicyPageLayout
      title="Delivery & Shipping Policy"
      subtitle="Fast, secure, and insured delivery of your tech orders across Harare and throughout Zimbabwe."
      activePolicy="shipping"
      lastUpdated="September 2026"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Harare Metropolitan
          </span>
          <p className="font-bold text-gray-900 text-sm">Same-Day / Next-Day</p>
          <p className="text-xs text-gray-500">
            Dedicated city couriers direct to your home or office address.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Nationwide Zimbabwe
          </span>
          <p className="font-bold text-gray-900 text-sm">24 to 48 Hours</p>
          <p className="text-xs text-gray-500">
            Reliable intercity courier delivery to all major cities and towns.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Store Collection
          </span>
          <p className="font-bold text-gray-900 text-sm">Free Pick-up</p>
          <p className="text-xs text-gray-500">
            Collect in-store at 64 Ridgeway, Borrowdale, Harare.
          </p>
        </div>
      </div>

      {/* 1. Processing & Dispatch */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. Order Processing &amp; Dispatch Cut-Off Times
        </h2>
        <p>
          Orders are processed Monday through Friday from 8:00 AM to 5:00 PM CAT.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            <span className="font-semibold text-gray-900">Same-Day Dispatch:</span> Orders placed and confirmed with successful payment before <span className="font-semibold text-gray-900">12:00 PM (CAT)</span> on business days are dispatched the same day.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Afternoon &amp; Weekend Orders:</span> Orders received after 12:00 PM, on Saturdays, Sundays, or public holidays are processed and dispatched on the next available business day.
          </li>
        </ul>
      </section>

      {/* 2. Delivery Options */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Delivery Methods &amp; Destinations
        </h2>
        <div className="space-y-4 pt-1">
          <div className="border border-gray-100 bg-gray-50/50 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              A. Harare Express Delivery (Local Courier)
            </h3>
            <p className="text-xs text-gray-600">
              For deliveries within Harare (including Borrowdale, Avondale, Mount Pleasant, CBD, Newlands, Highlands, and surrounding suburbs), our dedicated dispatch couriers provide fast delivery directly to your door within 2 to 24 hours.
            </p>
          </div>

          <div className="border border-gray-100 bg-gray-50/50 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              B. Nationwide Intercity Delivery (Major Zimbabwean Cities &amp; Towns)
            </h3>
            <p className="text-xs text-gray-600">
              We partner with trusted nationwide logistics carriers (including Swift, FedEx, and DHL local partners) to serve customers across:
            </p>
            <p className="text-xs font-semibold text-gray-800">
              Bulawayo, Mutare, Gweru, Masvingo, Victoria Falls, Kwekwe, Kadoma, Chinhoyi, Marondera, Bindura, and Hwange.
            </p>
            <p className="text-xs text-gray-600">
              Standard intercity transit time is typically 1 to 2 business days. For remote regional locations, delivery may take 2 to 3 business days.
            </p>
          </div>

          <div className="border border-gray-100 bg-gray-50/50 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              C. Free In-Store Pickup
            </h3>
            <p className="text-xs text-gray-600">
              You can choose to collect your items directly from our Harare retail hub at:
            </p>
            <p className="text-xs font-bold text-gray-900">
              64 Ridgeway, Borrowdale, Harare, Zimbabwe
            </p>
            <p className="text-xs text-gray-500">
              You will receive an SMS/Email notification when your order is packed and ready for collection. Please bring a valid form of ID and your Order ID.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Shipping Costs */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. Shipping Rates &amp; Free Shipping
        </h2>
        <p>
          Shipping charges are dynamically calculated at checkout based on the delivery destination, package weight, and selected speed.
        </p>
        <p>
          Special promotions or qualifying order values (e.g. Free Delivery banners) will be automatically applied at checkout when conditions are met. In-store pickup is always 100% free of charge.
        </p>
      </section>

      {/* 4. Tracking & Notifications */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. Order Tracking &amp; Delivery Updates
        </h2>
        <p>
          Once your package has been handed over to the courier, you will receive an electronic dispatch confirmation via Email and SMS/WhatsApp with:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Courier name and Waybill / Tracking Reference</li>
          <li>Estimated delivery timeframe</li>
          <li>Driver contact or courier tracking portal link</li>
        </ul>
        <p>
          You can also track your past orders at any time through your{" "}
          <LocalizedClientLink href="/account/orders" className="text-primary font-semibold hover:underline">
            Account Orders Dashboard
          </LocalizedClientLink>
          .
        </p>
      </section>

      {/* 5. Package Inspection */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Package Inspection on Arrival
        </h2>
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2 text-amber-900">
          <p className="font-bold text-amber-950">
            Important Delivery Checklist
          </p>
          <p className="leading-relaxed text-amber-900/90">
            Before signing the courier receipt or delivery manifest, please visually inspect the exterior box for signs of tampering, tears, water damage, or open tape. If you suspect any tampering, ask the courier to note the damage on the delivery manifest, or decline acceptance and contact our support team immediately at +263 77 295 3946.
          </p>
        </div>
      </section>

      {/* 6. Unsuccessful Deliveries */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          6. Failed Delivery Attempts &amp; Rescheduling
        </h2>
        <p>
          Our couriers will attempt delivery to the address provided during checkout. If no one is available to receive the shipment, the courier will make up to two contact attempts via phone. If a delivery cannot be completed due to incorrect address information or customer unavailability, packages may be returned to our central distribution facility and additional redelivery fees may apply.
        </p>
      </section>
    </PolicyPageLayout>
  )
}

