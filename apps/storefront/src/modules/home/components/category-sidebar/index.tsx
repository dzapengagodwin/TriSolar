import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CategorySidebar() {
  const categories = [
    { title: "Laptops & Notebooks", icon: "💻", count: 42, href: "/store" },
    { title: "Gaming Laptops", icon: "🎮", count: 18, href: "/store" },
    { title: "Business Notebooks", icon: "💼", count: 24, href: "/store" },
    { title: "Printers & Toners", icon: "🖨️", count: 35, href: "/store" },
    { title: "Desktops & All-in-Ones", icon: "🖥️", count: 15, href: "/store" },
    { title: "Phones & Accessories", icon: "📱", count: 29, href: "/store" },
    { title: "Networking & Routers", icon: "📡", count: 12, href: "/store" },
    { title: "Monitors & Displays", icon: "📺", count: 16, href: "/store" },
    { title: "Software & OS Setup", icon: "🛡️", count: 8, href: "/store" },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hidden lg:block w-72 flex-shrink-0">
      <div className="bg-laptopzone-navy text-white px-4 py-3 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span>☰</span> All Categories
        </span>
        <span className="text-[10px] text-laptopzone-amber bg-white/10 px-2 py-0.5 rounded">Zim Hardware</span>
      </div>

      <ul className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
        {categories.map((cat, idx) => (
          <li key={idx}>
            <LocalizedClientLink
              href={cat.href}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-amber-50 hover:text-laptopzone-amber transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-base group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">{cat.title}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-normal">({cat.count})</span>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
