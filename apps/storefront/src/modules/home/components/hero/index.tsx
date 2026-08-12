import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <div className="py-8 bg-[#F9FAFB]">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Top Large Card + Bottom 2 Cards */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. Top Large Card: Premium Black Card with Gaming Laptops Showcase */}
            <div className="bg-black rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[320px] sm:min-h-[360px] border border-gray-800 shadow-xl">
              <div className="max-w-xs sm:max-w-sm space-y-4 z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-[#FF9F0D] px-3 py-1 rounded-full inline-block">
                  GAMING & PERFORMANCE SALE
                </span>

                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight font-sans tracking-tight">
                  Serious Gaming Power. Smart Prices
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
                  Handle Massive Models, Complex Simulations, and Ultra-High-FPS Gaming — All on One Laptop.
                </p>

                <div className="pt-2">
                  <LocalizedClientLink
                    href="/store"
                    className="inline-block bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold text-xs px-6 py-3 rounded-full transition-colors uppercase tracking-wider shadow-md"
                  >
                    Shop Laptops
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Right Hero Image Showcase */}
              <div className="absolute right-0 bottom-0 top-0 w-full sm:w-1/2 flex items-center justify-end p-4 pointer-events-none">
                <div className="relative w-full h-full max-h-[300px] flex items-center justify-end">
                  <Image
                    src="/hero-laptops.png"
                    alt="Gaming Laptops Showcase - ROG Strix, Victus, OMEN, Intel Core, NVIDIA RTX"
                    fill
                    className="object-contain object-right drop-shadow-2xl opacity-95"
                    sizes="(max-width: 768px) 100vw, 500px"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Split Cards with High-Res Product Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 3: Curved HD Monitors */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-between border border-gray-200 shadow-sm">
                <div className="space-y-2 z-10 max-w-[170px]">
                  <span className="text-[10px] font-bold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-full inline-block">
                    HD MONITORS SALE 50%
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    Curved Displays & Monitors
                  </h3>
                  <LocalizedClientLink href="/store" className="text-xs font-bold text-black underline block pt-1 hover:text-[#FF9F0D]">
                    Shop Monitors
                  </LocalizedClientLink>
                </div>
                <div className="absolute right-1 bottom-1 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-end">
                  <Image
                    src="/hero-monitor.png"
                    alt="Curved HD Monitor Display"
                    fill
                    className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                </div>
              </div>

              {/* Card 4: Flagship Smartphones */}
              <div className="bg-[#FCF0EB] rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-between border border-orange-100 shadow-sm">
                <div className="space-y-2 z-10 max-w-[170px]">
                  <span className="text-[10px] font-bold text-amber-800 bg-white/80 px-2.5 py-0.5 rounded-full inline-block">
                    SAVE UP TO 30%
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    Flagship Smartphones & Devices
                  </h3>
                  <LocalizedClientLink href="/store" className="text-xs font-bold text-black underline block pt-1 hover:text-[#FF9F0D]">
                    Shop Phones
                  </LocalizedClientLink>
                </div>
                <div className="absolute right-2 bottom-0 w-28 h-36 sm:w-32 sm:h-40 flex items-center justify-end">
                  <Image
                    src="/hero-phone.png"
                    alt="Desert Titanium Flagship Smartphone"
                    fill
                    className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (4 cols): Tall Card with HP OMEN Laptop Image */}
          <div className="lg:col-span-4">
            <div className="bg-gray-100 rounded-3xl p-8 sm:p-10 relative overflow-hidden h-full min-h-[420px] flex flex-col justify-between border border-gray-200 shadow-sm">
              <div className="space-y-3 z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-white px-3 py-1 rounded-full inline-block shadow-xs">
                  SUPER SALE 30%
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug font-sans">
                  High Performance Laptops For Work & Play
                </h2>

                <div className="pt-2">
                  <LocalizedClientLink
                    href="/store"
                    className="inline-block bg-black hover:bg-gray-800 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors uppercase tracking-wider shadow-md"
                  >
                    Shop Catalog
                  </LocalizedClientLink>
                </div>
              </div>

              {/* High Resolution HP OMEN 16 Laptop Image */}
              <div className="relative mt-6 flex justify-center items-center w-full h-56 sm:h-64">
                <Image
                  src="/omen-laptop.png"
                  alt="HP OMEN 16 High Performance Gaming Laptop"
                  fill
                  className="object-contain drop-shadow-xl transform hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 350px"
                  priority
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
