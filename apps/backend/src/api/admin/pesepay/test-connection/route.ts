import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createCipheriv, createDecipheriv } from "node:crypto"
import https from "node:https"
import http from "node:http"

// Require admin authentication - do not allow unauthenticated access
export const AUTHENTICATE = true

const httpRequest = (
  url: URL,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ ok: boolean; status: number; text: string }> => {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http
    const req = transport.request(
      url,
      {
        method,
        headers,
        insecureHTTPParser: true,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk: Buffer) => chunks.push(chunk))
        res.on("end", () => {
          const responseText = Buffer.concat(chunks).toString("utf8")
          resolve({
            ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
            status: res.statusCode ?? 0,
            text: responseText,
          })
        })
        res.on("error", reject)
      }
    )
    req.on("error", reject)
    if (body) {
      req.write(body)
    }
    req.end()
  })
}

const encryptPayload = (
  payload: Record<string, unknown>,
  key: string
): string => {
  const iv = key.slice(0, 16)
  const cipher = createCipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32, "0").slice(0, 32), "utf8"),
    Buffer.from(iv.padEnd(16, "0").slice(0, 16), "utf8")
  )
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(payload), "utf8")),
    cipher.final(),
  ])
  return encrypted.toString("base64")
}

const decryptPayload = (
  payload: string,
  key: string
): Record<string, unknown> => {
  const iv = key.slice(0, 16)
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32, "0").slice(0, 32), "utf8"),
    Buffer.from(iv.padEnd(16, "0").slice(0, 16), "utf8")
  )
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload, "base64")),
    decipher.final(),
  ])
  return JSON.parse(decrypted.toString("utf8")) as Record<string, unknown>
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { integrationKey, encryptionKey, environment } = req.body as {
      integrationKey?: string
      encryptionKey?: string
      environment?: string
    }

    const key = (
      integrationKey ||
      process.env.PESEPAY_INTEGRATION_KEY ||
      ""
    ).trim()
    const encKey = (
      encryptionKey ||
      process.env.PESEPAY_ENCRYPTION_KEY ||
      ""
    ).trim()
    const env = environment || process.env.PESEPAY_ENV || "sandbox"
    const envLabel = env.toLowerCase() === "production" ? "Production" : "Sandbox"

    if (!key) {
      return res.status(400).json({
        success: false,
        error: "Integration Key is required.",
      })
    }

    if (!encKey) {
      return res.status(400).json({
        success: false,
        error: "Encryption Key is required.",
      })
    }

    if (encKey.length < 16) {
      return res.status(400).json({
        success: false,
        error: "Encryption Key must be at least 16 characters long.",
      })
    }

    const baseUrl =
      env.toLowerCase() === "production"
        ? "https://api.pesepay.com/api/payments-engine/v1"
        : "https://api.test.sandbox.pesepay.com/payments-engine/v1"

    // Prepare encrypted test payment initiation payload
    let encryptedBody = ""
    try {
      encryptedBody = JSON.stringify({
        payload: encryptPayload(
          {
            amountDetails: {
              amount: 1,
              currencyCode: "USD",
            },
            reasonForPayment: "Pesepay Credentials Verification Test",
            resultUrl: "http://localhost:8000/test",
            returnUrl: "http://localhost:8000/test",
          },
          encKey
        ),
      })
    } catch (cryptoErr: any) {
      return res.status(400).json({
        success: false,
        error: `Encryption key error: ${cryptoErr.message}`,
        environment: env,
      })
    }

    const url = new URL(`${baseUrl}/payments/initiate`)

    try {
      const response = await httpRequest(
        url,
        "POST",
        {
          Authorization: key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        encryptedBody
      )

      if (response.status === 401 || response.status === 403) {
        return res.status(200).json({
          success: false,
          error: `Authentication failed (401) on Pesepay ${envLabel}. Your Integration Key is not recognized in ${envLabel} mode.`,
          environment: env,
        })
      }

      if (!response.ok) {
        const errText = response.text || `HTTP ${response.status}`
        return res.status(200).json({
          success: false,
          error: `Pesepay ${envLabel} returned error (${response.status}): ${errText}`,
          environment: env,
        })
      }

      // Try decrypting Pesepay's response with the Encryption Key
      try {
        const parsed = JSON.parse(response.text)
        if (parsed && typeof parsed.payload === "string") {
          const decrypted = decryptPayload(parsed.payload, encKey)
          if (decrypted.redirectUrl || decrypted.referenceNumber) {
            return res.status(200).json({
              success: true,
              message: `Full verification successful! Pesepay ${envLabel} accepted your Integration Key and successfully decrypted the payload with your Encryption Key.`,
              environment: env,
            })
          }
        }
      } catch {
        // If response is unencrypted JSON or plain confirmation
      }

      return res.status(200).json({
        success: true,
        message: `Connected successfully to Pesepay ${envLabel}. Credentials accepted.`,
        environment: env,
      })
    } catch (fetchError: any) {
      return res.status(200).json({
        success: false,
        error: `Could not connect to Pesepay ${envLabel} endpoint: ${fetchError.message}`,
        environment: env,
      })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
