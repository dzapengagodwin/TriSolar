import React from "react"

export default function TechxpertsBanner() {
  const services = [
    {
      title: "Corporate Procurement & Invoices",
      icon: (
        <svg className="w-6 h-6 text-laptopzone-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      ),
    },
    {
      title: "RAM & SSD Performance Upgrades",
      icon: (
        <svg className="w-6 h-6 text-laptopzone-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
    },
    {
      title: "LaserJet Printer & Toner Supply",
      icon: (
        <svg className="w-6 h-6 text-laptopzone-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
        </svg>
      ),
    },
    {
      title: "Software Licensing & OS Setup",
      icon: (
        <svg className="w-6 h-6 text-laptopzone-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="bg-gradient-to-r from-laptopzone-dark to-laptopzone-navy text-white rounded-xl my-10 p-6 md:p-8 border-l-8 border-laptopzone-orange shadow-lg content-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-laptopzone-orange text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase">
              CORPORATE & IT SERVICES
            </span>
            <span className="text-xs text-gray-400 font-semibold">HARARE, ZIMBABWE</span>
          </div>

          <h3 className="text-2xl font-bold uppercase tracking-tight text-white">
            CORPORATE IT SOLUTIONS & WHOLESALE
          </h3>

          <p className="text-xs text-gray-300 font-normal leading-relaxed">
            Need bulk laptop orders, business desktops, or printer consumables for your organization in Zimbabwe? Contact our sales team for fast USD tax invoices and local warranty.
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex flex-col items-center text-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl mb-1.5">{srv.icon}</span>
              <span className="text-[11px] font-bold text-gray-200 leading-tight">
                {srv.title}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
