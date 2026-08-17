import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PESEPAY_CONFIG_MODULE } from "../../../../modules/pesepay-config"
import PesepayConfigModuleService from "../../../../modules/pesepay-config/service"
import { setPesepayConfigWorkflow } from "../../../../workflows/set-pesepay-config"

// Require admin authentication - do not allow unauthenticated access to payment credentials
export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    let dbConfig: any = null
    try {
      const pesepayConfigService =
        req.scope.resolve<PesepayConfigModuleService>(PESEPAY_CONFIG_MODULE)
      if (pesepayConfigService) {
        const configs = await pesepayConfigService.listPesepayConfigs(
          { is_active: true },
          { take: 1, order: { created_at: "DESC" } }
        )
        if (configs && configs.length > 0) {
          dbConfig = configs[0]
        }
      }
    } catch {
      // Fallback to process.env if DB table is initializing
    }

    const integrationKey =
      dbConfig?.integration_key || process.env.PESEPAY_INTEGRATION_KEY || ""
    const encryptionKey =
      dbConfig?.encryption_key || process.env.PESEPAY_ENCRYPTION_KEY || ""
    const environment =
      dbConfig?.environment || process.env.PESEPAY_ENV || "sandbox"
    const callbackUrl =
      dbConfig?.callback_url ||
      process.env.PESEPAY_CALLBACK_URL ||
      "http://localhost:8000/zw/payment-callback"

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

    const pesepayConfigService =
      req.scope.resolve<PesepayConfigModuleService>(PESEPAY_CONFIG_MODULE)

    if (!pesepayConfigService) {
      throw new Error("Pesepay configuration service is not available")
    }

    // Retrieve existing active configuration
    const existingConfigs = await pesepayConfigService.listPesepayConfigs(
      { is_active: true },
      { take: 1, order: { created_at: "DESC" } }
    )

    const existing = existingConfigs && existingConfigs.length > 0 ? existingConfigs[0] : null

    let newIntegrationKey = existing?.integration_key || process.env.PESEPAY_INTEGRATION_KEY || ""
    let newEncryptionKey = existing?.encryption_key || process.env.PESEPAY_ENCRYPTION_KEY || ""
    let newEnvironment = existing?.environment || process.env.PESEPAY_ENV || "sandbox"
    let newCallbackUrl =
      existing?.callback_url ||
      process.env.PESEPAY_CALLBACK_URL ||
      "http://localhost:8000/zw/payment-callback"

    // Only update integrationKey if non-empty and not masked placeholder
    if (
      integrationKey !== undefined &&
      integrationKey.trim() !== "" &&
      !integrationKey.includes("...") &&
      !integrationKey.includes("•••")
    ) {
      newIntegrationKey = integrationKey.trim()
    }

    // Only update encryptionKey if non-empty and not masked placeholder
    if (
      encryptionKey !== undefined &&
      encryptionKey.trim() !== "" &&
      !encryptionKey.includes("•••")
    ) {
      newEncryptionKey = encryptionKey.trim()
    }

    if (environment !== undefined && environment.trim() !== "") {
      newEnvironment =
        environment.toLowerCase() === "production" ? "production" : "sandbox"
    }

    if (callbackUrl !== undefined && callbackUrl.trim() !== "") {
      newCallbackUrl = callbackUrl.trim()
    }

    await setPesepayConfigWorkflow(req.scope).run({
      input: {
        integration_key: newIntegrationKey,
        encryption_key: newEncryptionKey,
        environment: newEnvironment,
        callback_url: newCallbackUrl,
        is_active: true,
      },
    })

    const maskedKey = newIntegrationKey
      ? newIntegrationKey.length > 8
        ? `${newIntegrationKey.slice(0, 4)}...${newIntegrationKey.slice(-4)}`
        : "••••••••"
      : ""

    return res.status(200).json({
      message: "Pesepay configuration saved securely to database.",
      maskedIntegrationKey: maskedKey,
      hasIntegrationKey: Boolean(newIntegrationKey),
      hasEncryptionKey: Boolean(newEncryptionKey),
      environment: newEnvironment,
      callbackUrl: newCallbackUrl,
      isConfigured: Boolean(newIntegrationKey && newEncryptionKey),
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
