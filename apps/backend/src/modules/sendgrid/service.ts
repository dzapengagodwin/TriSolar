import { Logger, NotificationTypes } from "@medusajs/framework/types"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import sendgrid from "@sendgrid/mail"
import {
  InviteData,
  OrderConfirmationData,
  PaymentConfirmationData,
  PasswordResetData,
  SendgridOptions,
  SendgridTemplateResult,
  ShipmentConfirmationData,
  WelcomeData,
} from "./types"
import { renderOrderConfirmation } from "./templates/order-confirmation"
import { renderPaymentConfirmation } from "./templates/payment-confirmation"
import { renderShipmentConfirmation } from "./templates/shipment-confirmation"
import { renderPasswordReset } from "./templates/password-reset"
import { renderWelcome } from "./templates/welcome"
import { renderInvite } from "./templates/invite"
import {
  renderOwnerOrderNotification,
  OwnerOrderNotificationData,
} from "./templates/owner-order-notification"

function ensureEnvLoaded() {
  if (process.env.SENDGRID_API_KEY) return
  try {
    const fs = require("fs")
    const path = require("path")
    const dotenv = require("dotenv")
    const possiblePaths = [
      path.resolve(__dirname, "../../../.env"),
      path.resolve(__dirname, "../../../../.env"),
      path.resolve(process.cwd(), "apps/backend/.env"),
      path.resolve(process.cwd(), ".env"),
    ]
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p })
        if (process.env.SENDGRID_API_KEY) break
      }
    }
  } catch {}
}

type InjectedDependencies = {
  logger: Logger
}

export class SendgridNotificationService extends AbstractNotificationProviderService {
  static identifier = "sendgrid"

  protected options_: SendgridOptions
  protected logger_: Logger
  protected isConfigured_: boolean = false

