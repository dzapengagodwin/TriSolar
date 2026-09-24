import { HttpTypes } from "@medusajs/types"

export const isPickupShippingOption = (
  option?: HttpTypes.StoreCartShippingOption | HttpTypes.StoreCartShippingMethod | null
): boolean => {
  if (!option) return false
  const raw = option as unknown as {
    service_zone?: {
      fulfillment_set?: {
        type?: string
        name?: string
      }
    }
  }
  const fsetType = raw.service_zone?.fulfillment_set?.type
  if (fsetType === "pickup") return true

  const fsetName = raw.service_zone?.fulfillment_set?.name?.toLowerCase() || ""
  if (
    fsetName.includes("pickup") ||
    fsetName.includes("pick up") ||
    fsetName.includes("collection")
  ) {
    return true
  }

  const optName = option.name?.toLowerCase() || ""
  if (
    optName.includes("pickup") ||
    optName.includes("pick up") ||
    optName.includes("collection")
  ) {
    return true
  }

  return false
}

export const isDeliveryShippingOption = (
  option?: HttpTypes.StoreCartShippingOption | HttpTypes.StoreCartShippingMethod | null
): boolean => {
  if (!option) return false
  const raw = option as unknown as {
    service_zone?: {
      fulfillment_set?: {
        type?: string
        name?: string
      }
    }
  }
  const fsetType = raw.service_zone?.fulfillment_set?.type
  if (fsetType === "shipping") return true

  const fsetName = raw.service_zone?.fulfillment_set?.name?.toLowerCase() || ""
  if (
    fsetName.includes("shipping") ||
    fsetName.includes("delivery") ||
    fsetName.includes("courier")
  ) {
    return true
  }

  const optName = option.name?.toLowerCase() || ""
  if (
    optName.includes("shipping") ||
    optName.includes("delivery") ||
    optName.includes("courier") ||
    optName.includes("ship")
  ) {
    return true
  }

  return false
}

export const formatLocationAddress = (
  address?: HttpTypes.StoreCartAddress | null
): string => {
  if (!address) return ""
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.province,
    address.country_code ? address.country_code.toUpperCase() : null,
  ].filter(Boolean)
  return parts.join(", ")
}

export const getPickupLocationAddress = (
  option?: HttpTypes.StoreCartShippingOption | null
): string => {
  if (!option) return "64 Ridgeway / Borrowdale, Harare"
  const fset = (
    option as unknown as {
      service_zone?: {
        name?: string
        fulfillment_set?: {
          type?: string
          name?: string
          location?: {
            name?: string
            address?: HttpTypes.StoreCartAddress
          }
        }
      }
    }
  ).service_zone?.fulfillment_set

  const locAddress = fset?.location?.address
  if (locAddress) {
    const formatted = formatLocationAddress(locAddress)
    if (formatted) return formatted
  }

  const locName = fset?.location?.name
  if (locName) return locName

  const szName = (
    option as unknown as {
      service_zone?: { name?: string }
    }
  ).service_zone?.name
  if (szName) return szName

  return "64 Ridgeway / Borrowdale, Harare"
}

