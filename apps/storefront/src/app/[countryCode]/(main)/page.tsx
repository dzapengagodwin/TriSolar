import { Metadata } from "next"

import TritechHomeHero from "@modules/home/components/tritech-home-hero"
import MonthlyDeals from "@modules/home/components/monthly-deals"
import TopBrands from "@modules/home/components/top-brands"
import FeaturedProducts from "@modules/home/components/featured-products"
import TopCategories from "@modules/home/components/top-categories"
import TrustBar from "@modules/home/components/trust-bar"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listBrands } from "@lib/data/brands"
import { getRegion } from "@lib/data/regions"
import { getPageSeo } from "@lib/data/seo"
import { generatePageMetadata } from "@lib/seo/page"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import SearchBar from "@modules/layout/components/search-bar"

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

  const [productsRes, brands, categories] = await Promise.all([
    region
      ? listProducts({
          regionId: region.id,
          queryParams: { limit: 10 },
        }).catch(() => ({ response: { products: [] } }))
      : Promise.resolve({ response: { products: [] } }),
    listBrands({ limit: 20 }).catch(() => []),
    listCategories(),
  ])

  const products = productsRes.response?.products || []

  // Include a top-level category only when it or one of its descendants
  // has at least one product assigned in the Medusa catalog.
  const categoriesWithProducts = new Set<string>()

  for (const category of categories) {
    if (!category.products?.length) {
      continue
    }

    let currentCategory: (typeof categories)[number] | undefined = category

    while (currentCategory) {
      categoriesWithProducts.add(currentCategory.id)
      const parentId = currentCategory.parent_category_id
      currentCategory = parentId
        ? categories.find((candidate) => candidate.id === parentId)
        : undefined
    }
  }

  const homepageCategories = categories
    .filter(
      (category) =>
        !category.parent_category_id && categoriesWithProducts.has(category.id)
    )
    .slice(0, 8)

  if (!region) {
    return null
  }

  return (
    <div className="min-h-screen bg-white pb-0">
      <section className="bg-slate-950 py-8 text-white sm:py-12">
        <div className="content-container space-y-4 sm:space-y-5">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Shop computers, networking &amp; IT hardware
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Find the tech you need. Shop TRITECH.
            </h1>
            <p className="text-sm text-slate-300">
              Search products or browse categories to find the right gear for
              work, home, and business.
            </p>
          </div>
          <div className="max-w-3xl rounded-lg bg-white p-1">
            <SearchBar categories={categories} />
          </div>
          <LocalizedClientLink
            href="/shop"
            className="inline-flex text-xs font-semibold text-white underline decoration-blue-400 underline-offset-4 hover:text-blue-200"
          >
            Browse all products
          </LocalizedClientLink>
        </div>
      </section>
      <TopCategories categories={homepageCategories} />
      {products.length > 0 && (
        <section className="content-container py-6 sm:py-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wide text-gray-900 sm:text-lg">
                Popular products
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Shop products available from our catalog.
              </p>
            </div>
            <LocalizedClientLink
              href="/shop"
              className="shrink-0 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              View all
            </LocalizedClientLink>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <FeaturedProducts region={region} />
      <MonthlyDeals products={products} region={region} />
      <TopBrands brands={brands} />
      <TrustBar />
      <TritechHomeHero />
    </div>
  )
}
