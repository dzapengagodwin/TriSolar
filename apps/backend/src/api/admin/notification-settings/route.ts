import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { STORE_SETTINGS_MODULE } from "../../../modules/store-settings"
import StoreSettingsModuleService from "../../../modules/store-settings/service"
import { setStoreSettingsWorkflow } from "../../../workflows/set-store-settings"

export const AUTHENTICATE = true

function parseEmails(raw: string | null | undefined): string[] {
  if (!raw || typeof raw !== "string") return []
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    let dbSettings: any = null
    try {
      const storeSettingsService =
        req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
      if (storeSettingsService) {
        const settingsList = await storeSettingsService.listStoreSettings(
          { is_active: true },
          { take: 1, order: { created_at: "DESC" } }
        )
        if (settingsList && settingsList.length > 0) {
          dbSettings = settingsList[0]
        }
      }
    } catch {
      // Gracefully fall back to env if table is initializing
    }

    const fallbackEmail =
      process.env.SENDGRID_ORDER_NOTIFICATION_EMAIL ||
      process.env.SENDGRID_ORDER_CC_EMAIL ||
      ""

    const orderNotificationEmails =
      dbSettings?.order_notification_emails !== undefined &&
      dbSettings?.order_notification_emails !== null
        ? dbSettings.order_notification_emails
        : fallbackEmail

    const validEmails = parseEmails(orderNotificationEmails)

    return res.status(200).json({
      order_notification_emails: orderNotificationEmails,
      valid_emails: validEmails,
      fallback_email: fallbackEmail,
      is_configured: validEmails.length > 0,
      has_db_record: Boolean(dbSettings),
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { order_notification_emails } = req.body as {
      order_notification_emails?: string
    }

    const storeSettingsService =
      req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)

    if (!storeSettingsService) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Store settings service is not available"
      )
    }

    const rawInput =
      typeof order_notification_emails === "string"
        ? order_notification_emails.trim()
        : ""

    // If input is non-empty, validate that each comma-separated email is valid
    if (rawInput.length > 0) {
      const parts = rawInput.split(",").map((p) => p.trim()).filter(Boolean)
      const invalid = parts.filter((p) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p))
      if (invalid.length > 0) {
        return res.status(400).json({
          error: `Invalid email address(es): ${invalid.join(", ")}. Please provide valid comma-separated email addresses.`,
        })
      }
    }

    const normalizedValue = rawInput.length > 0 ? rawInput : null

    await setStoreSettingsWorkflow(req.scope).run({
      input: {
        order_notification_emails: normalizedValue,
        is_active: true,
      },
    })

    const validEmails = parseEmails(normalizedValue)
    const fallbackEmail =
      process.env.SENDGRID_ORDER_NOTIFICATION_EMAIL ||
      process.env.SENDGRID_ORDER_CC_EMAIL ||
      ""

    return res.status(200).json({
      message: "Order notification settings saved successfully.",
      order_notification_emails: normalizedValue ?? "",
      valid_emails: validEmails,
      fallback_email: fallbackEmail,
      is_configured: validEmails.length > 0,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

