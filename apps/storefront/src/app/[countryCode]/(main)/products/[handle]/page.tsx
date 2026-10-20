import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getProductSeo } from "@lib/data/seo"
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

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
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

  const seo = await getProductSeo(product.id || handle)

  return generateProductMetadata(product, countryCode, seo)
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const { countryCode, handle } = params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const [pricedProduct, seo] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: { handle },
    }).then(({ response }) => response.products[0]),
    getProductSeo(handle),
  ])

  if (!pricedProduct) {
    notFound()
  }

  const images = pricedProduct.images ?? []

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
        seo={seo}
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
