"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { StoreBrand } from "@lib/constants/brands"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

export default function TopBrands({ brands = [] }: { brands?: StoreBrand[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!brands || brands.length === 0) {
    return null
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Brands">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
            BRANDS
          </h2>
          <LocalizedClientLink
            href="/brands"
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-laptopzone-orange hover:text-laptopzone-navy transition-colors inline-flex items-center gap-1"
          >
            View Directory →
          </LocalizedClientLink>
        </div>

        {/* Horizontally Scrollable Brands Carousel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-10"
          >
            {brands.map((brand) => (
              <LocalizedClientLink
                key={brand.id || brand.handle}
                href={`/brands/${brand.handle}`}
                className="group shrink-0 bg-white hover:bg-gray-50 p-3 sm:p-4 flex items-center justify-center rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 w-36 sm:w-44 md:w-48 h-24 sm:h-28 md:h-32"
              >
                <div className="relative w-full h-14 sm:h-18 md:h-20 flex items-center justify-center">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
                      className="object-contain object-center group-hover:scale-108 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight text-center px-2">
                      {brand.name}
                    </span>
                  )}
                </div>
              </LocalizedClientLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Next brands"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
