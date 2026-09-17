"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
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

    const sessionNext = await getCacheOptions("products")
    const tags = Array.from(
      new Set([
        CACHE_TAGS.products,
        productTag(productIdOrHandle),
        productHandleTag(productIdOrHandle),
        ...(sessionNext.tags || []),
      ])
    )

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/products/${productIdOrHandle}/seo`,
      {
        method: "GET",
        headers,
        next: {
          ...sessionNext,
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

    const sessionNext = await getCacheOptions("categories")
    const tags = Array.from(
      new Set([
        CACHE_TAGS.categories,
        categoryTag(categoryId),
        ...(sessionNext.tags || []),
      ])
    )

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/categories/${categoryId}/seo`,
      {
        method: "GET",
        headers,
        next: {
          ...sessionNext,
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

    const sessionNext = await getCacheOptions("brands")
    const tags = Array.from(
      new Set([
        CACHE_TAGS.brands,
        brandTag(brandHandle),
        ...(sessionNext.tags || []),
      ])
    )

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/brands/${brandHandle}/seo`,
      {
        method: "GET",
        headers,
        next: {
          ...sessionNext,
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
