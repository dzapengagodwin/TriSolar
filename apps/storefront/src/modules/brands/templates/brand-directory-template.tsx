import Image from "next/image"
import type { StoreBrand } from "@lib/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const DEFAULT_ENTERPRISE_BRANDS: StoreBrand[] = [
  { id: "b-cisco", name: "Cisco Systems", handle: "cisco", logo: "/brands/intel.svg" },
  { id: "b-ubiquiti", name: "Ubiquiti UniFi", handle: "ubiquiti", logo: "/brands/asus.svg" },
  { id: "b-lenovo", name: "Lenovo ThinkPad", handle: "lenovo", logo: "/brands/lenovo.svg" },
  { id: "b-dell", name: "Dell Technologies", handle: "dell", logo: "/brands/dell.svg" },
  { id: "b-hp", name: "HP Enterprise", handle: "hp", logo: "/brands/hp.svg" },
  { id: "b-apple", name: "Apple", handle: "apple", logo: "/brands/apple.svg" },
  { id: "b-mikrotik", name: "MikroTik", handle: "mikrotik", logo: "/brands/msi.svg" },
  { id: "b-synology", name: "Synology", handle: "synology", logo: "/brands/samsung.svg" },
  { id: "b-asus", name: "ASUS ProArt / ROG", handle: "asus", logo: "/brands/asus.svg" },
  { id: "b-intel", name: "Intel Xeon", handle: "intel", logo: "/brands/intel.svg" },
  { id: "b-amd", name: "AMD EPYC", handle: "amd", logo: "/brands/amd.svg" },
]

export default function BrandDirectoryTemplate({
  brands,
}: {
  brands: StoreBrand[]
}) {
  const displayBrands = brands && brands.length > 0 ? brands : DEFAULT_ENTERPRISE_BRANDS

  return (
    <div className="py-8 sm:py-12 content-container space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
          Authorized Hardware Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Shop by Official OEM &amp; Tech Brands
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-xl mx-auto leading-relaxed">
          Discover authorized networking switches, WiFi 7 access points, enterprise laptops, desktop workstations and datacenter hardware from world-leading manufacturers.
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {displayBrands.map((brand) => (
          <LocalizedClientLink
            key={brand.id || brand.handle}
            href={`/brands/${brand.handle}`}
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col items-center justify-between text-center transition-all duration-300 shadow-2xs hover:shadow-md h-44 sm:h-48"
          >
            <div className="w-full flex-1 flex items-center justify-center p-2">
              {brand.logo ? (
                <div className="relative w-full h-20 sm:h-24 md:h-28 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 160px"
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold text-sm">
                  {brand.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="w-full pt-2 border-t border-slate-100">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 block">
                {brand.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Authorized Supply
              </span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
