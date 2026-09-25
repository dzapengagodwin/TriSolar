"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { HOMEPAGE_FEATURED_CATEGORIES } from "@lib/constants/categories"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

export default function TopCategories({
  categories = HOMEPAGE_FEATURED_CATEGORIES,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) {
  const displayCategories =
    categories && categories.length > 0
      ? categories
      : HOMEPAGE_FEATURED_CATEGORIES

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Categories">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
            TOP CATEGORIES
          </h2>
          <LocalizedClientLink
            href="/store"
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-laptopzone-orange hover:text-laptopzone-navy transition-colors inline-flex items-center gap-1"
          >
            Browse All →
          </LocalizedClientLink>
        </div>

        {/* Horizontally Scrollable Circular Category Avatars */}
        <div className="relative">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-start gap-4 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2 px-10"
          >
            {displayCategories.map((cat) => {
              const imageSrc =
                (cat.metadata?.image as string) ||
                `/top-categories/${cat.handle}.png`

              return (
                <LocalizedClientLink
                  key={cat.id || cat.handle}
                  href={`/categories/${cat.handle}`}
                  className="group flex flex-col items-center cursor-pointer transition-transform duration-200 shrink-0 w-28 sm:w-32 md:w-36 text-center"
                >
                  {/* Circular Avatar Container */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white border border-gray-200 shadow-2xs group-hover:border-primary group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-3 sm:p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                        className="object-contain object-center group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Category Title */}
                  <span className="font-semibold text-xs sm:text-sm text-gray-900 text-center tracking-tight mt-3 group-hover:text-primary transition-colors line-clamp-2 w-full leading-snug">
                    {cat.name}
                  </span>
                </LocalizedClientLink>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
