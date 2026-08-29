"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { StoreBrand, STATIC_BRANDS } from "@lib/data/brands"

export default function TopBrands({ brands = STATIC_BRANDS }: { brands?: StoreBrand[] }) {
  const displayBrands = (brands && brands.length > 0 ? brands : STATIC_BRANDS).slice(0, 6)

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Brands">
      <div className="content-container">
        {/* Section Header */}
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

          <LocalizedClientLink
            href="/brands"
            className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors sm:hidden"
          >
            All Brands →
          </LocalizedClientLink>
        </div>

        {/* 6 Static Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {displayBrands.map((brand) => (
            <LocalizedClientLink
              key={brand.id || brand.handle}
              href={`/brands/${brand.handle}`}
              className="group bg-white hover:bg-gray-50 p-4 sm:p-5 flex items-center justify-center  hover:border-black rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 h-20 sm:h-24"
            >
              <div className="relative w-full h-10 sm:h-12 flex items-center justify-center">
                <Image
                  src={brand.logo as string}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
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
