import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
  title,
}: {
  collection?: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  title?: string
  sectionIndex?: number
}) {
  let pricedProducts: HttpTypes.StoreProduct[] = []

  // 1. Query products by collection if collection exists
  if (collection?.id) {
    const res = await listProducts({
      regionId: region.id,
      queryParams: {
        collection_id: collection.id,
        fields: "*variants.calculated_price",
      },
    }).catch(() => null)

    if (res?.response?.products?.length) {
      pricedProducts = res.response.products
    }
  }

  // 2. Query products for region if collection query yielded 0 products
  if (!pricedProducts || pricedProducts.length === 0) {
    const res = await listProducts({
      regionId: region.id,
      queryParams: {
        limit: 10,
        fields: "*variants.calculated_price",
      },
    }).catch(() => null)

    if (res?.response?.products?.length) {
      pricedProducts = res.response.products
    }
  }

  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  const sectionTitle = title || collection?.title || "Featured Products"

  return (
    <div className="content-container py-8">
      {/* Centered Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
          {sectionTitle}
        </h2>
      </div>

      {/* 5 Columns Product Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
