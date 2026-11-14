import { CurrencyDollar, TruckFast } from "@medusajs/icons"

export default function TrustBar() {
  const items = [
    {
      icon: (
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200/60 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
      ),
      title: "Official OEM Warranty",
      description: "100% genuine certified hardware",
    },
    {
      icon: (
        <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center border border-slate-800 shrink-0">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      ),
      title: "Pre-Sales Engineering",
      description: "Expert network & hardware support",
    },
    {
      icon: (
        <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center border border-emerald-200/60 shrink-0">
          <TruckFast className="w-5 h-5 text-emerald-600" />
        </div>
      ),
      title: "Fast Tracked Delivery",
      description: "Insured express shipping",
    },
    {
      icon: (
        <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center border border-indigo-200/60 shrink-0">
          <CurrencyDollar className="w-5 h-5 text-indigo-600" />
        </div>
      ),
      title: "B2B Volume Quotes",
      description: "Corporate terms & bulk pricing",
    },
  ]

  return (
    <div className="bg-slate-50 py-8 border-t border-slate-200/60 my-6">
      <div className="content-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
              {item.icon}
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 leading-snug truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
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
