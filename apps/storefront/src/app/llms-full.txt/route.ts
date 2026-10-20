import { listBrands } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import {
  getBrandCanonicalUrl,
  getCanonicalUrl,
  getCategoryCanonicalUrl,
  getProductCanonicalUrl,
} from "@lib/seo/canonical"
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_SITE_DESCRIPTION,
  STORE_URL,
} from "@lib/seo/constants"
import { HttpTypes } from "@medusajs/types"
import type { StoreBrand } from "@lib/constants/brands"

export const dynamic = "force-dynamic"
export const revalidate = 3600

function cleanText(value: unknown): string {
  if (typeof value !== "string") {
    return ""
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/([\\`*_{}\[\]()#+.!|>])/g, "\\$1")
}

function flattenCategories(
  categories: HttpTypes.StoreProductCategory[]
): HttpTypes.StoreProductCategory[] {
  const seen = new Set<string>()
  const flattened: HttpTypes.StoreProductCategory[] = []
  const visit = (category: HttpTypes.StoreProductCategory) => {
    if (seen.has(category.id)) {
      return
    }
    seen.add(category.id)
    flattened.push(category)
    category.category_children?.forEach(visit)
  }

  categories.forEach(visit)
  return flattened
}

async function getAllCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  const limit = 100
  const categories: HttpTypes.StoreProductCategory[] = []
  let offset = 0

  while (true) {
    const batch = await listCategories({ limit, offset })
    categories.push(...batch)

    if (batch.length < limit) {
      return flattenCategories(categories)
    }

    offset += batch.length
  }
}

async function getAllBrands(): Promise<StoreBrand[]> {
  const limit = 100
  const brands: StoreBrand[] = []
  let offset = 0

  while (true) {
    const batch = await listBrands({ limit, offset })
    brands.push(...batch)

    if (batch.length < limit) {
      return brands
    }

    offset += batch.length
  }
}

async function getAllProducts(): Promise<HttpTypes.StoreProduct[]> {
  const limit = 100
  const products: HttpTypes.StoreProduct[] = []
  let offset = 0
  let count = Number.POSITIVE_INFINITY

  while (offset < count) {
    const { response } = await listProducts({
      countryCode: DEFAULT_COUNTRY_CODE,
      queryParams: {
        limit,
        offset,
      },
    })

    products.push(...response.products)
    count = response.count

    if (response.products.length === 0) {
      break
    }

    offset += response.products.length
  }

  return products.filter(
    (product) =>
      product.handle &&
      product.metadata?.noindex !== true &&
      product.metadata?.seo_index !== false
  )
}

function renderProduct(product: HttpTypes.StoreProduct): string {
  const title = cleanText(product.title) || "Product"
  const url = getProductCanonicalUrl(product.handle, DEFAULT_COUNTRY_CODE)
  const description = cleanText(product.description)
  const brand = cleanText(product.metadata?.brand)
  const categories = (product.categories || [])
    .map((category) => cleanText(category.name))
    .filter(Boolean)
  const variants = (product.variants || [])
    .map((variant) => {
      const optionValues = (product.options || [])
        .map((option) => {
          const value = variant.options?.find(
            (variantOption) => variantOption.option_id === option.id
          )?.value
          const optionTitle = cleanText(option.title)
          const optionValue = cleanText(value)
          return optionTitle && optionValue
            ? `${optionTitle}: ${optionValue}`
            : optionValue
        })
        .filter(Boolean)

      return optionValues.length > 0 ? `  - ${optionValues.join("; ")}` : null
    })
    .filter((variant): variant is string => Boolean(variant))

  return [
    `### [${title}](${url})`,
    description ? description : null,
    brand ? `Brand: ${brand}` : null,
    categories.length > 0 ? `Categories: ${categories.join(", ")}` : null,
    variants.length > 0 ? `Available configurations:\n${variants.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")
}

function renderBrand(brand: StoreBrand): string | null {
  if (!brand.handle || !brand.name) {
    return null
  }

  const name = cleanText(brand.name)
  const description = cleanText(brand.description)
  return [
    `- [${name}](${getBrandCanonicalUrl(brand.handle, DEFAULT_COUNTRY_CODE)})`,
    description ? `  ${description}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

export async function GET() {
  const [products, categories, brands] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllBrands(),
  ])

  const categoryLines = categories
    .filter((category) => category.handle && category.name)
    .map(
      (category) =>
        `- [${cleanText(category.name)}](${getCategoryCanonicalUrl(
          category.handle,
          DEFAULT_COUNTRY_CODE
        )})`
    )

  const brandLines = brands.map(renderBrand).filter((line): line is string => Boolean(line))
  const productSections = products.map(renderProduct)
  const baseUrl = STORE_URL.replace(/\/+$/, "")

  const content = [
    "# Laptopzone: Full Store and Product Catalog",
    "",
    `> ${DEFAULT_SITE_DESCRIPTION}`,
    "",
    "Laptopzone is a Zimbabwean technology retailer. The storefront offers laptops, desktop computers, mobile phones, printers, monitors, networking equipment, and computer accessories from established technology brands.",
    "",
    "## Important catalog notes",
    "",
    "This document is generated from the live storefront catalog. Product availability, prices, descriptions, and configurations can change. Follow each product link for current details before making a purchase. Variant options below describe available product configurations; they are not a guarantee of current stock.",
    "",
    "Prices are not reproduced here because they may vary by region and change over time. The live product page is authoritative for current price, stock, warranty, and delivery information.",
    "",
    "## Store pages",
    "",
    `- [Home](${getCanonicalUrl("", DEFAULT_COUNTRY_CODE)})`,
    `- [Shop all products](${getCanonicalUrl("/shop", DEFAULT_COUNTRY_CODE)})`,
    `- [Brand directory](${getCanonicalUrl("/brands", DEFAULT_COUNTRY_CODE)})`,
    `- [Frequently asked questions](${getCanonicalUrl("/faq", DEFAULT_COUNTRY_CODE)})`,
    `- [Customer help](${getCanonicalUrl("/customer-help", DEFAULT_COUNTRY_CODE)})`,
    `- [Contact Laptopzone](${getCanonicalUrl("/contact-us", DEFAULT_COUNTRY_CODE)})`,
    `- [Delivery terms](${getCanonicalUrl("/delivery-terms", DEFAULT_COUNTRY_CODE)})`,
    `- [Returns and refunds](${getCanonicalUrl("/returns-and-refunds", DEFAULT_COUNTRY_CODE)})`,
    `- [Terms and conditions](${getCanonicalUrl("/terms-and-conditions", DEFAULT_COUNTRY_CODE)})`,
    `- [Privacy policy](${getCanonicalUrl("/privacy-policy", DEFAULT_COUNTRY_CODE)})`,
    `- [Track an order](${getCanonicalUrl("/track-order", DEFAULT_COUNTRY_CODE)})`,
    "",
    "## Product categories",
    "",
    ...(categoryLines.length > 0 ? categoryLines : ["No categories are currently available."]),
    "",
    "## Brands",
    "",
    ...(brandLines.length > 0 ? brandLines : ["No brands are currently available."]),
    "",
    `## Current products (${products.length})`,
    "",
    ...(productSections.length > 0
      ? productSections
      : ["No products are currently available in the catalog."]),
    "",
    "## Sitemaps",
    "",
    `- [Sitemap index](${baseUrl}/sitemap.xml)`,
    `- [Product sitemap](${baseUrl}/product-sitemap.xml)`,
    `- [Category sitemap](${baseUrl}/category-sitemap.xml)`,
    `- [Brand sitemap](${baseUrl}/brand-sitemap.xml)`,
    `- [Informational pages sitemap](${baseUrl}/pages-sitemap.xml)`,
    "",
  ].join("\n")

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
