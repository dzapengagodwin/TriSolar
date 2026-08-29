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
    const to = notification.to
    if (!to) {
      this.logger_.error(
        `[SendGrid] Cannot send notification: missing recipient for template '${notification.template}'`
      )
      return {}
    }

    const fromEmail = notification.from || this.options_.from
    if (!fromEmail && !this.options_.sandbox) {
      this.logger_.error(
        `[SendGrid] Cannot send notification to ${to}: missing sender email ('from' address).`
      )
      return {}
    }

    const fromName = this.options_.from_name || "LaptopZone"
    const templateData = (notification.data || {}) as Record<string, any>

    // Render template
    const rendered = this.renderTemplate(notification.template, templateData, notification.content)
    if (!rendered) {
      this.logger_.error(
        `[SendGrid] Unknown template '${notification.template}' for notification to ${to}.`
      )
      return {}
    }

    // Sandbox / Mock Mode
    if (this.options_.sandbox || !this.isConfigured_) {
      this.logger_.info(
        `[SendGrid Sandbox] Email simulated successfully:\n  To: ${to}\n  From: ${fromName} <${fromEmail}>\n  Template: ${notification.template}\n  Subject: ${rendered.subject}`
      )
      return { id: `mock_sendgrid_${Date.now()}` }
    }

    // Live Send via SendGrid
    try {
      const msg: sendgrid.MailDataRequired = {
        to,
        from: {
          email: fromEmail,
          name: fromName,
        },
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
      // Robust error logging with credential redaction
      const statusCode = error.code || error.response?.statusCode || "UNKNOWN"
      const errorMessage =
        error.response?.body?.errors
          ?.map((e: any) => e.message)
          .join(", ") ||
        error.message ||
        "Unknown SendGrid error"

      this.logger_.error(
        `[SendGrid] Failed to send email\n  Recipient: ${to}\n  Template: ${notification.template}\n  Status: ${statusCode}\n  Error: ${errorMessage}`
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
