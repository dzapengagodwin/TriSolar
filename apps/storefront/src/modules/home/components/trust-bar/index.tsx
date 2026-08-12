import { CurrencyDollar, TruckFast } from "@medusajs/icons"

export default function TrustBar() {
  const items = [
    {
      icon: (
        <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center border border-gray-200 shrink-0">
          <CurrencyDollar className="w-6 h-6" />
        </div>
      ),
      title: "Money Back Guarantee",
      description: "30 days money back guarantee",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-md shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      ),
      title: "24/7 Customer Service",
      description: "Round the clock customer support",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
          <TruckFast className="w-6 h-6 text-amber-600" />
        </div>
      ),
      title: "Fast & Free Shipping",
      description: "Free shipping on orders over $100",
    },
  ]

  return (
    <div className="bg-white py-8 border-t border-gray-100 my-6">
      <div className="content-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-center sm:justify-start gap-x-4">
              {item.icon}
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
