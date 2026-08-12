import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CategoryAvatars({
  categories,
}: {
  categories?: HttpTypes.StoreCategory[]
}) {
  const bgColors = ["bg-amber-100", "bg-pink-100", "bg-blue-100", "bg-rose-100", "bg-gray-200", "bg-orange-100"]

  // Display categories from Medusa or fallback if empty
  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, 6)
      : []

  if (!displayCategories || displayCategories.length === 0) {
    return null
  }

  return (
    <div className="py-12 bg-white">
      <div className="content-container space-y-10">
        
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
            Deals by Category
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Explore authentic tech and lifestyle products directly from our catalog.
          </p>
        </div>

        {/* Circular Category Avatars Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
          {displayCategories.map((cat, idx) => {
            const bgClass = bgColors[idx % bgColors.length]
            const firstLetter = cat.name ? cat.name.charAt(0).toUpperCase() : "C"
            return (
              <LocalizedClientLink
                key={cat.id || idx}
                href={`/categories/${cat.handle}`}
                className="group flex flex-col items-center gap-3"
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 ${bgClass} rounded-full flex items-center justify-center text-2xl font-black text-gray-900 shadow-sm group-hover:scale-105 transition-transform border border-gray-100`}
                >
                  {firstLetter}
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-black transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>

        {/* Full-width Black Coupon Banner */}
        <div className="bg-black text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-gray-800">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-[#FF9F0D] uppercase tracking-wider">SPECIAL CATALOG SELECTION</span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-sans">
              Shop Top Rated Hardware & Accessories
            </h3>
          </div>

          <LocalizedClientLink
            href="/store"
            className="bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold text-xs px-6 py-3 rounded-full transition-colors uppercase tracking-wider shadow-md whitespace-nowrap"
          >
            Explore Catalog
          </LocalizedClientLink>
        </div>

      </div>
    </div>
  )
}
