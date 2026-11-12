import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import ProductPreview from "@modules/products/components/product-preview"
import { getHomeFeaturedCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function FeaturedProducts({
  region,
  fallbackProducts = [],
}: {
  region: HttpTypes.StoreRegion
  fallbackProducts?: HttpTypes.StoreProduct[]
}) {
  const homeCollections = await getHomeFeaturedCollections()

  if (!homeCollections.length) {
    const products = fallbackProducts
      .filter((product) => Boolean(product.thumbnail || product.images?.length))
      .slice(0, 5)

    if (!products.length) return null

    return (
      <section className="content-container py-10 sm:py-14" id="best-sellers">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">Customer favourites</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#07152E] sm:text-3xl">Popular products</h2>
            <p className="mt-2 text-sm text-slate-500">Explore selected products available in the TRITECH store.</p>
          </div>
          <LocalizedClientLink href="/shop" className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-900 sm:text-sm">View all <span aria-hidden="true">→</span></LocalizedClientLink>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </section>
    )
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
