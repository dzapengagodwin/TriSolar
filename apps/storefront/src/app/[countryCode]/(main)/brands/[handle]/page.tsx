import { Metadata } from "next"
import { getBrandByHandle, listBrands, StoreBrand } from "@lib/data/brands"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import BrandTemplate from "@modules/brands/templates"
import BreadcrumbJsonLd from "@modules/common/components/breadcrumb-json-ld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { generateBrandMetadata } from "@lib/seo/brand"
import { getCanonicalUrl, getBrandCanonicalUrl } from "@lib/seo/canonical"

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

function formatBrandName(handle: string): string {
  return handle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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
  const brand = (await getBrandByHandle(params.handle)) || {
    id: `brand_${params.handle}`,
    name: formatBrandName(params.handle),
    handle: params.handle,
    description: `Browse authentic products from ${formatBrandName(params.handle)} at LaptopZone.`,
  }

  return generateBrandMetadata(brand, params.countryCode)
}

export default async function BrandPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, minPrice, maxPrice, view } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const fetchedBrand = await getBrandByHandle(params.handle)

  const brand: StoreBrand = fetchedBrand || {
    id: `brand_${params.handle}`,
    name: formatBrandName(params.handle),
    handle: params.handle,
    description: `Browse genuine ${formatBrandName(params.handle)} hardware, computers, and accessories.`,
    products_count: 0,
    total_products: 0,
    product_ids: [],
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
