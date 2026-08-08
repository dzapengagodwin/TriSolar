export default function TrustBar() {
  const items = [
    {
      icon: (
        <div className="w-12 h-12 bg-emerald-50 text-[#063A34] rounded-full flex items-center justify-center text-xl font-bold border border-emerald-100">
          💸
        </div>
      ),
      title: "Money Back Guarantee",
      description: "30 days money back guarantee",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-[#063A34] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
          🎧
        </div>
      ),
      title: "24/7 Customer Service",
      description: "Round the clock customer support",
    },
    {
      icon: (
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl font-bold border border-amber-100">
          ⚡
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
