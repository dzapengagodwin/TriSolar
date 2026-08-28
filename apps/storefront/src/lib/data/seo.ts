"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

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
 * Fetches persistent SEO metadata for a product from Medusa backend
 */
export async function getProductSeo(
  productIdOrHandle: string
): Promise<SeoMetadataDTO | null> {
  if (!productIdOrHandle) return null

  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const res = await sdk.client.fetch<{ seo: SeoMetadataDTO | null }>(
      `/store/products/${productIdOrHandle}/seo`,
      {
        method: "GET",
        headers,
        next,
        cache: "no-store",
      }
    )

    return res.seo || null
  } catch (_error) {
    // Return null silently so standard product fallback metadata is used
    return null
  }
}
