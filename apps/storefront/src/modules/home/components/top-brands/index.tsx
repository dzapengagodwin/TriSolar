"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useRef } from "react"
import { StoreBrand } from "@lib/data/brands"

type BrandDisplayItem = {
  id: string
  name: string
  handle: string
  logo?: string | null
}

const LOCAL_BRAND_LOGOS: Record<string, string> = {
  apple: "/top-brands/apple.png",
  asus: "/top-brands/asus.png",
  hp: "/top-brands/hp.png",
  lenovo: "/top-brands/lenovo.png",
  dell: "/top-brands/dell.png",
  canon: "/top-brands/canon.png",
  brother: "/top-brands/brother.png",
  amd: "/top-brands/amd.png",
  logitech: "/top-brands/logitech.png",
  ubiquiti: "/top-brands/ubiquiti.png",
}

const FALLBACK_TOP_BRANDS: BrandDisplayItem[] = [
  { id: "apple", name: "Apple", handle: "apple", logo: "/top-brands/apple.png" },
  { id: "dell", name: "Dell", handle: "dell", logo: "/top-brands/dell.png" },
  { id: "hp", name: "HP", handle: "hp", logo: "/top-brands/hp.png" },
  { id: "lenovo", name: "Lenovo", handle: "lenovo", logo: "/top-brands/lenovo.png" },
  { id: "asus", name: "ASUS", handle: "asus", logo: "/top-brands/asus.png" },
  { id: "canon", name: "Canon", handle: "canon", logo: "/top-brands/canon.png" },
  { id: "brother", name: "Brother", handle: "brother", logo: "/top-brands/brother.png" },
  { id: "amd", name: "AMD", handle: "amd", logo: "/top-brands/amd.png" },
  { id: "logitech", name: "Logitech", handle: "logitech", logo: "/top-brands/logitech.png" },
  { id: "ubiquiti", name: "Ubiquiti", handle: "ubiquiti", logo: "/top-brands/ubiquiti.png" },
]

export default function TopBrands({ brands }: { brands?: StoreBrand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayBrands: BrandDisplayItem[] =
    brands && brands.length > 0
      ? brands.map((b) => {
          const handleKey = b.handle.toLowerCase().trim()
          const localLogo = LOCAL_BRAND_LOGOS[handleKey]
          // Ignore product photo URLs saved during WooCommerce product import
          const isProductPhoto =
            b.logo &&
            (b.logo.includes("/wp-content/uploads/") ||
              b.logo.includes("/products/") ||
              b.logo.includes("laptopzone.co.zw/wp-content"))
          const logo = localLogo || (!isProductPhoto ? b.logo : null) || null

          return {
            id: b.id,
            name: b.name,
            handle: b.handle,
            logo,
          }
        })
      : FALLBACK_TOP_BRANDS

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
          {displayBrands.map((brand) => (
            <LocalizedClientLink
              key={brand.id || brand.handle}
              href={`/brands/${brand.handle}`}
              className="group bg-white hover:bg-gray-50 p-4 sm:p-5 flex items-center justify-center border border-gray-200 hover:border-gray-400 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 h-20 sm:h-24"
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
                <span className="font-black text-xs sm:text-sm text-gray-900 tracking-wider group-hover:text-primary transition-colors text-center line-clamp-1 uppercase px-2">
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
