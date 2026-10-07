import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Forward subscription request to the Medusa backend where SENDGRID_API_KEY
    // and SENDGRID_WEBSITE_LIST_ID reside securely
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    const response = await fetch(`${backendUrl}/store/newsletter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
      body: JSON.stringify({ email: trimmedEmail }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error || "Failed to subscribe to newsletter. Please try again.",
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Thank you for subscribing to Laptopzone deals!",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[Newsletter Route Error] ${message}`)
    return NextResponse.json(
      { error: "Unable to connect to newsletter service. Please try again later." },
      { status: 500 }
    )
  }
}
