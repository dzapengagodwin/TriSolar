"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { HttpTypes } from "@medusajs/types"

type FixedCategory = {
  id: string
  name: string
  href: string
  image: string
}

const FIXED_TOP_CATEGORIES: FixedCategory[] = [
  {
    id: "laptops",
    name: "Laptops & Computers",
    href: "/store?q=laptop",
    image: "/top-categories/laptops.png",
  },
  {
    id: "desktops",
    name: "Desktops & Gaming PCs",
    href: "/store?q=desktop",
    image: "/gaming/gaming-pcs.png",
  },
  {
    id: "monitors",
    name: "Monitors & Displays",
    href: "/store?q=monitors",
    image: "/top-categories/monitors.png",
  },
  {
    id: "smartphones",
    name: "Smartphones & Tablets",
    href: "/store?q=phone",
    image: "/hero-phone.png",
  },
  {
    id: "components",
    name: "Computer Components",
    href: "/store?q=components",
    image: "/gaming/computer-components.png",
  },
  {
    id: "keyboards-mice",
    name: "Keyboards & Mice",
    href: "/store?q=keyboard",
    image: "/top-categories/keyboards.png",
  },
  {
    id: "audio-headphones",
    name: "Headphones & Audio",
    href: "/store?q=headphones",
    image: "/top-categories/headphones.png",
  },
  {
    id: "smartwatches",
    name: "Smartwatches & Tech",
    href: "/store?q=smartwatch",
    image: "/top-categories/smartwatches.png",
  },
  {
    id: "gaming-vr",
    name: "Gaming & VR Gear",
    href: "/store?q=gaming",
    image: "/gaming/vr-headsets.png",
  },
]

export default function TopCategories({}: {
  categories?: HttpTypes.StoreProductCategory[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Categories">
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
              className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer"
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
              className="w-8 h-8 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-black transition-colors shadow-2xs cursor-pointer"
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

        {/* 9 Fixed Categories Carousel Track */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(20%-12px)] lg:auto-cols-[calc(11.111%-12px)] gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {FIXED_TOP_CATEGORIES.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={cat.href}
              className="group bg-[#f8f9fa] hover:bg-[#f1f3f5] p-3 sm:p-4 flex flex-col items-center justify-between border border-gray-100 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 min-h-[160px] sm:min-h-[180px]"
            >
              {/* Category Image */}
              <div className="relative w-full h-24 sm:h-28 flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 140px"
                  className="object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
                />
              </div>

              {/* Title */}
              <span className="font-bold text-xs text-gray-900 text-center tracking-tight mt-2 group-hover:text-primary transition-colors line-clamp-2">
                {cat.name}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
