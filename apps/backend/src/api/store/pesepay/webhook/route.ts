import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createDecipheriv } from "node:crypto"
import { PESEPAY_CONFIG_MODULE } from "../../../../modules/pesepay-config"
import PesepayConfigModuleService from "../../../../modules/pesepay-config/service"
import { processPesepayWebhookWorkflow } from "../../../../workflows/process-pesepay-webhook"

export const AUTHENTICATE = false

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
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const rawBody = req.body as unknown

    if (!rawBody) {
      return res.status(400).json({ error: "Empty webhook payload" })
    }

    if (typeof rawBody !== "object" || rawBody === null || Array.isArray(rawBody)) {
      return res.status(400).json({ error: "Invalid webhook payload" })
    }

    const body = rawBody as Record<string, unknown>
    let webhookData: Record<string, unknown>
    if (typeof body.payload === "string") {
      const configService = req.scope.resolve<PesepayConfigModuleService>(
        PESEPAY_CONFIG_MODULE
      )
      const configs = await configService.listPesepayConfigs(
        { is_active: true },
        { take: 1, order: { created_at: "DESC" } }
      )
      const encryptionKey =
        configs[0]?.encryption_key || process.env.PESEPAY_ENCRYPTION_KEY

      if (!encryptionKey) {
        logger.error("Pesepay webhook payload is encrypted but no encryption key is configured")
        return res.status(503).json({ error: "Webhook verification is unavailable" })
      }

      try {
        webhookData = decryptPayload(body.payload, encryptionKey)
      } catch (decryptErr: unknown) {
        logger.warn(
          `Failed to decrypt Pesepay webhook payload: ${
            decryptErr instanceof Error ? decryptErr.message : "Invalid encrypted payload"
          }`
        )
        return res.status(400).json({ error: "Invalid encrypted webhook payload" })
      }
    } else {
      webhookData = body
    }

    const referenceNumber = String(
      webhookData.referenceNumber ||
        webhookData.reference_number ||
        webhookData.id ||
        ""
    )

    const status = String(
      webhookData.transactionStatus || webhookData.status || ""
    ).toUpperCase()

    logger.info(
      `Received Pesepay webhook for reference: ${referenceNumber}, status: ${status}`
    )

    if (!referenceNumber) {
      return res.status(400).json({ error: "No reference number in webhook" })
    }

    const isSuccessful =
      status === "SUCCESS" ||
      status === "SUCCESSFUL" ||
      status === "COMPLETED" ||
      status === "PAID"

    if (!isSuccessful) {
      return res.status(200).json({
        received: true,
        referenceNumber,
        status,
        success: false,
      })
    }

    // Execute workflow to process webhook and update payment session
    const { result } = await processPesepayWebhookWorkflow(req.scope).run({
      input: {
        referenceNumber,
        isSuccessful,
      },
    })

    if (!result.processed) {
      logger.warn(
        `Pesepay webhook was not processed for reference ${referenceNumber}: ${
          result.note || "payment could not be verified"
        }`
      )
      return res.status(503).json({
        received: true,
        referenceNumber,
        error: result.note || "Payment could not be verified",
      })
    }

    return res.status(200).json({
      received: true,
      referenceNumber,
      status,
      success: isSuccessful,
      workflowResult: result,
    })
  } catch (error: unknown) {
    logger.error(
      `Pesepay webhook processing error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    return res.status(500).json({ error: "Pesepay webhook processing failed" })
  }
}
