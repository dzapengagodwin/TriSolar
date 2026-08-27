"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { StoreBrand } from "@lib/data/brands"

export default function TopBrands({ brands }: { brands?: StoreBrand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!brands || brands.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Brands">
      <div className="content-container">
        {/* Section Header with Link & Slider Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
              TOP BRANDS
            </h2>
            <LocalizedClientLink
              href="/brands"
              className="text-[11px] font-extrabold uppercase tracking-wider text-laptopzone-orange hover:text-laptopzone-navy transition-colors hidden sm:inline-block"
            >
              View Directory →
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-2">
            <LocalizedClientLink
              href="/brands"
              className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors sm:hidden mr-2"
            >
              All Brands →
            </LocalizedClientLink>

            <button
              onClick={() => scroll("left")}
              aria-label="Previous brands"
              className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer rounded-lg"
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
              className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer rounded-lg"
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

        {/* Brands Carousel Track */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(20%-12px)] lg:auto-cols-[calc(11.111%-12px)] gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {brands.filter((b) => b.logo).map((brand) => (
            <LocalizedClientLink
              key={brand.id || brand.handle}
              href={`/brands/${brand.handle}`}
              className="group bg-white hover:bg-gray-50 p-4 sm:p-5 flex items-center justify-center border border-gray-200 hover:border-gray-400 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 h-20 sm:h-24"
            >
              <div className="relative w-full h-10 sm:h-12 flex items-center justify-center">
                <Image
                  src={brand.logo as string}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 140px"
                  className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
