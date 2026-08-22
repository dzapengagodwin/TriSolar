import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {
    limit: 10,
  }
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  // Limit to single row (max 4 products)
  const singleRowProducts = products.slice(0, 4)

  if (!singleRowProducts.length) {
    return null
  }

  return (
    <div className="product-page-constraint py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
          Related Products
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          You might also want to check out these products
        </h2>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {singleRowProducts.map((p) => (
          <li key={p.id}>
            <Product region={region} product={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}
