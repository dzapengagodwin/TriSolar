export default function TechxpertsBanner() {
  const services = [
    { title: "Corporate Procurement & Invoices", icon: "🏢" },
    { title: "RAM & SSD Performance Upgrades", icon: "⚡" },
    { title: "LaserJet Printer & Toner Supply", icon: "🖨️" },
    { title: "Software Licensing & OS Setup", icon: "🛡️" },
  ]

  return (
    <div className="bg-gradient-to-r from-laptopzone-dark to-laptopzone-navy text-white rounded-xl my-10 p-6 md:p-8 border-l-8 border-laptopzone-orange shadow-lg content-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-laptopzone-orange text-white text-[10px] font-black px-2.5 py-0.5 rounded tracking-widest uppercase">
              CORPORATE & IT SERVICES
            </span>
            <span className="text-xs text-gray-400 font-semibold">HARARE, ZIMBABWE</span>
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight text-white">
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
