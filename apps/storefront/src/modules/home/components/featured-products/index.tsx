import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

type FeaturedSectionConfig = {
  title: string
  keywords: string[]
  searchQuery?: string
  fallbackToAll?: boolean
  viewAllHref: string
}

export const FEATURED_SECTIONS: FeaturedSectionConfig[] = [
  {
    title: "BEST SELLING LAPTOPS",
    keywords: ["laptop", "notebook", "macbook", "laptops"],
    searchQuery: "laptop",
    viewAllHref: "/store?q=laptop",
  },
  {
    title: "POPULAR GAMING PCS",
    keywords: ["gaming-pcs", "gaming pc", "gaming desktop", "desktop", "gaming", "pc"],
    searchQuery: "gaming pc",
    viewAllHref: "/store?q=gaming+pc",
  },
  {
    title: "TOP MONITORS",
    keywords: ["monitor", "monitors", "display", "screen", "displays"],
    searchQuery: "monitor",
    viewAllHref: "/store?q=monitors",
  },
  {
    title: "POPULAR NETWORKING DEVICES",
    keywords: [
      "networking",
      "network",
      "router",
      "routers",
      "switch",
      "switches",
      "access point",
      "ubiquiti",
      "cables",
    ],
    searchQuery: "networking",
    viewAllHref: "/store?q=networking",
  },
  {
    title: "FEATURED MOBILE PHONES",
    keywords: [
      "mobile",
      "phone",
      "phones",
      "smartphones",
      "smartphone",
      "iphone",
      "cellular",
      "galaxy",
    ],
    searchQuery: "phone",
    viewAllHref: "/store?q=phone",
  },
  {
    title: "POPULAR HEADPHONES",
    keywords: [
      "headphone",
      "headphones",
      "headset",
      "audio",
      "earphones",
      "earbuds",
    ],
    searchQuery: "headphones",
    viewAllHref: "/store?q=headphones",
  },
  {
    title: "ITEMS YOU MAY LIKE",
    keywords: [],
    searchQuery: undefined,
    fallbackToAll: true,
    viewAllHref: "/store",
  },
]

export default async function FeaturedProducts({
  collections,
  categories,
  region,
  sectionIndex,
}: {
  collections?: HttpTypes.StoreCollection[]
  categories?: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  sectionIndex?: number
}) {
  // If a specific section index is provided, render only that section
  if (typeof sectionIndex === "number") {
    const config = FEATURED_SECTIONS[sectionIndex]
    if (!config) return null

    const targetCategory = categories?.find((c) =>
      config.keywords.some(
        (kw) =>
          c.handle?.toLowerCase().includes(kw) ||
          c.name?.toLowerCase().includes(kw)
      )
    )

    const targetCollection = collections?.find((c) =>
      config.keywords.some(
        (kw) =>
          c.handle?.toLowerCase().includes(kw) ||
          c.title?.toLowerCase().includes(kw)
      )
    )

    return (
      <ProductRail
        collectionId={targetCollection?.id}
        categoryId={targetCategory?.id}
        searchQuery={!targetCategory && !targetCollection ? config.searchQuery : undefined}
        fallbackToAll={config.fallbackToAll}
        viewAllHref={config.viewAllHref}
        region={region}
        title={config.title}
      />
    )
  }

  // Otherwise, render all 7 sections sequentially
  return (
    <div className="space-y-2">
      {FEATURED_SECTIONS.map((config) => {
        const targetCategory = categories?.find((c) =>
          config.keywords.some(
            (kw) =>
              c.handle?.toLowerCase().includes(kw) ||
              c.name?.toLowerCase().includes(kw)
          )
        )

        const targetCollection = collections?.find((c) =>
          config.keywords.some(
            (kw) =>
              c.handle?.toLowerCase().includes(kw) ||
              c.title?.toLowerCase().includes(kw)
          )
        )

        return (
          <ProductRail
            key={config.title}
            collectionId={targetCollection?.id}
            categoryId={targetCategory?.id}
            searchQuery={!targetCategory && !targetCollection ? config.searchQuery : undefined}
            fallbackToAll={config.fallbackToAll}
            viewAllHref={config.viewAllHref}
            region={region}
            title={config.title}
          />
        )
      })}
    </div>
  )
}
