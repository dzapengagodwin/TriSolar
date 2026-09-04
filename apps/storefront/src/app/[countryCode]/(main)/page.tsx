import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import TopCategories from "@modules/home/components/top-categories"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import GamingSection from "@modules/home/components/gaming-section"
import TopBrands from "@modules/home/components/top-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { STATIC_BRANDS } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import { HOMEPAGE_FEATURED_CATEGORIES } from "@lib/constants/categories"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Laptopzone | Laptops, Computers & Tech Store",
  description:
    "Laptopzone - Premium Laptops, Computers, Tech & Accessories. High performance e-commerce store.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode).catch(() => null)

  const [collectionsRes, featuredCollection, productsRes, categories] = await Promise.all([
    listCollections({ fields: "id, handle, title" }).catch(() => ({ collections: [] })),
    getCollectionByHandle("featured").catch(() => null),
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price,*categories" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
    listCategories({ limit: 50 }).catch(() => []),
  ])

  const collections = collectionsRes.collections || []
  const products = productsRes.response?.products || []
  const brands = STATIC_BRANDS

  if (!region) {
    return null
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-0">
      {/* 1. Hero Grid (Black Theme Banners) */}
      <Hero />

      {/* 2. Featured Laptops */}
      {featuredCollection && (
        <ProductRail
          collectionId={featuredCollection.id}
          limit={6}
          viewAllHref="/collections/featured"
          region={region}
          title="FEATURED LAPTOPS"
        />
      )}

      {/* 3. Top Categories Slider (6 Curated Categories) */}
      <TopCategories categories={HOMEPAGE_FEATURED_CATEGORIES} />

      {/* 4. Popular Product Rails */}
      <FeaturedProducts
        categories={categories}
        region={region}
      />

      {/* 5. Monthly Best Deals (Sleek Black Background Section) */}
      <MonthlyDeals
        products={products}
        region={region}
      />

      {/* 6. Gaming Categories Section */}
      <GamingSection />

      {/* 7. Top Brands Slider */}
      <TopBrands brands={brands} />

      {/* 8. 3-Pillar Guarantee Strip */}
      <TrustBar />
    </div>
  )
}
