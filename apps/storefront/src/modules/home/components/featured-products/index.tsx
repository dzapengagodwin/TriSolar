import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  categories,
  region,
  sectionIndex = 0,
}: {
  collections?: HttpTypes.StoreCollection[]
  categories?: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  sectionIndex?: number
}) {
  const titles = ["Popular Laptops", "Popular Desktops", "Printers for Sale"]
  const searchKeywords = ["laptop", "desktop", "printer"]
  
  const keyword = searchKeywords[sectionIndex]
  const title = titles[sectionIndex]

  // Find matching category first (WooCommerce migrations usually import as categories)
  const targetCategory = categories?.find(
    (c) =>
      c.handle?.toLowerCase().includes(keyword) ||
      c.name?.toLowerCase().includes(keyword)
  )

  // Find matching collection as fallback
  const targetCollection = collections?.find(
    (c) =>
      c.handle?.toLowerCase().includes(keyword) ||
      c.title?.toLowerCase().includes(keyword)
  )

  return (
    <ProductRail
      collectionId={targetCollection?.id}
      categoryId={targetCategory?.id}
      region={region}
      title={title}
    />
  )
}
