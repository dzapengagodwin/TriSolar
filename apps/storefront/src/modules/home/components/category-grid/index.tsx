import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CategoryGrid() {
  const categories = [
    {
      title: "AI & Gaming Laptops",
      badge: "RTX & Core i7",
      badgeColor: "bg-laptopzone-orange",
      icon: "💻",
      subtext: "Asus ROG, MSI, HP Omen & Lenovo Legion",
      href: "/store",
    },
    {
      title: "Business Notebooks",
      badge: "In Stock Harare",
      badgeColor: "bg-laptopzone-navy",
      icon: "💼",
      subtext: "ThinkPad, EliteBook, Latitude & MacBook",
      href: "/store",
    },
    {
      title: "Home & Student PCs",
      badge: "Best Value",
      badgeColor: "bg-laptopzone-blue",
      icon: "🎓",
      subtext: "Affordable HP, Lenovo & Acer Laptops",
      href: "/store",
    },
    {
      title: "Printers & Toners",
      badge: "HP & Epson",
      badgeColor: "bg-laptopzone-navy",
      icon: "🖨️",
      subtext: "LaserJet, InkTank & Genuine Cartridges",
      href: "/store",
    },
    {
      title: "Desktops & All-in-Ones",
      badge: "Core i5 / i7",
      badgeColor: "bg-laptopzone-orange",
      icon: "🖥️",
      subtext: "Workstation Desktops & Monoblocks",
      href: "/store",
    },
    {
      title: "Storage & Accessories",
      badge: "SSDs & RAM",
      badgeColor: "bg-laptopzone-blue",
      icon: "🔌",
      subtext: "External HDDs, Laptop Bags & Chargers",
      href: "/store",
    },
  ]

  return (
    <div className="my-8">
      <div className="content-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-laptopzone-navy uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-laptopzone-orange rounded-sm inline-block"></span>
              Explore Hardware Categories
            </h2>
            <p className="text-xs text-gray-600">Zimbabwe's trusted IT inventory listed in USD ($)</p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="text-xs font-bold text-laptopzone-blue hover:text-laptopzone-blue-dark uppercase tracking-wider flex items-center gap-1"
          >
            View All Products →
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href={cat.href}
              className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-laptopzone-blue hover:shadow-md transition-all flex flex-col justify-between items-center text-center relative overflow-hidden"
            >
              <span
                className={`absolute top-2 right-2 text-[9px] font-black text-white px-1.5 py-0.5 rounded tracking-widest uppercase ${cat.badgeColor}`}
              >
                {cat.badge}
              </span>

              <div className="text-4xl my-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 font-medium">
                  {cat.subtext}
                </p>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
