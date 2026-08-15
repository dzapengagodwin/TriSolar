import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Support",
  description: "Get in touch with our customer support team for inquiries, orders, and tech assistance.",
}

export default async function ContactPage() {
  return (
    <div className="content-container py-12 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Contact Customer Support
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Have a question about your order, laptop specifications, or delivery? Our team is ready to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">Customer Care & Orders</h3>
            <p className="text-xs text-gray-600">Email: support@laptopzone.co.zw</p>
            <p className="text-xs text-gray-600">Phone: +263 78 151 0697</p>
            <p className="text-xs text-gray-500 pt-2">Monday – Friday: 8:00 AM – 5:00 PM (CAT)</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">Store & Pickup Location</h3>
            <p className="text-xs text-gray-600">1202 Knowe Norton</p>
            <p className="text-xs text-gray-600">Harare, Zimbabwe</p>
            <p className="text-xs text-gray-500 pt-2">Collection available during business hours</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF9F0D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#FF9F0D]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Message / Order Number</label>
              <textarea
                rows={4}
                placeholder="How can we help you today?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-900 focus:outline-none focus:border-[#FF9F0D]"
              ></textarea>
            </div>
            <button
              type="button"
              className="bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold text-xs px-8 py-3 rounded-full transition-colors shadow-md"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
