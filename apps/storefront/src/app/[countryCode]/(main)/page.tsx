import { Metadata } from "next"

import TritechHomeHero from "@modules/home/components/tritech-home-hero"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import TopBrands from "@modules/home/components/top-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { listBrands } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { getPageSeo } from "@lib/data/seo"
import { generatePageMetadata } from "@lib/seo/page"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const seo = await getPageSeo("home")

  return generatePageMetadata(
    {
      path: "/",
    },
    params.countryCode,
    seo
  )
}

export default async function Home(props: Props) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode).catch(() => null)

  const [productsRes, brands] = await Promise.all([
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price,*categories,*images" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
    listBrands({ limit: 20 }).catch(() => []),
  ])

  const products = productsRes.response?.products || []

  if (!region) {
    return null
  }

  return (
    <div className="min-h-screen bg-white pb-0">
      <TritechHomeHero />
      <FeaturedProducts region={region} fallbackProducts={products} />
      <MonthlyDeals products={products} region={region} />
      <TopBrands brands={brands} />
      <TrustBar />
    </div>
  )
}
