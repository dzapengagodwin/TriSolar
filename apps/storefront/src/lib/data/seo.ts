"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import {
  CACHE_TAGS,
  productTag,
  productHandleTag,
  categoryTag,
  brandTag,
} from "@lib/cache-tags"

export type SeoMetadataDTO = {
  id: string
  entity_type: string
  entity_id: string
  meta_title?: string | null
  meta_description?: string | null
  focus_keyphrase?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  robots_index: boolean
  robots_follow: boolean
  metadata?: Record<string, unknown> | null
}

/**
 * Fetches persistent SEO metadata for a product from the commerce backend
 */
export async function getProductSeo(
  productIdOrHandle: string
): Promise<SeoMetadataDTO | null> {
  if (!productIdOrHandle) return null

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const tags = [
      CACHE_TAGS.products,
      productTag(productIdOrHandle),
      productHandleTag(productIdOrHandle),
    ]

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/products/${productIdOrHandle}/seo`,
      {
        method: "GET",
        headers,
        next: {
          tags,
          revalidate: 300,
        },
      }
    )

    return res.seo || null
  } catch (_error) {
    // Return null silently so standard product fallback metadata is used
    return null
  }
}

/**
 * Fetches persistent SEO metadata for a product category from the commerce backend
 */
export async function getCategorySeo(
  categoryId: string
): Promise<SeoMetadataDTO | null> {
  if (!categoryId) return null

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const tags = [
      CACHE_TAGS.categories,
      categoryTag(categoryId),
    ]

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/categories/${categoryId}/seo`,
      {
        method: "GET",
        headers,
        next: {
          tags,
          revalidate: 3600,
        },
      }
    )

    return res.seo || null
  } catch (_error) {
    // Return null silently so standard category fallback metadata is used
    return null
  }
}

/**
 * Fetches persistent SEO metadata for a brand from the commerce backend
 */
export async function getBrandSeo(
  brandHandle: string
): Promise<SeoMetadataDTO | null> {
  if (!brandHandle) return null

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const tags = [
      CACHE_TAGS.brands,
      brandTag(brandHandle),
    ]

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/brands/${brandHandle}/seo`,
      {
        method: "GET",
        headers,
        next: {
          tags,
          revalidate: 3600,
        },
      }
    )

    return res.seo || null
  } catch (_error) {
    // Return null silently so standard brand fallback metadata is used
    return null
  }
}

/**
 * Fetches persistent SEO metadata for a static page (home, about, faq, etc.) from the commerce backend
 */
export async function getPageSeo(
  pageHandle: string
): Promise<SeoMetadataDTO | null> {
  if (!pageHandle) return null

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/pages/${pageHandle}/seo`,
      {
        method: "GET",
        headers,
        next: {
          tags: ["seo", `seo-page-${pageHandle}`],
          revalidate: 60,
        },
      }
    )

    return res.seo || null
  } catch (_error) {
    // Return null silently so standard page fallback metadata is used
    return null
  }
}

