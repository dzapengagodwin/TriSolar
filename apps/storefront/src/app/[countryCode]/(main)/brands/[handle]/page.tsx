import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandByHandle, listBrands } from "@lib/data/brands"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import BrandTemplate from "@modules/brands/templates"
import BreadcrumbJsonLd from "@modules/common/components/breadcrumb-json-ld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { generateBrandMetadata } from "@lib/seo/brand"
import { getCanonicalUrl, getBrandCanonicalUrl } from "@lib/seo/canonical"
import { getBrandSeo } from "@lib/data/seo"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
      optionValueIds?: string | string[]
      minPrice?: string
      maxPrice?: string
      view?: "grid" | "list"
    }
  >
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const brands = await listBrands({ limit: 100 }).catch(() => [])

  if (!brands || brands.length === 0) {
    return []
  }

  const countryCodes = await listRegions()
    .then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )
    .catch(() => [])

  const brandHandles = brands.map((b) => b.handle)

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      brandHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const brand = await getBrandByHandle(params.handle)
  if (!brand) {
    notFound()
  }

  const seo = await getBrandSeo(params.handle)
  return generateBrandMetadata(brand, params.countryCode, seo)
}

export default async function BrandPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, minPrice, maxPrice, view } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const brand = await getBrandByHandle(params.handle)
  if (!brand) {
    notFound()
  }

  const breadcrumbItems = [
    {
      name: "Home",
      url: getCanonicalUrl("", params.countryCode),
    },
    {
      name: "Brands",
      url: getCanonicalUrl("/brands", params.countryCode),
    },
    {
      name: brand.name,
      url: getBrandCanonicalUrl(brand.handle, params.countryCode),
    },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BrandTemplate
        brand={brand}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
        optionValueIds={optionValueIds}
        minPrice={minPrice ? Number(minPrice) : undefined}
        maxPrice={maxPrice ? Number(maxPrice) : undefined}
        viewMode={view === "list" ? "list" : "grid"}
      />
    </>
  )
}
