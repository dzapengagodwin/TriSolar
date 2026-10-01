import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import BreadcrumbJsonLd from "@modules/common/components/breadcrumb-json-ld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { generateCategoryMetadata } from "@lib/seo/category"
import { getCanonicalUrl, getCategoryCanonicalUrl } from "@lib/seo/canonical"
import { getCategorySeo } from "@lib/data/seo"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
      minPrice?: string
      maxPrice?: string
      view?: "grid" | "list"
    }
  >
}

export async function generateStaticParams() {
  const product_categories = await listCategories().catch(() => [])

  if (!product_categories || product_categories.length === 0) {
    return []
  }

  const countryCodes = await listRegions()
    .then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )
    .catch(() => [])

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) {
      notFound()
    }
    const seo = await getCategorySeo(productCategory.id)
    return generateCategoryMetadata(productCategory, params.countryCode, seo)
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, minPrice, maxPrice, view } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  const breadcrumbItems = [
    {
      name: "Home",
      url: getCanonicalUrl("", params.countryCode),
    },
    {
      name: "Categories",
      url: getCanonicalUrl("/store", params.countryCode),
    },
    {
      name: productCategory.name,
      url: getCategoryCanonicalUrl(productCategory.handle, params.countryCode),
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Suspense
        fallback={
          <div className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-6">
            <div className="w-full small:w-[240px] h-64 bg-gray-50 animate-pulse rounded-2xl" />
            <div className="w-full flex-1 min-w-0">
              <SkeletonProductGrid />
            </div>
          </div>
        }
      >
        <CategoryTemplate
          category={productCategory}
          sortBy={sortBy}
          page={page}
          countryCode={params.countryCode}
          optionValueIds={optionValueIds}
          minPrice={minPrice ? Number(minPrice) : undefined}
          maxPrice={maxPrice ? Number(maxPrice) : undefined}
          viewMode={view === "list" ? "list" : "grid"}
        />
      </Suspense>
    </>
  )
}
