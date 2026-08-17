import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import FeaturedProducts from "@modules/home/components/featured-products"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
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

  const [collectionsRes, categories, productsRes] = await Promise.all([
    listCollections({ fields: "id, handle, title" }).catch(() => ({ collections: [] })),
    listCategories().catch(() => []),
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10, fields: "*variants.calculated_price,*categories" },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
  ])

  const collections = collectionsRes.collections || []
  const products = productsRes.response?.products || []

  if (!region) {
    return null
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-0">
      {/* 1. Hero Grid (Black Theme Banners) */}
      <Hero />

      {/* 2. 5 Vertical Deal Cards Row (Catalogue, RedStar Clearance, Flash Sale, Galaxy Z8, Smart Air) */}
      {/* <PromoCardsRow /> */}

      {/* 3. Monthly Best Deals (Sleek Black Background Section) */}
   <MonthlyDeals
        products={products}
        region={region}
      />

      {/* 4. Deep Deals by Category (Avatars + Coupon Banner) */}
      {/* {categories.length > 0 && <CategoryAvatars categories={categories} />} */}

      {/* 5. Popular Products Grid */}
      <div className="space-y-4">
        <FeaturedProducts collections={collections} categories={categories} region={region} sectionIndex={0} />
        <FeaturedProducts collections={collections} categories={categories} region={region} sectionIndex={1} />
        <FeaturedProducts collections={collections} categories={categories} region={region} sectionIndex={2} />
      </div>
    

      {/* 8. 3-Pillar Guarantee Strip */}
      <TrustBar />
    </div>
  )
}
