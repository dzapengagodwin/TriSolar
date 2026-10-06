import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default function GamingSection() {
  return (
    <section className="py-4 sm:py-6" aria-label="Featured Categories">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 lg:gap-2.5 lg:h-[560px]">
          
          {/* 1. Left Feature Hero Card (Spans 8 cols on desktop) */}
      
<LocalizedClientLink 
  href="/products/laptops/business-laptops"
  className="group relative isolate overflow-hidden bg-[#0B0D12] border border-gray-800/80 p-7 sm:p-10 transition-all duration-300 hover:border-gray-700 hover:shadow-2xl flex flex-col justify-between min-h-[380px] lg:min-h-0 lg:col-span-8" 
> 
  {/* Subtle Ambient Background Glow & Background Image */} 
  <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" /> 
  <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
    <Image
      src="/gaming/bg-hero-laptop.webp"
      alt=""
      fill
      sizes="(max-width: 1024px) 100vw, 67vw"
      className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/75 to-transparent" />
  </div>
 
  <div className="relative z-10 flex h-full max-w-[62%] sm:max-w-[54%] lg:max-w-[52%] xl:max-w-[50%] flex-col items-start justify-between"> 
    <div className="space-y-3"> 
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest"> 
        Premium Laptops 
      </span> 
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"> 
        Professional Performance. Refined. 
      </h1> 
      <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed hidden sm:block pt-1 max-w-sm lg:max-w-md"> 
        Powerful, beautifully engineered laptops built for demanding professionals, creators, and modern work. 
      </p> 
    </div> 
 
    <div className="pt-6"> 
      <span className="inline-flex items-center bg-white text-gray-950 group-hover:bg-gray-100 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm"> 
        <span>Shop Now</span> 
      </span> 
    </div> 
  </div> 
 
  <div className="absolute right-20 bottom-20 w-[55%] lg:w-[50%] xl:w-[52%] h-[85%] lg:h-[90%] -z-0 flex items-end justify-end p-2 sm:p-4"> 
    <Image 
      src="/hero-laptops.webp" 
      alt="Premium Professional Laptops" 
      fill 
      priority 
      fetchPriority="high"
      sizes="(max-width: 1024px) 100vw, 67vw" 
      className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-104 drop-shadow-2xl" 
    /> 
  </div> 
</LocalizedClientLink>


          {/* Right Column: 3 Cards Stacked Vertically (Spans 4 cols on desktop) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-2.5 lg:gap-2 lg:h-full">
            
            {/* 2. Top Right Card: Gaming Laptops */}
            <LocalizedClientLink
              href="/products/laptops/gaming-laptops"
              className="group relative isolate overflow-hidden bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
                <Image
                  src="/gaming/bg-printers.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#10131A] via-[#10131A]/80 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full max-w-[56%] sm:max-w-[52%] lg:max-w-[52%] xl:max-w-[50%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Printers & Scanners
                  </span>
                  <h2 className="text-lg sm:text-xl lg:text-sm xl:text-base 2xl:text-lg font-bold tracking-tight text-white leading-snug">
                    Business & Home Printers
                  </h2>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center border border-white text-white bg-transparent group-hover:bg-white group-hover:text-black font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-xs">
                    <span>Shop Now</span>
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[54%] sm:w-[58%] lg:w-[52%] xl:w-[54%] h-[92%] sm:h-[96%] lg:h-[98%] -z-0 flex items-end justify-end pr-1 pb-1 sm:pr-2 sm:pb-2">
                <Image
                  src="/printer.webp"
                  alt="Gaming Laptops"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-contain object-right-bottom transition-transform duration-500 scale-105 sm:scale-110 lg:scale-105 xl:scale-110 origin-bottom-right group-hover:scale-112 group-hover:sm:scale-116 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

            {/* 3. Middle Right Card: Home and Student Laptops */}
            <LocalizedClientLink
              href="/products/laptops/home-student"
              className="group relative isolate overflow-hidden bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
                <Image
                  src="/gaming/bg-laptops.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#10131A] via-[#10131A]/80 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full max-w-[56%] sm:max-w-[52%] lg:max-w-[52%] xl:max-w-[50%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Everyday & Education
                  </span>
                  <h2 className="text-lg sm:text-xl lg:text-sm xl:text-base 2xl:text-lg font-bold tracking-tight text-white leading-snug">
                    Home & Student Laptops
                  </h2>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center border border-white text-white bg-transparent group-hover:bg-white group-hover:text-black font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-xs">
                    <span>Shop Now</span>
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[54%] sm:w-[58%] lg:w-[52%] xl:w-[54%] h-[92%] sm:h-[96%] lg:h-[98%] -z-0 flex items-end justify-end pr-1 pb-1 sm:pr-2 sm:pb-2">
                <Image
                  src="/laptop.webp"
                  alt="Home and Student Laptops"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-contain object-right-bottom transition-transform duration-500 scale-120 sm:scale-125 lg:scale-120 xl:scale-125 translate-y-1 sm:translate-y-2 origin-bottom-right group-hover:scale-126 group-hover:sm:scale-130 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

            {/* 4. Bottom Right Card: Monitors */}
            <LocalizedClientLink
              href="/products/monitors"
              className="group relative isolate overflow-hidden bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
                <Image
                  src="/gaming/bg-monitors.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#10131A] via-[#10131A]/80 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full max-w-[56%] sm:max-w-[52%] lg:max-w-[52%] xl:max-w-[50%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Displays & Monitors
                  </span>
                  <h2 className="text-lg sm:text-xl lg:text-sm xl:text-base 2xl:text-lg font-bold tracking-tight text-white leading-snug">
                    Professional & Gaming Displays
                  </h2>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center border border-white text-white bg-transparent group-hover:bg-white group-hover:text-black font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-xs">
                    <span>Shop Now</span>
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[54%] sm:w-[58%] lg:w-[52%] xl:w-[54%] h-[92%] sm:h-[96%] lg:h-[98%] -z-0 flex items-end justify-end pr-1 pb-1 sm:pr-2 sm:pb-2">
                <Image
                  src="/hero-monitor.webp"
                  alt="Gaming Monitors"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-contain object-right-bottom transition-transform duration-500 scale-105 sm:scale-110 lg:scale-105 xl:scale-110 origin-bottom-right group-hover:scale-112 group-hover:sm:scale-116 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

          </div>
        </div>
      </div>
    </section>
  )
}
