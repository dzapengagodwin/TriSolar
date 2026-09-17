"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { CACHE_TAGS, regionTag } from "@lib/cache-tags"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const sessionNext = await getCacheOptions("regions")
  const tags = Array.from(
    new Set([
      CACHE_TAGS.regions,
      ...(sessionNext.tags || []),
    ])
  )

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      query: {
        fields: "*countries",
      },
      next: {
        ...sessionNext,
        tags,
        revalidate: 3600,
      },
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const sessionNext = await getCacheOptions(["regions", id].join("-"))
  const tags = Array.from(
    new Set([
      CACHE_TAGS.regions,
      regionTag(id),
      ...(sessionNext.tags || []),
    ])
  )

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: {
        ...sessionNext,
        tags,
        revalidate: 3600,
      },
    })
    .then(({ region }) => region)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  const code = countryCode?.toLowerCase()

  const regions = await listRegions()

  if (!regions || regions.length === 0) {
    return null
  }

  regionMap.clear()
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      if (c?.iso_2) {
        regionMap.set(c.iso_2.toLowerCase(), region)
      }
    })
  })

  const region = code
    ? regionMap.get(code)
    : regionMap.get("us") || regions[0]

  return region || regions[0] || null
}
