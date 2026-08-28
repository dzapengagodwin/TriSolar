import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listBrands } from "@lib/data/brands"
import {
  getProductCanonicalUrl,
  getCategoryCanonicalUrl,
  getCollectionCanonicalUrl,
  getBrandCanonicalUrl,
  getCanonicalUrl,
} from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"

export const dynamic = "force-dynamic"
export const revalidate = 3600

type EntityWithUpdatedAt = {
  updated_at?: string | Date | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date()

  // 1. Static Indexable Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("", countryCode),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getCanonicalUrl("/store", countryCode),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/contact", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: getCanonicalUrl("/returns", countryCode),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  // 2. Dynamic Products
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: {
        limit: 1000,
        fields: "id,handle,updated_at,status",
      },
    })

    productEntries = (response?.products || [])
      .filter(
        (product) =>
          product.handle &&
          (product as any).status !== "draft" &&
          (product as any).status !== "archived" &&
          product.metadata?.noindex !== true &&
          product.metadata?.seo_index !== false
      )
      .map((product) => ({
        url: getProductCanonicalUrl(product.handle, countryCode),
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: "daily",
        priority: 0.8,
      }))
  } catch (err) {
    console.error("Failed to load products for sitemap:", err)
  }

  // 3. Dynamic Categories
  let categoryEntries: MetadataRoute.Sitemap = []
  try {
    const categories = await listCategories().catch(() => [])
    categoryEntries = (categories || [])
      .filter((cat) => cat.handle)
      .map((cat) => {
        const item = cat as unknown as EntityWithUpdatedAt
        return {
          url: getCategoryCanonicalUrl(cat.handle, countryCode),
          lastModified: item.updated_at ? new Date(item.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        }
      })
  } catch (err) {
    console.error("Failed to load categories for sitemap:", err)
  }

  // 4. Dynamic Collections
  let collectionEntries: MetadataRoute.Sitemap = []
  try {
    const collectionsRes = await listCollections({
      fields: "id,handle,updated_at",
    }).catch(() => ({ collections: [] }))
    collectionEntries = (collectionsRes.collections || [])
      .filter((col) => col.handle)
      .map((col) => {
        const item = col as unknown as EntityWithUpdatedAt
        return {
          url: getCollectionCanonicalUrl(col.handle, countryCode),
          lastModified: item.updated_at ? new Date(item.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.6,
        }
      })
  } catch (err) {
    console.error("Failed to load collections for sitemap:", err)
  }

  // 5. Dynamic Brands
  let brandEntries: MetadataRoute.Sitemap = []
  try {
    const brands = await listBrands({ limit: 100 }).catch(() => [])
    brandEntries = (brands || [])
      .filter((brand) => brand.handle)
      .map((brand) => ({
        url: getBrandCanonicalUrl(brand.handle, countryCode),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }))
  } catch (err) {
    console.error("Failed to load brands for sitemap:", err)
  }

  return [
    ...staticPages,
    ...productEntries,
    ...categoryEntries,
    ...collectionEntries,
    ...brandEntries,
  ]
}
