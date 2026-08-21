import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

const GAMING_KEYWORDS = [
  "gaming",
  "game",
  "esports",
  "pc",
  "desktop",
  "gamer",
]

export default function GamingSection({
  categories,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) {
  const gamingCategories = (categories || [])
    .filter((c) =>
      GAMING_KEYWORDS.some(
        (kw) =>
          c.name?.toLowerCase().includes(kw) ||
          c.handle?.toLowerCase().includes(kw)
      )
    )
    .slice(0, 8)

  if (gamingCategories.length === 0) {
    return null
  }

  return (
    <section className="py-6 sm:py-8" aria-label="Gaming Categories">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
            GAMING
          </h2>
          <LocalizedClientLink
            href="/store?q=gaming"
            className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <svg
              className="w-3.5 h-3.5"
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
          </LocalizedClientLink>
        </div>

        {/* 4x2 Grid on desktop, 2 cols on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {gamingCategories.map((cat) => {
            const image =
              (cat.metadata?.image as string) ||
              (cat.metadata?.thumbnail as string) ||
              (cat.metadata?.icon as string) ||
              null

            return (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="group bg-[#fbf4f0] hover:bg-[#f6eee9] rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between border border-[#f0e6e0] hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 min-h-[190px] sm:min-h-[230px]"
              >
                {/* Category Image */}
                <div className="relative w-full h-28 sm:h-36 flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 250px"
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12 opacity-20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <span className="font-bold text-xs sm:text-sm text-gray-900 text-center tracking-tight mt-3 group-hover:text-primary transition-colors">
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