  constructor({ logger }: InjectedDependencies, options: SendgridOptions) {
    super()
    this.logger_ = logger
    this.options_ = {
      from_name: "LaptopZone",
      ...options,
    }

    if (this.options_.api_key) {
      sendgrid.setApiKey(this.options_.api_key)
      this.isConfigured_ = true
    } else {
      if (this.options_.sandbox || process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
        this.logger_.warn(
          "[SendGrid Notification Provider] SENDGRID_API_KEY is not set. Running in sandbox/mock mode (emails will be logged instead of sent)."
        )
      } else {
        this.logger_.error(
          "[SendGrid Notification Provider] Configuration error: SENDGRID_API_KEY is required in production."
        )
      }
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    try {
      const to = notification.to
      if (!to) {
        this.logger_.error(
          `[SendGrid] Cannot send notification: missing recipient for template '${notification.template}'`
        )
        return {}
      }

      // Ensure API key is configured even if loaded dynamically from environment
      if (!this.isConfigured_) {
        ensureEnvLoaded()
        const apiKey = this.options_?.api_key || process.env.SENDGRID_API_KEY
        if (apiKey) {
          sendgrid.setApiKey(apiKey)
          this.isConfigured_ = true
        }
      }

      const normalizedTemplate = notification.template.toLowerCase().trim()
      const isOrderEmail = [
        "order-confirmation",
        "order-placed",
        "order.placed",
        "order.created",
        "payment-confirmation",
        "payment-captured",
        "order.payment_captured",
        "payment.captured",
        "shipment-confirmation",
        "order-shipped",
        "order.fulfillment_created",
        "shipment.created",
      ].includes(normalizedTemplate)

      const defaultFrom = isOrderEmail
        ? this.options_?.order_from_email || this.options_?.from || process.env.SENDGRID_ORDER_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || "orders@laptopzone.co.zw"
        : this.options_?.account_from_email || this.options_?.from || process.env.SENDGRID_ACCOUNT_FROM_EMAIL || "noreply@laptopzone.co.zw"

      const fromEmail = notification.from || defaultFrom || "orders@laptopzone.co.zw"
      const fromName = this.options_?.from_name || process.env.SENDGRID_FROM_NAME || "LaptopZone"
      const templateData = (notification.data || {}) as Record<string, any>

      // Resolve CC email for order notifications if explicitly configured
      let ccEmails: string[] = []
      if (isOrderEmail) {
        const rawCc =
          notification.data?.cc ||
          this.options_?.order_cc_email ||
          process.env.SENDGRID_ORDER_CC_EMAIL

        if (rawCc && typeof rawCc === "string" && !["false", "none", "off", "0"].includes(rawCc.toLowerCase().trim())) {
          ccEmails = rawCc
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0 && e.toLowerCase() !== to.toLowerCase())
        } else if (Array.isArray(rawCc)) {
          ccEmails = rawCc
            .map((e) => String(e).trim())
            .filter((e) => e.length > 0 && e.toLowerCase() !== to.toLowerCase())
        }
      }

      // Render template
      const rendered = this.renderTemplate(notification.template, templateData, notification.content)
      if (!rendered) {
        this.logger_.error(
          `[SendGrid] Unknown template '${notification.template}' for notification to ${to}.`
        )
        return {}
      }

      // Sandbox / Mock Mode
      if (this.options_?.sandbox || !this.isConfigured_) {
        const ccInfo = ccEmails.length > 0 ? `\n  CC: ${ccEmails.join(", ")}` : ""
        this.logger_.info(
          `[SendGrid Sandbox] Email simulated successfully:\n  To: ${to}${ccInfo}\n  From: ${fromName} <${fromEmail}>\n  Template: ${notification.template}\n  Subject: ${rendered.subject}`
        )
        return { id: `mock_sendgrid_${Date.now()}` }
      }

      // Live Send via SendGrid
      const msg: sendgrid.MailDataRequired = {
        to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        ...(ccEmails.length > 0
          ? { cc: ccEmails.length === 1 ? ccEmails[0] : ccEmails }
          : {}),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }

      const [response] = await sendgrid.send(msg)
      const messageId =
        response?.headers?.["x-message-id"] ||
        (Array.isArray(response?.headers?.["x-message-id"])
          ? response?.headers?.["x-message-id"][0]
          : `sg_${Date.now()}`)

      this.logger_.info(
        `[SendGrid] Email sent successfully to ${to} for template '${notification.template}' (ID: ${messageId})`
      )

      return { id: String(messageId) }
    } catch (error: any) {
      const statusCode = error.code || error.response?.statusCode || "UNKNOWN"
      const errorMessage =
        error.response?.body?.errors
          ?.map((e: any) => e.message)
          .join(", ") ||
        error.message ||
        "Unknown SendGrid error"

      this.logger_.error(
        `[SendGrid] Failed to send email\n  Recipient: ${notification?.to}\n  Template: ${notification?.template}\n  Status: ${statusCode}\n  Error: ${errorMessage}`
      )

      return {}
    }
  }

  private renderTemplate(
    templateName: string,
    data: Record<string, any>,
    content?: NotificationTypes.NotificationContent | null
  ): SendgridTemplateResult | null {
    // If raw content was directly supplied
    if (content?.html && content?.subject) {
      return {
        subject: content.subject,
        html: content.html,
        text: content.text || "",
      }
    }

    const normalizedTemplate = templateName.toLowerCase().trim()

    switch (normalizedTemplate) {
      case "order-confirmation":
      case "order-placed":
      case "order.placed":
      case "order.created":
        return renderOrderConfirmation(data as OrderConfirmationData)

      case "owner-order-notification":
      case "order-notification":
      case "order.owner_notification":
        return renderOwnerOrderNotification(data as OwnerOrderNotificationData)

      case "payment-confirmation":
      case "payment-captured":
      case "order.payment_captured":
      case "payment.captured":
        return renderPaymentConfirmation(data as PaymentConfirmationData)

      case "shipment-confirmation":
      case "order-shipped":
      case "order.fulfillment_created":
      case "shipment.created":
        return renderShipmentConfirmation(data as ShipmentConfirmationData)

      case "password-reset":
      case "auth.password_reset":
        return renderPasswordReset(data as PasswordResetData)

      case "welcome":
      case "customer-welcome":
      case "customer.created":
        return renderWelcome(data as WelcomeData)

      case "invite":
      case "invite.created":
      case "invite.resent":
        return renderInvite(data as InviteData)

      default:
        return null
    }
  }
}
