import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
  sectionIndex = 0,
}: {
  collections?: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
  sectionIndex?: number
}) {
  const titles = ["Popular Laptops", "Popular Desktops", "Printers for Sale"]
  
  const targetCollection = collections && collections.length > 0 
    ? collections[sectionIndex % collections.length]
    : undefined

  const title = titles[sectionIndex] || (targetCollection?.title ?? "Featured Products")

  return <ProductRail collection={targetCollection} region={region} title={title} sectionIndex={sectionIndex} />
}
