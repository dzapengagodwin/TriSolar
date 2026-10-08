import { Metadata } from "next"

import TopCategories from "@modules/home/components/top-categories"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import GamingSection from "@modules/home/components/gaming-section"
import TopBrands from "@modules/home/components/top-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { STATIC_BRANDS } from "@lib/data/brands"
import { HOMEPAGE_FEATURED_CATEGORIES } from "@lib/constants/categories"
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

  const [productsRes] = await Promise.all([
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price,*categories" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
  ])

  const products = productsRes.response?.products || []
  const brands = STATIC_BRANDS

  if (!region) {
    return null
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-0">
    {/* 1. Gaming Categories Section */}
      <GamingSection />

      {/* 2. Top Categories Slider (6 Curated Categories) */}
      <TopCategories categories={HOMEPAGE_FEATURED_CATEGORIES} />

      {/* 3. Curated Product Collections */}
      <FeaturedProducts region={region} />

      {/* 4. Monthly Best Deals (Sleek Black Background Section) */}
      <MonthlyDeals
        products={products}
        region={region}
      />

      {/* 5. Top Brands Slider */}
      <TopBrands brands={brands} />

      {/* 6. 3-Pillar Guarantee Strip */}
      <TrustBar />
    </div>
  )
}
