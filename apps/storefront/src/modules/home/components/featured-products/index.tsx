import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

type FeaturedSectionConfig = {
  title: string
  categoryHandle: string
  viewAllHref: string
}

export const FEATURED_SECTIONS: FeaturedSectionConfig[] = [
  {
    title: "POPULAR LAPTOPS",
    categoryHandle: "laptops",
    viewAllHref: "/categories/laptops",
  },
  {
    title: "POPULAR DESKTOPS",
    categoryHandle: "desktops",
    viewAllHref: "/categories/desktops",
  },
  {
    title: "PRINTERS FOR SALE",
    categoryHandle: "printers_for_sale",
    viewAllHref: "/categories/printers_for_sale",
  },
  {
    title: "MOBILE PHONES",
    categoryHandle: "mobile-phones-zimbabwe",
    viewAllHref: "/categories/mobile-phones-zimbabwe",
  },
  {
    title: "POPULAR ACCESSORIES",
    categoryHandle: "mobile-accessories",
    viewAllHref: "/categories/mobile-accessories",
  },
  {
    title: "POPULAR NETWORKING DEVICES",
    categoryHandle: "networking",
    viewAllHref: "/categories/networking",
  },
]

export default async function FeaturedProducts({
  categories,
  region,
  sectionIndex,
}: {
  categories?: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  sectionIndex?: number
}) {
  // If a specific section index is provided, render only that section
  if (typeof sectionIndex === "number") {
    const config = FEATURED_SECTIONS[sectionIndex]
    if (!config) return null

    const targetCategory = categories?.find((c) =>
      c.handle?.toLowerCase() === config.categoryHandle
    )

    if (!targetCategory) return null

    return (
      <ProductRail
        categoryId={targetCategory.id}
        viewAllHref={config.viewAllHref}
        region={region}
        title={config.title}
      />
    )
  }

  // Otherwise, render all sections sequentially
  return (
    <div className="space-y-2">
      {FEATURED_SECTIONS.map((config) => {
        const targetCategory = categories?.find((c) =>
          c.handle?.toLowerCase() === config.categoryHandle
        )

        if (!targetCategory) return null

        return (
          <ProductRail
            key={config.title}
            categoryId={targetCategory.id}
            viewAllHref={config.viewAllHref}
            region={region}
            title={config.title}
          />
        )
      })}
    </div>
  )
}
