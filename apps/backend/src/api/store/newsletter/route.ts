import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = false

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { email } = (req.body as { email?: string }) || {}

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." })
  }

  const trimmedEmail = email.trim().toLowerCase()
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  const websiteListId =
    process.env.SENDGRID_WEBSITE_LIST_ID ||
    process.env.SENDGRID_LIST_ID ||
    process.env.SENDGRID_NEWSLETTER_LIST_ID

  if (!sendgridApiKey) {
    logger.warn(
      `[SendGrid Newsletter] SENDGRID_API_KEY not configured. Skipping SendGrid API call for ${trimmedEmail}.`
    )
    return res.status(200).json({
      success: true,
      message: "Subscribed! (Development mode: SENDGRID_API_KEY unset)",
    })
  }

  try {
    const payload: {
      list_ids?: string[]
      contacts: Array<{ email: string }>
    } = {
      contacts: [{ email: trimmedEmail }],
    }

    if (websiteListId && websiteListId.trim()) {
      payload.list_ids = [websiteListId.trim()]
    }

    const response = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sendgridApiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      logger.error(
        `[SendGrid Newsletter] API error ${response.status}: ${errorText}`
      )
      return res.status(response.status).json({
        error: "Failed to add contact to SendGrid list.",
      })
    }

    logger.info(
      `[SendGrid Newsletter] Successfully added ${trimmedEmail} to SendGrid list ${websiteListId || "default"}`
    )

    return res.status(200).json({
      success: true,
      message: "Successfully subscribed to newsletter.",
    })
  } catch (err: any) {
    logger.error(`[SendGrid Newsletter] Network error: ${err.message}`)
    return res.status(500).json({
      error: "Internal error processing newsletter subscription.",
    })
  }
}

