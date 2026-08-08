import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function MonthlyDeals({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const tabs = [
    "Apple Watch",
    "Android",
    "Smart Devices",
    "Smart Appliances",
    "Special Promotions",
    "Apparel & Footwear",
    "Apparel & Backpacks",
  ]

  return (
    <div className="bg-[#063A34] text-white py-14 my-8 w-full">
      <div className="content-container space-y-8">
        
        {/* Header: Title + Countdown Timer Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Monthly Best Deals
          </h2>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-gray-300">ENDS IN:</span>
            <div className="flex items-center gap-1">
              <span className="bg-[#E53935] text-white px-2.5 py-1 rounded-md font-mono text-xs">00</span>
              <span className="text-white">:</span>
              <span className="bg-[#E53935] text-white px-2.5 py-1 rounded-md font-mono text-xs">12</span>
              <span className="text-white">:</span>
              <span className="bg-[#E53935] text-white px-2.5 py-1 rounded-md font-mono text-xs">45</span>
              <span className="text-white">:</span>
              <span className="bg-[#E53935] text-white px-2.5 py-1 rounded-md font-mono text-xs">22</span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-emerald-800 text-xs font-semibold">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                idx === 2
                  ? "bg-[#FF9F0D] text-white font-bold"
                  : "bg-emerald-900/50 hover:bg-emerald-800 text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 5-Column White Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="bg-white text-gray-900 rounded-2xl p-3 shadow-md hover:shadow-xl transition-shadow">
              <ProductPreview product={product} region={region} isFeatured />
            </div>
          ))}
        </div>

        {/* 3 Featured Promo Cards Below Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Promo Card 1: Fitness Smart Offer (Mint) */}
          <div className="bg-[#E6F4F1] text-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="space-y-2 z-10 max-w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                SUPER PROMOTION
              </span>
              <h3 className="text-base font-extrabold text-[#063A34] leading-snug">
                FITNESS FOR SMART SPECIAL OFFER
              </h3>
              <LocalizedClientLink href="/store" className="text-xs font-bold text-[#063A34] underline block pt-1">
                Shop Now
              </LocalizedClientLink>
            </div>
            <div className="absolute right-2 bottom-2 text-5xl">
              ⌚
            </div>
          </div>

          {/* Promo Card 2: Men's Fashion (Beige) */}
          <div className="bg-[#F6EFEB] text-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="space-y-2 z-10 max-w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                BEST OFFER 50%
              </span>
              <h3 className="text-base font-extrabold text-amber-950 leading-snug">
                Men's Fashion Special Collection
              </h3>
              <LocalizedClientLink href="/store" className="text-xs font-bold text-amber-950 underline block pt-1">
                Shop Now
              </LocalizedClientLink>
            </div>
            <div className="absolute right-2 bottom-2 text-5xl">
              🧥
            </div>
          </div>

          {/* Promo Card 3: Fully Fan Offer (Soft Blue) */}
          <div className="bg-[#EBF1F5] text-gray-900 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="space-y-2 z-10 max-w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                AIR COOLER
              </span>
              <h3 className="text-base font-extrabold text-blue-950 leading-snug">
                Fully Fan Offer - Keep Cool All Day
              </h3>
              <LocalizedClientLink href="/store" className="text-xs font-bold text-blue-950 underline block pt-1">
                Shop Now
              </LocalizedClientLink>
            </div>
            <div className="absolute right-2 bottom-2 text-5xl">
              ❄️
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
