"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { HttpTypes } from "@medusajs/types"

const SVG_PLACEHOLDER = (
  <div className="w-full h-24 sm:h-28 flex items-center justify-center text-gray-400">
    <svg
      className="w-10 h-10 opacity-30"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  </div>
)

export default function TopCategories({
  categories,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-6 sm:py-8" aria-label="Top Categories">
      <div className="content-container">
        {/* Section Header with Left/Right Slider Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
            TOP CATEGORIES
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous categories"
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
              aria-label="Next categories"
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

        {/* Scrollable / Grid Cards */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(25%-12px)] lg:grid-cols-6 lg:auto-cols-auto gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {categories.map((cat) => {
            const image =
              (cat.metadata?.image as string) ||
              (cat.metadata?.thumbnail as string) ||
              (cat.metadata?.icon as string) ||
              null

            return (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="group bg-[#f8f9fa] hover:bg-[#f1f3f5] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between border border-gray-100 hover:border-gray-200 shadow-2xs hover:shadow-md transition-all duration-300 min-h-[175px] sm:min-h-[200px]"
              >
                {/* Category Image */}
                <div className="relative w-full h-24 sm:h-28 flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
                    />
                  ) : (
                    SVG_PLACEHOLDER
                  )}
                </div>

                {/* Title */}
                <span className="font-bold text-xs sm:text-sm text-gray-900 text-center tracking-tight mt-2 group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
