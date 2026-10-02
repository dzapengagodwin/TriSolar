import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import NotFoundTemplate from "@modules/not-found/templates"

export const metadata: Metadata = {
  title: "404 - Page Not Found | Laptopzone",
  description:
    "The page you are looking for could not be found. Discover popular laptops, gaming PCs, and tech accessories at Laptopzone.",
}

export default async function NotFound() {
  const region =
    (await getRegion("zw").catch(() => null)) ||
    (await getRegion("").catch(() => null))

  let recommendedProducts: HttpTypes.StoreProduct[] = []

  if (region?.id) {
    const productsRes = await listProducts({
      regionId: region.id,
      queryParams: {
        limit: 4,
        fields: "*variants.calculated_price,*categories",
      },
    }).catch(() => ({ response: { products: [] } }))

    recommendedProducts = productsRes.response?.products || []
  }

  return (
    <NotFoundTemplate
      recommendedProducts={recommendedProducts}
      region={region}
      countryCode="zw"
    />
  )
}

