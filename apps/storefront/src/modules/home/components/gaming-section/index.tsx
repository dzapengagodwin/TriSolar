import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { ArrowRight } from "@medusajs/icons"

export default function GamingSection() {
  return (
    <section className="py-4 sm:py-6" aria-label="Featured Categories">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:h-[560px]">
          
          {/* 1. Left Feature Hero Card (Spans 7 cols on desktop) */}
          <LocalizedClientLink
            href="/categories/gaming-pcs"
            className="group relative isolate overflow-hidden rounded-3xl bg-[#0B0D12] border border-gray-800/80 p-7 sm:p-10 transition-all duration-300 hover:border-gray-700 hover:shadow-2xl flex flex-col justify-between min-h-[380px] lg:min-h-0 lg:col-span-7"
          >
            {/* Subtle Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="relative z-10 flex h-full max-w-[62%] sm:max-w-[54%] flex-col items-start justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Custom Desktops
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  High-Performance Gaming PCs
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed hidden sm:block pt-1 max-w-sm">
                  Engineered with latest-gen processors and RTX 40-Series graphics for peak computing power.
                </p>
              </div>

              <div className="pt-6">
                <span className="inline-flex items-center gap-2 bg-white text-gray-900 group-hover:bg-primary group-hover:text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm">
                  <span>Explore Desktops</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 w-[55%] h-[85%] -z-0 flex items-end justify-end p-2 sm:p-4">
              <Image
                src="/gaming/gaming-pcs.png"
                alt="Gaming Desktops"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-104 drop-shadow-2xl"
              />
            </div>
          </LocalizedClientLink>

          {/* Right Column: 3 Cards Stacked Vertically (Spans 5 cols on desktop) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-4 lg:gap-3.5 lg:h-full">
            
            {/* 2. Top Right Card: Gaming Laptops */}
            <LocalizedClientLink
              href="/categories/gaming-laptops"
              className="group relative isolate overflow-hidden rounded-3xl bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4.5 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              <div className="relative z-10 flex h-full max-w-[62%] sm:max-w-[58%] lg:max-w-[60%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Portable Computing
                  </span>
                  <h3 className="text-lg sm:text-xl lg:text-base xl:text-lg 2xl:text-xl font-bold tracking-tight text-white leading-snug">
                    Gaming & Pro Laptops
                  </h3>
                </div>

                <div className="pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 group-hover:text-primary transition-colors">
                    <span>Shop Laptops</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[50%] sm:w-[52%] lg:w-[48%] h-[82%] sm:h-[85%] -z-0 flex items-end justify-end p-2">
                <Image
                  src="/gaming/gaming-laptops.png"
                  alt="Gaming Laptops"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-104 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

            {/* 3. Middle Right Card: Home and Student Laptops */}
            <LocalizedClientLink
              href="/categories/home-student"
              className="group relative isolate overflow-hidden rounded-3xl bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4.5 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              <div className="relative z-10 flex h-full max-w-[62%] sm:max-w-[58%] lg:max-w-[60%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Everyday & Education
                  </span>
                  <h3 className="text-lg sm:text-xl lg:text-base xl:text-lg 2xl:text-xl font-bold tracking-tight text-white leading-snug">
                    Home & Student Laptops
                  </h3>
                </div>

                <div className="pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 group-hover:text-primary transition-colors">
                    <span>Shop Student</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[50%] sm:w-[52%] lg:w-[48%] h-[82%] sm:h-[85%] -z-0 flex items-end justify-end p-2">
                <Image
                  src="/gaming/home-student-laptops.png"
                  alt="Home and Student Laptops"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-104 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

            {/* 4. Bottom Right Card: Monitors */}
            <LocalizedClientLink
              href="/categories/gaming-monitors"
              className="group relative isolate overflow-hidden rounded-3xl bg-[#10131A] border border-gray-800/80 p-5 sm:p-6 lg:p-4.5 xl:p-5 transition-all duration-300 hover:border-gray-700 hover:shadow-xl flex flex-col justify-between min-h-[190px] sm:min-h-[210px] lg:min-h-0"
            >
              <div className="relative z-10 flex h-full max-w-[62%] sm:max-w-[58%] lg:max-w-[60%] flex-col items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Displays & Monitors
                  </span>
                  <h3 className="text-lg sm:text-xl lg:text-base xl:text-lg 2xl:text-xl font-bold tracking-tight text-white leading-snug">
                    Curved & 4K Displays
                  </h3>
                </div>

                <div className="pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 group-hover:text-primary transition-colors">
                    <span>View Monitors</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 w-[50%] sm:w-[52%] lg:w-[48%] h-[82%] sm:h-[85%] -z-0 flex items-end justify-end p-2">
                <Image
                  src="/gaming/gaming-monitors.png"
                  alt="Gaming Monitors"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-104 drop-shadow-xl"
                />
              </div>
            </LocalizedClientLink>

          </div>
        </div>
      </div>
    </section>
  )
}
