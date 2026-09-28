"use server"

import { cache } from "react"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { CACHE_TAGS, regionTag } from "@lib/cache-tags"

export const listRegions = cache(async () => {
  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      query: {
        fields: "*countries",
      },
      next: {
        tags: [CACHE_TAGS.regions],
        revalidate: 3600,
      },
    })
    .then(({ regions }) => regions)
})

export const retrieveRegion = cache(async (id: string) => {
  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.regions, regionTag(id)],
        revalidate: 3600,
      },
    })
    .then(({ region }) => region)
})

export const getRegion = cache(async (countryCode: string) => {
  const code = countryCode?.toLowerCase()

  const regions = await listRegions()

  if (!regions || regions.length === 0) {
    return null
  }

  const regionMap = new Map<string, HttpTypes.StoreRegion>()
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
})
