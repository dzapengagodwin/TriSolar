import { listProducts } from "@lib/data/products"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const countryCode = searchParams.get("countryCode") || "zw"

  if (!q.trim()) {
    return NextResponse.json({ products: [] })
  }

  try {
    const { response: { products } } = await listProducts({
      countryCode,
      queryParams: {
        q: q.trim(),
        limit: 8,
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("API search error:", error)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
