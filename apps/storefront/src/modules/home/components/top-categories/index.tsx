import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { STATIC_CATEGORIES } from "@lib/constants/categories"

export default function TopCategories({
  categories = STATIC_CATEGORIES,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) {
  const displayCategories = (categories && categories.length > 0 ? categories : STATIC_CATEGORIES).slice(0, 6)

  return (
    <section className="py-6 sm:py-8 bg-white" aria-label="Top Categories">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
              TOP CATEGORIES
            </h2>
            <LocalizedClientLink
              href="/store"
              className="text-[11px] font-extrabold uppercase tracking-wider text-laptopzone-orange hover:text-laptopzone-navy transition-colors hidden sm:inline-block"
            >
              Browse All →
            </LocalizedClientLink>
          </div>

          <LocalizedClientLink
            href="/store"
            className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors sm:hidden"
          >
            Browse All →
          </LocalizedClientLink>
        </div>

        {/* 6 Static Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {displayCategories.map((cat) => {
            const imageSrc =
              (cat.metadata?.image as string) ||
              `/top-categories/${cat.handle}.png`

            return (
              <LocalizedClientLink
                key={cat.id || cat.handle}
                href={`/categories/${cat.handle}`}
                className="group bg-[#f8f9fa] hover:bg-[#f1f3f5] p-3 sm:p-4 flex flex-col items-center justify-between border border-gray-100 hover:border-black rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 min-h-[160px] sm:min-h-[180px]"
              >
                {/* Category Image */}
                <div className="relative w-full h-24 sm:h-28 flex items-center justify-center">
                  <Image
                    src={imageSrc}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
                  />
                </div>

                {/* Title */}
                <span className="font-bold text-xs text-gray-900 text-center tracking-tight mt-2 group-hover:text-primary transition-colors line-clamp-2">
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
