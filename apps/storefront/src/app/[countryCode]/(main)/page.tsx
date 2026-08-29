import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import TopCategories from "@modules/home/components/top-categories"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import GamingSection from "@modules/home/components/gaming-section"
import TopBrands from "@modules/home/components/top-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { STATIC_BRANDS } from "@lib/data/brands"
import { STATIC_CATEGORIES } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Laptop Zone | Laptops, Computers & Tech Store",
  description:
    "Laptop Zone - Premium Laptops, Computers, Tech & Accessories. High performance e-commerce store.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode).catch(() => null)

  const [collectionsRes, productsRes] = await Promise.all([
    listCollections({ fields: "id, handle, title" }).catch(() => ({ collections: [] })),
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price,*categories" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
  ])

  const collections = collectionsRes.collections || []
  const products = productsRes.response?.products || []
  const brands = STATIC_BRANDS
  const categories = STATIC_CATEGORIES

  if (!region) {
    return null
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-0">
      {/* 1. Hero Grid (Black Theme Banners) */}
      <Hero />

      {/* 2. Top Categories Slider */}
      <TopCategories categories={categories} />

      {/* 3. Monthly Best Deals (Sleek Black Background Section) */}
      <MonthlyDeals
        products={products}
        region={region}
      />

      {/* 4. Featured Products Rails */}
      <FeaturedProducts
        collections={collections}
        categories={categories}
        region={region}
      />

      {/* 5. Gaming Categories Section */}
      <GamingSection categories={categories} />

      {/* 6. Top Brands Slider */}
      <TopBrands brands={brands} />

      {/* 7. 3-Pillar Guarantee Strip */}
      <TrustBar />
    </div>
  )
}
