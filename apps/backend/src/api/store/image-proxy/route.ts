import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const AUTHENTICATE = false

const VALIDATE_BODY = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const imageUrl = req.query.url as string

    if (!imageUrl) {
      return res.status(400).send("Missing url query parameter")
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      // If fetching fails, redirect to original or send 404
      return res.redirect(imageUrl)
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.setHeader("Content-Type", contentType)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
    res.setHeader("Cache-Control", "public, max-age=86400")

    return res.status(200).send(buffer)
  } catch (error: any) {
    // Fallback to original URL on error
    const imageUrl = req.query.url as string
    if (imageUrl) {
      return res.redirect(imageUrl)
    }
    return res.status(500).send(error.message)
  }
}
