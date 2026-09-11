import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import { getHomeFeaturedCollections } from "@lib/data/collections"

export default async function FeaturedProducts({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  // Dynamically discover all collections starting with "home-", sorted by metadata.priority
  const homeCollections = await getHomeFeaturedCollections()

  if (!homeCollections.length) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {homeCollections.map((collection) => (
        <ProductRail
          key={collection.id}
          collectionId={collection.id}
          limit={5}
          title={collection.title}
          viewAllHref={collection.viewAllHref}
          bannerImage={collection.bannerImage}
          region={region}
        />
      ))}
    </div>
  )
}
