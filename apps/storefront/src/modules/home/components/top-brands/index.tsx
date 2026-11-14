"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { StoreBrand } from "@lib/constants/brands"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

const DEFAULT_ENTERPRISE_BRANDS: StoreBrand[] = [
  { id: "b-cisco", name: "Cisco Systems", handle: "cisco", logo: "/brands/intel.svg", description: "Enterprise Core Routing & Catalyst Switching" },
  { id: "b-ubiquiti", name: "Ubiquiti UniFi", handle: "ubiquiti", logo: "/brands/asus.svg", description: "Cloud Managed WiFi 7 & Switching Ecosystems" },
  { id: "b-lenovo", name: "Lenovo ThinkPad", handle: "lenovo", logo: "/brands/lenovo.svg", description: "Industry Standard Business & Workstation Laptops" },
  { id: "b-dell", name: "Dell Technologies", handle: "dell", logo: "/brands/dell.svg", description: "PowerEdge Servers, Precision & Latitude Rigs" },
  { id: "b-hp", name: "HP Enterprise", handle: "hp", logo: "/brands/hp.svg", description: "ProLiant Servers & EliteBook Workstations" },
  { id: "b-apple", name: "Apple", handle: "apple", logo: "/brands/apple.svg", description: "MacBook Pro M3/M4 Architecture for Creators" },
  { id: "b-mikrotik", name: "MikroTik", handle: "mikrotik", logo: "/brands/msi.svg", description: "High-Throughput Carrier Routing & RouterOS" },
  { id: "b-synology", name: "Synology", handle: "synology", logo: "/brands/samsung.svg", description: "Enterprise Flash & Hybrid NAS Storage Arrays" },
  { id: "b-asus", name: "ASUS ProArt / ROG", handle: "asus", logo: "/brands/asus.svg", description: "High-End Creator Laptops & Motherboard Tech" },
  { id: "b-intel", name: "Intel Xeon", handle: "intel", logo: "/brands/intel.svg", description: "Core Ultra Processors & Datacenter Silicon" },
  { id: "b-amd", name: "AMD EPYC", handle: "amd", logo: "/brands/amd.svg", description: "High-Core Count Virtualization & Workstations" },
]

export default function TopBrands({ brands = [] }: { brands?: StoreBrand[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Use passed brands if available, otherwise use default enterprise brands
  const displayBrands = brands && brands.length > 0 ? brands : DEFAULT_ENTERPRISE_BRANDS

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
    <section className="py-10 bg-slate-50/50 border-t border-slate-200/60" aria-label="Authorized Hardware Brands">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Brands
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Authorized hardware partners &amp; OEM equipment
            </p>
          </div>
          <LocalizedClientLink
            href="/brands"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>View All</span>
            <span aria-hidden="true">&rarr;</span>
          </LocalizedClientLink>
        </div>

        {/* Horizontally Scrollable Brands Carousel */}
        <div className="relative">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-black transition-all shadow-sm cursor-pointer active:scale-95"
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-8"
          >
            {displayBrands.map((brand) => (
              <LocalizedClientLink
                key={brand.id || brand.handle}
                href={`/brands/${brand.handle}`}
                className="group shrink-0 bg-white hover:bg-slate-50 p-4 flex flex-col items-center justify-between rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 w-44 sm:w-52 h-32"
              >
                <div className="relative w-full h-14 flex items-center justify-center">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      unoptimized
                      fill
                      sizes="200px"
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-800 tracking-tight text-center">
                      {brand.name}
                    </span>
                  )}
                </div>
                <div className="text-center w-full pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    Enterprise Partner
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-black transition-all shadow-sm cursor-pointer active:scale-95"
            aria-label="Next brands"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
