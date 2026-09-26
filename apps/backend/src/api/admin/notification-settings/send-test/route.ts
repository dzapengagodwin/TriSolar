import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import sendgrid from "@sendgrid/mail"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import {
  renderOwnerOrderNotification,
  OwnerOrderNotificationData,
} from "../../../../modules/sendgrid/templates/owner-order-notification"

export const AUTHENTICATE = true

function parseEmails(raw: string | null | undefined): string[] {
  if (!raw || typeof raw !== "string") return []
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { emails } = (req.body || {}) as { emails?: string }

    let targetEmailsStr = typeof emails === "string" ? emails.trim() : ""

    if (!targetEmailsStr) {
      try {
        const storeSettingsService =
          req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
        if (storeSettingsService) {
          const settingsList = await storeSettingsService.listStoreSettings(
            { is_active: true },
            { take: 1, order: { created_at: "DESC" } }
          )
          if (settingsList?.[0]?.order_notification_emails) {
            targetEmailsStr = settingsList[0].order_notification_emails
          }
        }
      } catch {
        // Fall back to env
      }
    }

    if (!targetEmailsStr) {
      targetEmailsStr =
        process.env.SENDGRID_ORDER_NOTIFICATION_EMAIL ||
        process.env.SENDGRID_ORDER_CC_EMAIL ||
        ""
    }

    const recipients = parseEmails(targetEmailsStr)

    if (recipients.length === 0) {
      return res.status(400).json({
        error:
          "No notification email recipients found. Please configure or provide at least one valid email address.",
      })
    }

    const adminBaseUrl = process.env.ADMIN_URL || "http://localhost:9000/app"
    const orderFromEmail =
      process.env.SENDGRID_ORDER_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      "orders@laptopzone.co.zw"
    const fromName = process.env.SENDGRID_FROM_NAME || "Laptopzone"

    const mockOrderData: OwnerOrderNotificationData = {
      order_id: "order_test_preview",
      display_id: "LPZ-TEST",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      customer_name: "Test Customer (Demo)",
      customer_email: "test.customer@example.com",
      customer_phone: "+263 77 123 4567",
      currency_code: "USD",
      items: [
        {
          title: "HP Spectre x360 14 2-in-1 Laptop (Intel Core Ultra 7)",
          variant_title: "Nightfall Black / 16GB RAM / 1TB SSD",
          quantity: 1,
          unit_price: 850.0,
          total_price: 850.0,
        },
      ],
      subtotal: 850.0,
      discount_total: 0.0,
      gift_card_total: 0.0,
      shipping_total: 0.0,
      tax_total: 0.0,
      total: 850.0,
      payment_method: "Credit / Debit Card (Pesepay)",
      payment_status: "Paid",
      delivery_method: "Express Doorstep Delivery (Harare)",
      shipping_address: {
        first_name: "Test",
        last_name: "Customer",
        address_1: "Suite 4B, Sam Levy's Village, Borrowdale",
        city: "Harare",
        country_code: "zw",
        phone: "+263 77 123 4567",
      },
      is_test: true,
      admin_order_url: `${adminBaseUrl.replace(/\/$/, "")}/orders`,
    }

    const rendered = renderOwnerOrderNotification(mockOrderData)
    const apiKey = process.env.SENDGRID_API_KEY
    const isSandbox = !apiKey || process.env.SENDGRID_SANDBOX === "true"

    if (isSandbox) {
      logger.info(
        `[Notification Settings Test] Simulated test email to: ${recipients.join(", ")}`
      )
      return res.status(200).json({
        success: true,
        recipients,
        mode: "sandbox",
        message: `Test email simulated successfully for ${recipients.join(", ")} (SENDGRID_API_KEY is not active or sandbox mode is on).`,
      })
    }

    sendgrid.setApiKey(apiKey)

    const sendPromises = recipients.map(async (recipient) => {
      const msg: any = {
        to: recipient,
        from: {
          email: orderFromEmail,
          name: fromName,
        },
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }
      return sendgrid.send(msg)
    })

    await Promise.all(sendPromises)

    logger.info(
      `[Notification Settings Test] Test email successfully delivered to ${recipients.join(", ")}`
    )

    return res.status(200).json({
      success: true,
      recipients,
      mode: "live",
      message: `Test email delivered successfully to ${recipients.join(", ")}.`,
    })
  } catch (error: any) {
    const errorMsg =
      error.response?.body?.errors?.map((e: any) => e.message).join(", ") ||
      error.message ||
      "Failed to send test email"
    logger.error(`[Notification Settings Test] Error: ${errorMsg}`)
    return res.status(500).json({ error: errorMsg })
  }
}
