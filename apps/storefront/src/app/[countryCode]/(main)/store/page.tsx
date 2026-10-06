import { Metadata } from "next"
import { Suspense } from "react"

import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "Store | Laptopzone",
  description: "Explore all of our products.",
  alternates: { canonical: "/shop" },
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  q?: string
  optionValueIds?: string | string[]
  minPrice?: string
  maxPrice?: string
  view?: "grid" | "list"
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, q, minPrice, maxPrice, view } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  return (
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
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        q={typeof q === "string" ? q : undefined}
        countryCode={params.countryCode}
        optionValueIds={optionValueIds}
        minPrice={minPrice ? Number(minPrice) : undefined}
        maxPrice={maxPrice ? Number(maxPrice) : undefined}
        viewMode={view === "list" ? "list" : "grid"}
      />
    </Suspense>
  )
}
