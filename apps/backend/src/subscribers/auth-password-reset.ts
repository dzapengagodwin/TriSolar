import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PasswordResetData } from "../modules/sendgrid/types"

export default async function authPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  entity_id: string
  actor_type: string
  token: string
  metadata?: Record<string, any>
}>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const email = data.entity_id
    if (!email || !data.token) {
      logger.warn(`[Subscriber: auth.password_reset] Missing email or reset token.`)
      return
    }

    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"
    const adminUrl = process.env.ADMIN_URL || "http://localhost:9000/app"

    // Construct appropriate reset URL depending on actor_type (customer vs user/admin)
    const resetUrl =
      data.actor_type === "customer"
        ? `${storefrontUrl}/zw/account/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`
        : `${adminUrl}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`

    const payload: PasswordResetData = {
      email,
      token: data.token,
      reset_url: resetUrl,
      expires_in_hours: 24,
    }

    const accountFromEmail =
      process.env.SENDGRID_ACCOUNT_FROM_EMAIL ||
      process.env.SENDGRID_NOREPLY_FROM_EMAIL ||
      "noreply@laptopzone.co.zw"

    await notificationModuleService.createNotifications({
      to: email,
      from: accountFromEmail,
      channel: "email",
      template: "password-reset",
      data: payload as Record<string, unknown>,
      trigger_type: "auth.password_reset",
      resource_id: email,
      resource_type: "auth",
      idempotency_key: `password_reset_${email}_${data.token.slice(-8)}`,
    })

    logger.info(`[Subscriber: auth.password_reset] Password reset email queued for ${email}`)
  } catch (error: any) {
    logger.error(`[Subscriber: auth.password_reset] Failed to process password reset for ${data.entity_id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
