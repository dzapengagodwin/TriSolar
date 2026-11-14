import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const backendUrl = (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  ).replace(/\/$/, "")
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!publishableKey) {
    return NextResponse.json(
      { error: "The storefront is missing its Medusa publishable API key." },
      { status: 503 }
    )
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/store/quote-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const result = await backendResponse.json().catch(() => ({}))

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: result.error || result.message || "The backend rejected the quotation request." },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the TRITECH backend. Please try again shortly." },
      { status: 502 }
    )
  }
}
