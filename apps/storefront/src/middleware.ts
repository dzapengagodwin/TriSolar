import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import legacyUrlMap from "./lib/seo/legacy-url-map.json"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"
const DEFAULT_COUNTRY = "zw"
const COUNTRY_COOKIE = "_medusa_country_code"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(_cacheId?: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Check the backend URL and region configuration."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions directly because middleware runs on Edge and the SDK needs a Node environment.
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const json = await response.json()

    const { regions } = json

    if (!regions?.length) {
      return new Map<string, HttpTypes.StoreRegion>()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  const cookieCountryCode = request.cookies.get(COUNTRY_COOKIE)?.value?.toLowerCase()
  if (cookieCountryCode && regionMap.has(cookieCountryCode)) {
    return cookieCountryCode
  }

  // Cloudflare Workers provides country via request.cf.country
  const cloudflareCountryCode = (request as { cf?: { country?: string } }).cf?.country?.toLowerCase()

  // Vercel provides x-vercel-ip-country header
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase()

  if (cloudflareCountryCode && regionMap.has(cloudflareCountryCode)) return cloudflareCountryCode
  if (vercelCountryCode && regionMap.has(vercelCountryCode)) return vercelCountryCode
  if (regionMap.has(DEFAULT_COUNTRY)) return DEFAULT_COUNTRY
  if (regionMap.has(DEFAULT_REGION)) return DEFAULT_REGION
  return regionMap.keys().next().value
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/product-feed" ||
    request.nextUrl.pathname.startsWith("/product-feed/")
  ) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const pathCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const countryCode = pathCountryCode && regionMap.has(pathCountryCode)
    ? pathCountryCode
    : (await getCountryCode(request, regionMap)) || DEFAULT_COUNTRY

  const publicPath = request.nextUrl.pathname.replace(/^\/+|\/+$/g, "")
  const rewriteLegacyPath = (pathname: string, page?: string) => {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = `/${countryCode}${pathname}`
    if (page) rewriteUrl.searchParams.set("page", page)
    const response = NextResponse.rewrite(rewriteUrl)
    response.cookies.set(COUNTRY_COOKIE, countryCode, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    return response
  }

  // Permanently remove legacy country prefixes and retain their country choice.
  if (pathCountryCode && regionMap.has(pathCountryCode)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = request.nextUrl.pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, "") || "/"
    const response = NextResponse.redirect(redirectUrl, 308)
    response.cookies.set(COUNTRY_COOKIE, countryCode, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    if (!cacheIdCookie) response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    return response
  }

  // Preserve verified WordPress URLs by rewriting them to the existing
  // Medusa-backed route. These are internal rewrites, not redirects.
  if (publicPath.startsWith("product/")) {
    const handle = publicPath.slice("product/".length)
    if (handle && !handle.includes("/")) return rewriteLegacyPath(`/products/${handle}`)
  }

  const categoryHandle = legacyUrlMap.categoryPublicPathToHandle[
    publicPath as keyof typeof legacyUrlMap.categoryPublicPathToHandle
  ]
  if (categoryHandle) return rewriteLegacyPath(`/categories/${categoryHandle}`)

  const categoryPageMatch = publicPath.match(/^(products\/.+)\/page\/(\d+)$/)
  if (categoryPageMatch) {
    const handle = legacyUrlMap.categoryPublicPathToHandle[
      categoryPageMatch[1] as keyof typeof legacyUrlMap.categoryPublicPathToHandle
    ]
    if (handle) return rewriteLegacyPath(`/categories/${handle}`, categoryPageMatch[2])
  }

  if (publicPath.startsWith("brand/")) {
    const handle = publicPath.slice("brand/".length)
    if (legacyUrlMap.brandHandles.includes(handle)) return rewriteLegacyPath(`/brands/${handle}`)
  }

  const shopPageMatch = publicPath.match(/^shop\/page\/(\d+)$/)
  if (shopPageMatch) return rewriteLegacyPath("/store", shopPageMatch[1])

  // Keep the route parameter available to the existing Medusa pages while
  // serving countryless public URLs. This is an internal rewrite, not a URL redirect.
  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `/${countryCode}${request.nextUrl.pathname}`
  const response = NextResponse.rewrite(rewriteUrl)
  response.cookies.set(COUNTRY_COOKIE, countryCode, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
  }
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
