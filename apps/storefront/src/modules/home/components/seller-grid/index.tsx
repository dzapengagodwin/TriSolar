export default function SellerGrid() {
  const sellers = [
    {
      name: "EasyFashion Ltd.",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
        </svg>
      ),
      bg: "bg-orange-50",
      featured: false,
    },
    {
      name: "SoftElectronics",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      bg: "bg-black text-white",
      featured: true,
    },
    {
      name: "ArtisanFashion",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
      bg: "bg-amber-50",
      featured: false,
    },
    {
      name: "GearUPSports",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 000 20M12 2a14.5 14.5 0 010 20M2 12h20" />
        </svg>
      ),
      bg: "bg-blue-50",
      featured: false,
    },
    {
      name: "TastyCooking",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      bg: "bg-yellow-50",
      featured: false,
    },
    {
      name: "ChildrenStore",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      bg: "bg-pink-50",
      featured: false,
    },
    {
      name: "UrbanStyle",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h11a2 2 0 012 2v1" />
          <path d="M18 8h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v-8z" />
        </svg>
      ),
      bg: "bg-rose-50",
      featured: false,
    },
    {
      name: "HomeArt",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" />
        </svg>
      ),
      bg: "bg-emerald-50",
      featured: false,
    },
    {
      name: "EverydayEssentials",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
      ),
      bg: "bg-teal-50",
      featured: false,
    },
    {
      name: "EcoFurniture",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      bg: "bg-slate-100",
      featured: false,
    },
  ]

  return (
    <div className="py-12 bg-white">
      <div className="content-container space-y-8">
        
        {/* Centered Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
            Most Popular Seller
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Dining, Living, Solid wood, Scandinavian minimalist design for all style.
          </p>
        </div>

        {/* 5-Column x 2-Row Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {sellers.map((seller, idx) => (
            <div
              key={idx}
              className={`${seller.bg} rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow border border-gray-200/50 min-h-[140px] cursor-pointer`}
            >
              <div className="w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                {seller.icon}
              </div>
              <h4 className={`text-xs font-bold ${seller.featured ? "text-white" : "text-gray-900"}`}>
                {seller.name}
              </h4>
              <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
