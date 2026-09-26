"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { CACHE_TAGS, reviewsTag, productTag } from "@lib/cache-tags"
import { getAuthHeaders } from "./cookies"

export type StoreReview = {
  id: string
  product_id: string
  customer_id?: string | null
  order_id?: string | null
  rating: number
  title?: string | null
  content: string
  first_name: string
  last_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export type ReviewEligibility = {
  canReview: boolean
  reason?: "unauthenticated" | "not_purchased" | "already_reviewed"
  existingReview?: StoreReview
}

export const listProductReviews = async (
  productId: string
): Promise<{ reviews: StoreReview[]; count: number; average_rating: number }> => {
  return sdk.client
    .fetch<{ reviews: StoreReview[]; count: number; average_rating: number }>(
      `/store/products/${productId}/reviews`,
      {
        method: "GET",
        next: {
          tags: [reviewsTag(productId), CACHE_TAGS.reviews],
          revalidate: 300,
        },
        cache: "force-cache",
      }
    )
    .catch(() => ({ reviews: [], count: 0, average_rating: 0 }))
}

export const checkCanReview = async (
  productId: string
): Promise<ReviewEligibility> => {
  const authHeaders = await getAuthHeaders()

  return sdk.client
    .fetch<ReviewEligibility>(
      `/store/products/${productId}/can-review`,
      {
        method: "GET",
        headers: { ...authHeaders },
        cache: "no-store",
      }
    )
    .catch(() => ({ canReview: false, reason: "unauthenticated" as const }))
}

export const submitReview = async (
  productId: string,
  payload: {
    rating: number
    title?: string
    content: string
    first_name: string
    last_name: string
  }
): Promise<{ review: StoreReview }> => {
  const authHeaders = await getAuthHeaders()

  const result = await sdk.client.fetch<{ review: StoreReview }>(
    `/store/products/${productId}/reviews`,
    {
      method: "POST",
      headers: { ...authHeaders },
      body: payload,
      cache: "no-store",
    }
  )

  revalidateTag(reviewsTag(productId))
  revalidateTag(productTag(productId))

  return result
}

export const deleteReview = async (
  productId: string,
  reviewId: string
): Promise<void> => {
  const authHeaders = await getAuthHeaders()

  await sdk.client.fetch(
    `/store/products/${productId}/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: { ...authHeaders },
      cache: "no-store",
    }
  )

  revalidateTag(reviewsTag(productId))
  revalidateTag(productTag(productId))
}
