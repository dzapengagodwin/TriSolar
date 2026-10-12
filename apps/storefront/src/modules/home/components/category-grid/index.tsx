import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

export default function CategoryGrid() {
  const categories = [
    {
      title: "AI & Gaming Laptops",
      badge: "RTX & Core i7",
      badgeColor: "bg-laptopzone-orange",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3m6 6h6m-6 3h3" />
        </svg>
      ),
      subtext: "Asus ROG, MSI, HP Omen & Lenovo Legion",
      href: "/shop",
    },
    {
      title: "Business Notebooks",
      badge: "In Stock Harare",
      badgeColor: "bg-laptopzone-navy",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
        </svg>
      ),
      subtext: "ThinkPad, EliteBook, Latitude & MacBook",
      href: "/shop",
    },
    {
      title: "Home & Student PCs",
      badge: "Best Value",
      badgeColor: "bg-laptopzone-blue",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c.22 0 .438-.007.653-.021" />
        </svg>
      ),
      subtext: "Affordable HP, Lenovo & Acer Laptops",
      href: "/shop",
    },
    {
      title: "Printers & Toners",
      badge: "HP & Epson",
      badgeColor: "bg-laptopzone-navy",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
        </svg>
      ),
      subtext: "LaserJet, InkTank & Genuine Cartridges",
      href: "/shop",
    },
    {
      title: "Desktops & All-in-Ones",
      badge: "Core i5 / i7",
      badgeColor: "bg-laptopzone-orange",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
        </svg>
      ),
      subtext: "Workstation Desktops & Monoblocks",
      href: "/shop",
    },
    {
      title: "Storage & Accessories",
      badge: "SSDs & RAM",
      badgeColor: "bg-laptopzone-blue",
      icon: (
        <svg className="w-10 h-10 text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.75 5.1a2.25 2.25 0 0 1 1.77-1.1h9.96a2.25 2.25 0 0 1 1.77 1.1l2.1 3.45c.57.94.9 2.03.9 3.2M12 9.75h.008v.008H12V9.75Z" />
        </svg>
      ),
      subtext: "External HDDs, Laptop Bags & Chargers",
      href: "/shop",
    },
  ]

  return (
    <div className="my-8">
      <div className="content-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-laptopzone-navy uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-laptopzone-orange rounded-sm inline-block"></span>
              Explore Hardware Categories
            </h2>
            <p className="text-xs text-gray-600">Zimbabwe&apos;s trusted IT inventory listed in USD ($)</p>
          </div>
          <LocalizedClientLink
            href="/shop"
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
                className={`absolute top-2 right-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded tracking-wider uppercase ${cat.badgeColor}`}
              >
                {cat.badge}
              </span>

              <div className="my-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>

              <div>
                <h3 className="text-xs font-bold text-laptopzone-navy group-hover:text-laptopzone-blue transition-colors line-clamp-1">
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

