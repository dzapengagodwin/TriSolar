import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Storefront proxy route for Google Merchant Center product feed.
 * Proxies directly to the Medusa backend /product-feed endpoint,
 * ensuring storefront URL (https://laptopzone.co.zw/product-feed) serves the live XML feed.
 */
export async function GET(req: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "http://localhost:9000"

  const url = new URL(req.url)
  const targetUrl = `${backendUrl.replace(/\/+$/, "")}/product-feed${url.search}`

  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    const body = await res.text()
    const contentType =
      res.headers.get("content-type") || "application/xml; charset=utf-8"

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: "Failed to fetch product feed from Medusa backend",
        details: message,
      },
      { status: 502 }
    )
  }
}

