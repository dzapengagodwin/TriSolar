import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const email = request.nextUrl.searchParams.get("email")
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!email) {
    return NextResponse.json(
      { error: "Order email is required" },
      { status: 400 }
    )
  }

  if (!publishableKey) {
    console.error("[Sales Order PDF Proxy] Missing Medusa publishable API key")
    return NextResponse.json(
      { error: "Sales order PDF service is not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `${backendUrl.replace(/\/$/, "")}/store/orders/${encodeURIComponent(id)}/sales-order-pdf?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
        cache: "no-store",
      }
    )

    const headers = new Headers({
      "Cache-Control": "private, no-store",
    })
    const contentType = response.headers.get("content-type")
    const contentDisposition = response.headers.get("content-disposition")

    if (contentType) headers.set("Content-Type", contentType)
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition)
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error("[Sales Order PDF Proxy] Failed to reach Medusa backend", error)
    return NextResponse.json(
      { error: "Unable to retrieve the sales order PDF" },
      { status: 502 }
    )
  }
}
