import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import ProductJsonLd from "@modules/products/components/product-json-ld"
import BreadcrumbJsonLd from "@modules/common/components/breadcrumb-json-ld"
import { generateProductMetadata } from "@lib/seo/product"
import {
  getCanonicalUrl,
  getCategoryCanonicalUrl,
  getProductCanonicalUrl,
} from "@lib/seo/canonical"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return generateProductMetadata(product, countryCode)
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const { countryCode, handle } = params
  const region = await getRegion(countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  // Construct Breadcrumb navigation hierarchy
  const primaryCategory = pricedProduct.categories?.[0]
  const breadcrumbItems = [
    {
      name: "Home",
      url: getCanonicalUrl("", countryCode),
    },
  ]

  if (primaryCategory?.name && primaryCategory?.handle) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      url: getCategoryCanonicalUrl(primaryCategory.handle, countryCode),
    })
  }

  breadcrumbItems.push({
    name: pricedProduct.title,
    url: getProductCanonicalUrl(pricedProduct.handle, countryCode),
  })

  return (
    <>
      <ProductJsonLd
        product={pricedProduct}
        countryCode={countryCode}
        currencyCode={region.currency_code}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={countryCode}
        images={images ?? []}
      />
    </>
  )
}
