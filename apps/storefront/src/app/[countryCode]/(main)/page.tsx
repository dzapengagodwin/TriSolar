import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import CategoryAvatars from "@modules/home/components/category-avatars"
import FeaturedProducts from "@modules/home/components/featured-products"
import AppBanner from "@modules/home/components/app-banner"
import SellerGrid from "@modules/home/components/seller-grid"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "NexCart | TV, Audio, Home, Tech & Fashion E-Commerce Store",
  description:
    "NexCart - TV, Audio, Home & Tech. A building a scalable high performance e-commerce experience.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode).catch(() => null)

  const [collectionsRes, categories, productsRes] = await Promise.all([
    listCollections({ fields: "id, handle, title" }).catch(() => ({ collections: [] })),
    listCategories().catch(() => []),
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
  ])

  const collections = collectionsRes.collections || []
  const products = productsRes.response?.products || []

  if (!region) {
    return null
  }

  return (
    <div className="bg-[#F8FAF9] min-h-screen pb-12">
      {/* 1. Hero Grid (4 Pastel Banners) */}
      <Hero />

      {/* 2. Monthly Best Deals (#063A34 Forest Background Section) */}
      {products.length > 0 && <MonthlyDeals products={products} region={region} />}

      {/* 3. Deep Deals by Category (Avatars + Coupon Banner) */}
      {categories.length > 0 && <CategoryAvatars categories={categories} />}

      {/* 4. Popular Products Grid */}
      <div className="py-4">
        <FeaturedProducts collections={collections} region={region} sectionIndex={0} />
      </div>

      {/* 5. NexCart Mobile App Banner */}
      <AppBanner />

      {/* 6. Most Popular Seller Grid */}
      <SellerGrid />

      {/* 7. 3-Pillar Guarantee Strip */}
      <TrustBar />
    </div>
  )
}
