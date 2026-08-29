import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { WelcomeData } from "../modules/sendgrid/types"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "email"],
      filters: {
        id: data.id,
      },
    })

    const customer = customers?.[0]
    if (!customer || !customer.email) {
      return
    }

    const customerName = [customer.first_name || "", customer.last_name || ""]
      .filter(Boolean)
      .join(" ") || "Valued Customer"

    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"

    const payload: WelcomeData = {
      customer_name: customerName,
      email: customer.email,
      storefront_url: `${storefrontUrl}/zw`,
    }

    await notificationModuleService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "welcome",
      data: payload as Record<string, unknown>,
      trigger_type: "customer.created",
      resource_id: customer.id,
      resource_type: "customer",
      idempotency_key: `welcome_${customer.id}`,
    })

    logger.info(`[Subscriber: customer.created] Welcome email queued for ${customer.email}`)
  } catch (error: any) {
    logger.error(`[Subscriber: customer.created] Failed to process welcome notification for customer ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
