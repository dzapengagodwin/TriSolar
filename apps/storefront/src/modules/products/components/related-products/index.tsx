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

  const categories = product.categories || []
  const categoryIds = categories.map((c) => c.id).filter(Boolean) as string[]

  let relatedProducts: HttpTypes.StoreProduct[] = []

  if (categoryIds.length > 0) {
    // Prefer the most specific (child) category if available
    const childCategories = categories.filter(
      (c) => Boolean(c.parent_category_id || c.parent_category)
    )
    const primaryCategory = childCategories[0] || categories[0]

    // 1. Fetch products from the primary / specific category
    const { response } = await listProducts({
      queryParams: {
        category_id: [primaryCategory.id],
        region_id: region.id,
        is_giftcard: false,
        limit: 10,
      },
      countryCode,
    })

    relatedProducts = response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )

    // 2. If fewer than 4 products were found and the product belongs to multiple categories,
    // fetch from remaining categories to fill up the row
    if (relatedProducts.length < 4 && categoryIds.length > 1) {
      const remainingCatIds = categoryIds.filter((id) => id !== primaryCategory.id)
      if (remainingCatIds.length > 0) {
        const { response: fallbackResponse } = await listProducts({
          queryParams: {
            category_id: remainingCatIds,
            region_id: region.id,
            is_giftcard: false,
            limit: 10,
          },
          countryCode,
        })

        const existingIds = new Set([product.id, ...relatedProducts.map((p) => p.id)])
        const additional = fallbackResponse.products.filter(
          (p) => !existingIds.has(p.id)
        )
        relatedProducts = [...relatedProducts, ...additional]
      }
    }
  } else {
    // Fallback for products without any categories assigned
    const queryParams: HttpTypes.StoreProductListParams = {
      limit: 10,
      region_id: region.id,
      is_giftcard: false,
    }
    if (product.collection_id) {
      queryParams.collection_id = [product.collection_id]
    }

    const { response } = await listProducts({
      queryParams,
      countryCode,
    })

    relatedProducts = response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  }

  // Limit to single row (max 4 products)
  const singleRowProducts = relatedProducts.slice(0, 4)

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
