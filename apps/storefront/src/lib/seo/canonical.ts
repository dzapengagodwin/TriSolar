import { STORE_URL, DEFAULT_COUNTRY_CODE } from "./constants"

export function stripVariantIdFromUrl(url: string): string {
  const hashIndex = url.indexOf("#")
  const pathAndQuery = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex)
  const queryIndex = pathAndQuery.indexOf("?")

  if (queryIndex === -1) return url

  const pathname = pathAndQuery.slice(0, queryIndex)
  const params = new URLSearchParams(pathAndQuery.slice(queryIndex + 1))
  params.delete("v_id")
  const query = params.toString()

  return `${pathname}${query ? `?${query}` : ""}${hash}`
}

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

  const segments = cleanPath.split("/").filter(Boolean)
  if (segments.length === 0) {
    return baseUrl
  }

  const normalizedPath = segments[0] === countryCode.toLowerCase()
    ? `/${segments.slice(1).join("/")}`
    : cleanPath
  return `${baseUrl}${normalizedPath || "/"}`
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
