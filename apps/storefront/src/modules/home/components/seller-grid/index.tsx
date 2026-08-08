export default function SellerGrid() {
  const sellers = [
    { name: "EasyFashion Ltd.", logo: "👗", bg: "bg-orange-50", featured: false },
    { name: "SoftElectronics", logo: "💻", bg: "bg-[#063A34] text-white", featured: true },
    { name: "ArtisanFashion", logo: "👔", bg: "bg-amber-50", featured: false },
    { name: "GearUPSports", logo: "⚽", bg: "bg-blue-50", featured: false },
    { name: "TastyCooking", logo: "🍳", bg: "bg-yellow-50", featured: false },
    { name: "ChildrenStore", logo: "🧸", bg: "bg-pink-50", featured: false },
    { name: "UrbanStyle", logo: "👟", bg: "bg-rose-50", featured: false },
    { name: "HomeArt", logo: "🪴", bg: "bg-emerald-50", featured: false },
    { name: "EverydayEssentials", logo: "🛒", bg: "bg-teal-50", featured: false },
    { name: "EcoFurniture", logo: "🪑", bg: "bg-slate-100", featured: false },
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
              <div className="w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center text-2xl shadow-sm mb-3">
                {seller.logo}
              </div>
              <h4 className={`text-xs font-bold ${seller.featured ? "text-white" : "text-gray-900"}`}>
                {seller.name}
              </h4>
              <div className="flex items-center gap-1 text-amber-400 text-[10px] mt-1">
                ★★★★★
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
