import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collectionId,
  categoryId,
  region,
  title,
}: {
  collectionId?: string
  categoryId?: string
  region: HttpTypes.StoreRegion
  title: string
}) {
  let pricedProducts: HttpTypes.StoreProduct[] = []

  const queryParams: HttpTypes.StoreProductParams = {
    limit: 10,
    fields: "*variants.calculated_price,*categories",
  }

  // Only filter if we have a valid filter ID
  if (categoryId) {
    queryParams.category_id = [categoryId]
  } else if (collectionId) {
    queryParams.collection_id = [collectionId]
  }

  // If no filter is present, don't query and return null (removes fallback)
  if (categoryId || collectionId) {
    const res = await listProducts({
      regionId: region.id,
      queryParams,
    }).catch(() => null)

    if (res?.response?.products?.length) {
      pricedProducts = res.response.products
    }
  }

  // If no products matched the filter, don't show the rail (removes fallback)
  if (pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="content-container py-8">
      {/* Centered Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
          {title}
        </h2>
      </div>

      {/* 5 Columns Product Grid */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
