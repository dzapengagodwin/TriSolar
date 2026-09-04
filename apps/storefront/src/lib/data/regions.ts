"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      query: {
        fields: "*countries",
      },
      next,
      cache: "no-store",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "no-store",
    })
    .then(({ region }) => region)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  const code = countryCode?.toLowerCase()

  // Always refetch to avoid stale in-memory cache during debugging
  const regions = await listRegions()

  if (!regions || regions.length === 0) {
    console.log("[getRegion] No regions returned from the commerce backend")
    return null
  }

  // Debug: log all regions and their countries
  console.log("[getRegion] Looking up country code:", code)
  regions.forEach((region) => {
    const countryCodes = region.countries?.map((c) => c?.iso_2) || []
    console.log(`[getRegion] Region: "${region.name}" (${region.id}), currency: ${region.currency_code}, countries:`, countryCodes)
  })

  // Clear and rebuild the map every time
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

  const result = region || regions[0] || null
  console.log(`[getRegion] Resolved "${code}" -> region: "${result?.name}", currency: ${result?.currency_code}`)

  return result
}
