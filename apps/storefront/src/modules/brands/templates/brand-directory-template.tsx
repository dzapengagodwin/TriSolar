import Image from "next/image"
import { StoreBrand } from "@lib/data/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

export default function BrandDirectoryTemplate({
  brands,
}: {
  brands: StoreBrand[]
}) {
  return (
    <div className="py-8 sm:py-12 content-container space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xs text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-laptopzone-orange bg-laptopzone-orange/10 px-3 py-1 rounded-full">
          Brand Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Shop by Official Brands
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-normal max-w-xl mx-auto leading-relaxed">
          Discover genuine laptops, desktop workstations, printers, and gaming hardware from the world&apos;s leading manufacturers.
        </p>
      </div>

      {/* Brands Grid */}
      {brands && brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {brands.map((brand) => {
            const handleKey = brand.handle.toLowerCase().trim()
            const localLogo = LOCAL_BRAND_LOGOS[handleKey]
            const isProductPhoto =
              brand.logo &&
              (brand.logo.includes("/wp-content/uploads/") ||
                brand.logo.includes("/products/") ||
                brand.logo.includes("laptopzone.co.zw/wp-content"))
            const logo = localLogo || (!isProductPhoto ? brand.logo : null) || null
            const count = brand.total_products || brand.products_count || 0

            return (
              <LocalizedClientLink
                key={brand.id}
                href={`/brands/${brand.handle}`}
                className="group bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-gray-300 rounded-3xl p-5 flex flex-col items-center justify-between text-center transition-all duration-300 shadow-xs hover:shadow-md h-48 sm:h-52"
              >
                <div className="w-full flex-1 flex items-center justify-center p-2">
                  {logo ? (
                    <div className="relative w-full h-16 sm:h-20 flex items-center justify-center">
                      <Image
                        src={logo}
                        alt={`${brand.name} logo`}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 160px"
                        className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-laptopzone-orange/10 text-laptopzone-orange rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1 w-full pt-2 border-t border-gray-50">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-laptopzone-orange transition-colors line-clamp-1 block">
                    {brand.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 block">
                    {count} {count === 1 ? "Product" : "Products"}
                  </span>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-2xl">
            🏷️
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            No brands found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Brand directories are being cataloged. Browse our full store in the meantime.
          </p>
          <LocalizedClientLink
            href="/store"
            className="inline-block bg-black hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-full transition-colors shadow-sm"
          >
            Browse Store
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
