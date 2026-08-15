import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createDecipheriv } from "node:crypto"
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
    let webhookData: Record<string, unknown> = {}
    const rawBody = req.body as any

    if (!rawBody) {
      return res.status(400).json({ error: "Empty webhook payload" })
    }

    // Check if payload is encrypted
    const encryptionKey = process.env.PESEPAY_ENCRYPTION_KEY || ""
    if (typeof rawBody.payload === "string" && encryptionKey) {
      try {
        webhookData = decryptPayload(rawBody.payload, encryptionKey)
      } catch (decryptErr: any) {
        logger.warn(
          `Failed to decrypt Pesepay webhook payload: ${decryptErr.message}`
        )
        webhookData = rawBody
      }
    } else {
      webhookData = typeof rawBody === "object" ? rawBody : {}
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
      return res
        .status(200)
        .json({ received: true, note: "No reference number in webhook" })
    }

    const isSuccessful =
      status === "SUCCESS" ||
      status === "SUCCESSFUL" ||
      status === "COMPLETED" ||
      status === "PAID"

    // Execute workflow to process webhook and update payment session
    const { result } = await processPesepayWebhookWorkflow(req.scope).run({
      input: {
        referenceNumber,
        status,
        isSuccessful,
        webhookData,
      },
    })

    return res.status(200).json({
      received: true,
      referenceNumber,
      status,
      success: isSuccessful,
      workflowResult: result,
    })
  } catch (error: any) {
    logger.error(`Pesepay webhook processing error: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
