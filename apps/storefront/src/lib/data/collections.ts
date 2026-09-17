"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { CACHE_TAGS, collectionTag } from "@lib/cache-tags"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const sessionNext = await getCacheOptions("collections")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.collections,
      collectionTag(id),
      ...(sessionNext.tags || []),
    ])
  )

  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next: {
          ...sessionNext,
          tags,
          revalidate: 3600,
        },
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const sessionNext = await getCacheOptions("collections")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.collections,
      ...(sessionNext.tags || []),
    ])
  )

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next: {
          ...sessionNext,
          tags,
          revalidate: 3600,
        },
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  const sessionNext = await getCacheOptions("collections")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.collections,
      collectionTag(handle),
      ...(sessionNext.tags || []),
    ])
  )

  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next: {
        ...sessionNext,
        tags,
        revalidate: 3600,
      },
    })
    .then(({ collections }) => collections[0] || null)
}

export type HomeCollectionMetadata = {
  bannerImage?: string
  Bannerimage?: string
  banner_image?: string
  title?: string
  categoryHandle?: string
  category_handle?: string
  viewAllHref?: string
  view_all_href?: string
  priority?: number | string
}

export type ParsedHomeCollection = {
  id: string
  handle: string
  title: string
  bannerImage: string | null
  categoryHandle: string | null
  viewAllHref: string
  priority: number
}

/**
 * Discovers and validates all Medusa collections whose handle starts with 'home-'.
 * Sorts them by metadata.priority ascending (lower numbers first), with unprioritized collections placed last.
 */
export const getHomeFeaturedCollections = async (): Promise<ParsedHomeCollection[]> => {
  const sessionNext = await getCacheOptions("collections")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.collections,
      CACHE_TAGS.homepage,
      ...(sessionNext.tags || []),
    ])
  )

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: {
          limit: "1000",
          fields: "id,handle,title,metadata",
        },
        next: {
          ...sessionNext,
          tags,
          revalidate: 300,
        },
      }
    )
    .then(({ collections }) => {
      const homeCollections = (collections || []).filter((c) =>
        c.handle?.toLowerCase().startsWith("home-")
      )

      return homeCollections
        .map((c) => {
          const meta = (c.metadata && typeof c.metadata === "object" ? c.metadata : {}) as HomeCollectionMetadata

          const rawTitle = meta.title
          const title = (typeof rawTitle === "string" && rawTitle.trim())
            ? rawTitle.trim()
            : (c.title?.trim() || c.handle.replace(/^home-/, "").replace(/-/g, " ").toUpperCase())

          const rawBanner = meta.bannerImage || meta.Bannerimage || meta.banner_image
          const bannerImage = (typeof rawBanner === "string" && rawBanner.trim()) ? rawBanner.trim() : null

          const rawCategory = meta.categoryHandle || meta.category_handle
          const categoryHandle = (typeof rawCategory === "string" && rawCategory.trim()) ? rawCategory.trim() : null

          const rawHref = meta.viewAllHref || meta.view_all_href
          const viewAllHref = (typeof rawHref === "string" && rawHref.trim())
            ? rawHref.trim()
            : (categoryHandle ? `/categories/${categoryHandle}` : `/collections/${c.handle}`)

          let priority = Number.MAX_SAFE_INTEGER
          const rawPriority = meta.priority
          if (typeof rawPriority === "number" && !isNaN(rawPriority)) {
            priority = rawPriority
          } else if (typeof rawPriority === "string") {
            const parsed = parseInt(rawPriority, 10)
            if (!isNaN(parsed)) {
              priority = parsed
            }
          }

          return {
            id: c.id,
            handle: c.handle,
            title,
            bannerImage,
            categoryHandle,
            viewAllHref,
            priority,
          }
        })
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          return a.title.localeCompare(b.title)
        })
    })
    .catch((err) => {
      console.error("Error fetching home featured collections:", err)
      return []
    })
}

