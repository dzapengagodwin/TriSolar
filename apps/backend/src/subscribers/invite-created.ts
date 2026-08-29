import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { InviteData } from "../modules/sendgrid/types"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: invites } = await query.graph({
      entity: "invite",
      fields: ["id", "email", "token", "role"],
      filters: {
        id: data.id,
      },
    })

    const invite = invites?.[0]
    if (!invite || !invite.email || !invite.token) {
      return
    }

    const adminUrl = process.env.ADMIN_URL || "http://localhost:9000/app"
    const inviteUrl = `${adminUrl}/invite?token=${encodeURIComponent(invite.token)}`

    const payload: InviteData = {
      email: invite.email,
      token: invite.token,
      invite_url: inviteUrl,
      role: invite.role || "staff member",
    }

    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: "email",
      template: "invite",
      data: payload as Record<string, unknown>,
      trigger_type: "invite.created",
      resource_id: invite.id,
      resource_type: "invite",
      idempotency_key: `invite_${invite.id}_${invite.token.slice(-8)}`,
    })

    logger.info(`[Subscriber: invite.created] Staff invitation email queued for ${invite.email}`)
  } catch (error: any) {
    logger.error(`[Subscriber: invite.created] Failed to process invite notification for ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
}
