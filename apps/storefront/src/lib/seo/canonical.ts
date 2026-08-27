import { STORE_URL, DEFAULT_COUNTRY_CODE } from "./constants"

/**
 * Builds a clean, absolute canonical URL stripped of query parameters, tracking tags, and pagination/filter strings.
 */
export function getCanonicalUrl(
  path: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  const baseUrl = STORE_URL.replace(/\/+$/, "")
  let cleanPath = path.split("?")[0].split("#")[0].replace(/\/+$/, "")

  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`
  }

  // If path doesn't include countryCode, prepend it
  const segments = cleanPath.split("/").filter(Boolean)
  if (segments.length === 0) {
    return `${baseUrl}/${countryCode.toLowerCase()}`
  }

  if (segments[0] !== countryCode.toLowerCase()) {
    return `${baseUrl}/${countryCode.toLowerCase()}${cleanPath}`
  }

  return `${baseUrl}${cleanPath}`
}

/**
 * Generates canonical product URL
 */
export function getProductCanonicalUrl(
  handle: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  return getCanonicalUrl(`/products/${handle}`, countryCode)
}

/**
 * Generates canonical category URL
 */
export function getCategoryCanonicalUrl(
  handle: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  return getCanonicalUrl(`/categories/${handle}`, countryCode)
}

/**
 * Generates canonical brand URL
 */
export function getBrandCanonicalUrl(
  handle: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  return getCanonicalUrl(`/brands/${handle}`, countryCode)
}

/**
 * Generates canonical collection URL
 */
export function getCollectionCanonicalUrl(
  handle: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  return getCanonicalUrl(`/collections/${handle}`, countryCode)
}
