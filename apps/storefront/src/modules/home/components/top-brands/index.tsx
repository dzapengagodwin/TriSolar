"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { StoreBrand } from "@lib/data/brands"

export default function TopBrands({ brands }: { brands?: StoreBrand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <section className="py-6 sm:py-8" aria-label="Top Brands">
      <div className="content-container">
        {/* Section Header with Left/Right Slider Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
            TOP BRANDS
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous brands"
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next brands"
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Brand Logos Row */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(25%-12px)] lg:grid-cols-7 lg:auto-cols-auto gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {brands.map((brand) => {
            const logo =
              brand.logo ||
              brand.image ||
              (brand.metadata?.image as string) ||
              (brand.metadata?.logo as string) ||
              (brand.metadata?.thumbnail as string) ||
              null

            return (
              <LocalizedClientLink
                key={brand.id}
                href={`/store?q=${encodeURIComponent(brand.name)}`}
                className="group bg-white hover:bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-center border border-gray-200/80 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 h-20 sm:h-24"
              >
                {logo ? (
                  <div className="relative w-full h-10 sm:h-12 flex items-center justify-center">
                    <Image
                      src={logo}
                      alt={`${brand.name} logo`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 150px"
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <span className="font-extrabold text-sm sm:text-base text-gray-800 tracking-wider group-hover:text-primary transition-colors text-center line-clamp-1">
                    {brand.name}
                  </span>
                )}
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
