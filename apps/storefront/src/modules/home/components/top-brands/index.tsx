"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { StoreBrand } from "@lib/data/brands"

type FixedBrand = {
  id: string
  name: string
  href: string
  logo?: string
}

const FIXED_TOP_BRANDS: FixedBrand[] = [
  {
    id: "apple",
    name: "Apple",
    href: "/store?q=apple",
    logo: "/top-brands/apple.png",
  },
  {
    id: "asus",
    name: "ASUS",
    href: "/store?q=asus",
    logo: "/top-brands/asus.png",
  },
  {
    id: "hp",
    name: "HP",
    href: "/store?q=hp",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    href: "/store?q=lenovo",
  },
  {
    id: "amd",
    name: "AMD",
    href: "/store?q=amd",
    logo: "/top-brands/amd.png",
  },
  {
    id: "logitech",
    name: "Logitech",
    href: "/store?q=logitech",
    logo: "/top-brands/logitech.png",
  },
  {
    id: "razer",
    name: "Razer",
    href: "/store?q=razer",
    logo: "/top-brands/razer.png",
  },
  {
    id: "ubiquiti",
    name: "Ubiquiti",
    href: "/store?q=ubiquiti",
    logo: "/top-brands/ubiquiti.png",
  },
  {
    id: "lg",
    name: "LG",
    href: "/store?q=lg",
    logo: "/top-brands/lg.png",
  },
]

export default function TopBrands({}: { brands?: StoreBrand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Brands">
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
              aria-label="Next brands"
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

        {/* 9 Fixed Brands Carousel Track */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(33.333%-10px)] md:auto-cols-[calc(20%-12px)] lg:auto-cols-[calc(11.111%-12px)] gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {FIXED_TOP_BRANDS.map((brand) => (
            <LocalizedClientLink
              key={brand.id}
              href={brand.href}
              className="group bg-white hover:bg-gray-50 p-4 sm:p-5 flex items-center justify-center border border-gray-200 hover:border-gray-400 shadow-2xs hover:shadow-md transition-all duration-300 h-20 sm:h-24"
            >
              {brand.logo ? (
                <div className="relative w-full h-10 sm:h-12 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 140px"
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <span className="font-black text-sm sm:text-base text-gray-900 tracking-wider group-hover:text-primary transition-colors text-center line-clamp-1 uppercase">
                  {brand.name}
                </span>
              )}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
