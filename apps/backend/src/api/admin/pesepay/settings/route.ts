import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

// Require admin authentication - do not allow unauthenticated access to payment credentials
export const AUTHENTICATE = true

const updateEnvFile = (updates: Record<string, string>) => {
  const envPath = path.resolve(process.cwd(), ".env")
  let content = ""

  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf-8")
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      process.env[key] = value
      const regex = new RegExp(`^${key}=.*$`, "m")
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`)
      } else {
        content += `\n${key}=${value}`
      }
    }
  }

  fs.writeFileSync(envPath, content.trim() + "\n", "utf-8")
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const integrationKey = process.env.PESEPAY_INTEGRATION_KEY || ""
    const encryptionKey = process.env.PESEPAY_ENCRYPTION_KEY || ""
    const environment = process.env.PESEPAY_ENV || "sandbox"
    const callbackUrl =
      process.env.PESEPAY_CALLBACK_URL ||
      "http://localhost:8000/us/order/confirmed"

    const maskedIntegrationKey = integrationKey
      ? integrationKey.length > 8
        ? `${integrationKey.slice(0, 4)}...${integrationKey.slice(-4)}`
        : "••••••••"
      : ""

    return res.status(200).json({
      maskedIntegrationKey,
      hasIntegrationKey: Boolean(integrationKey),
      hasEncryptionKey: Boolean(encryptionKey),
      environment,
      callbackUrl,
      isConfigured: Boolean(integrationKey && encryptionKey),
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { integrationKey, encryptionKey, environment, callbackUrl } =
      req.body as {
        integrationKey?: string
        encryptionKey?: string
        environment?: string
        callbackUrl?: string
      }

    const updates: Record<string, string> = {}

    // Only update integrationKey if non-empty and not masked placeholder
    if (
      integrationKey !== undefined &&
      integrationKey.trim() !== "" &&
      !integrationKey.includes("...") &&
      !integrationKey.includes("•••")
    ) {
      updates.PESEPAY_INTEGRATION_KEY = integrationKey.trim()
    }

    // Only update encryptionKey if non-empty
    if (
      encryptionKey !== undefined &&
      encryptionKey.trim() !== "" &&
      !encryptionKey.includes("•••")
    ) {
      updates.PESEPAY_ENCRYPTION_KEY = encryptionKey.trim()
    }

    if (environment !== undefined) {
      updates.PESEPAY_ENV =
        environment.toLowerCase() === "production" ? "production" : "sandbox"
    }

    if (callbackUrl !== undefined && callbackUrl.trim() !== "") {
      updates.PESEPAY_CALLBACK_URL = callbackUrl.trim()
    }

    if (Object.keys(updates).length > 0) {
      updateEnvFile(updates)
    }

    const currentKey = process.env.PESEPAY_INTEGRATION_KEY || ""
    const maskedKey = currentKey
      ? currentKey.length > 8
        ? `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}`
        : "••••••••"
      : ""

    return res.status(200).json({
      message: "Pesepay settings saved successfully.",
      maskedIntegrationKey: maskedKey,
      hasIntegrationKey: Boolean(process.env.PESEPAY_INTEGRATION_KEY),
      hasEncryptionKey: Boolean(process.env.PESEPAY_ENCRYPTION_KEY),
      environment: process.env.PESEPAY_ENV || "sandbox",
      callbackUrl: process.env.PESEPAY_CALLBACK_URL || "",
      isConfigured: Boolean(
        process.env.PESEPAY_INTEGRATION_KEY && process.env.PESEPAY_ENCRYPTION_KEY
      ),
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
