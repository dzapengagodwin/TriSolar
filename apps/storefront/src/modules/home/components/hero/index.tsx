import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="py-8 bg-[#F8FAF9]">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Top Large Mint Card + Bottom 2 Cards */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. Top Large Card: Best Furniture Collection (Mint #E6F4F1) */}
            <div className="bg-[#E6F4F1] rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[340px] border border-emerald-100">
              <div className="max-w-xs sm:max-w-sm space-y-4 z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#063A34] bg-white/80 px-3 py-1 rounded-full inline-block">
                  SUMMER SALE 2026
                </span>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#063A34] leading-tight font-sans">
                  Best Furniture Collection
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Dining, Living, Solid wood, Scandinavian minimalist design for all style.
                </p>

                <div className="pt-2">
                  <LocalizedClientLink
                    href="/store"
                    className="inline-block bg-[#063A34] hover:bg-[#042723] text-white font-bold text-xs px-6 py-3 rounded-full transition-colors uppercase tracking-wider shadow-md"
                  >
                    Shop Now
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Graphic Element */}
              <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 w-40 sm:w-56 h-40 sm:h-56 flex items-center justify-center">
                <div className="w-36 h-36 bg-amber-400 rounded-3xl transform rotate-6 shadow-lg flex items-center justify-center text-4xl">
                  🪑
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Split Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 3: Men's Fashion (Lavender #EBF1F5) */}
              <div className="bg-[#EBF1F5] rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-between border border-blue-100">
                <div className="space-y-2 z-10 max-w-[160px]">
                  <span className="text-[10px] font-bold text-gray-700 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                    SUGGEST SALE 50%
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    Stylish Men's Fashion
                  </h3>
                  <LocalizedClientLink href="/store" className="text-xs font-bold text-[#063A34] underline block pt-1">
                    Shop Now
                  </LocalizedClientLink>
                </div>
                <div className="absolute right-2 bottom-2 text-5xl opacity-90">
                  👔
                </div>
              </div>

              {/* Card 4: Special Save 30% (Peach #FCF0EB) */}
              <div className="bg-[#FCF0EB] rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-between border border-orange-100">
                <div className="space-y-2 z-10 max-w-[160px]">
                  <span className="text-[10px] font-bold text-amber-800 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                    SAVE UP TO 30%
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    Kids & Teen Fashion
                  </h3>
                  <LocalizedClientLink href="/store" className="text-xs font-bold text-[#063A34] underline block pt-1">
                    Shop Now
                  </LocalizedClientLink>
                </div>
                <div className="absolute right-2 bottom-2 text-5xl opacity-90">
                  🧢
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (4 cols): Tall Beige Card (Stylish Looks) */}
          <div className="lg:col-span-4">
            <div className="bg-[#F6EFEB] rounded-3xl p-8 sm:p-10 relative overflow-hidden h-full min-h-[420px] flex flex-col justify-between border border-amber-100">
              <div className="space-y-3 z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-white/80 px-3 py-1 rounded-full inline-block">
                  SUPER SALE 30%
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug font-sans">
                  Stylish Looks For Any Season
                </h2>

                <div className="pt-2">
                  <LocalizedClientLink
                    href="/store"
                    className="inline-block bg-[#8C3A2B] hover:bg-[#6D2C20] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors uppercase tracking-wider shadow-md"
                  >
                    Shop Now
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Graphic Element */}
              <div className="relative mt-8 flex justify-center items-center">
                <div className="w-48 h-56 bg-amber-200/60 rounded-3xl flex items-center justify-center text-7xl shadow-inner">
                  ⌚
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Hero
