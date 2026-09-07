import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PaymentConfirmationData } from "../modules/sendgrid/types"

export default async function orderPaymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "created_at",
        "customer.first_name",
        "customer.last_name",
        "customer.email",
        "shipping_address.country_code",
        "payment_collections.payments.provider_id",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[Subscriber: order.payment_captured] Order with ID ${data.id} not found.`)
      return
    }

    const recipientEmail = order.email || order.customer?.email
    if (!recipientEmail) {
      return
    }

    const customerName = [order.customer?.first_name || "", order.customer?.last_name || ""]
      .filter(Boolean)
      .join(" ") || "Valued Customer"

    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"
    const countryCode = (order.shipping_address?.country_code || "zw").toLowerCase()
    const viewOrderUrl = `${storefrontUrl}/${countryCode}/order/confirmed/${order.id}`

    const paymentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    const rawProvider = (order as any).payment_collections?.[0]?.payments?.[0]?.provider_id
    const formatPaymentMethod = (providerId?: string) => {
      if (!providerId) return undefined
      if (providerId.includes("pesepay")) return "Pesepay"
      if (providerId.includes("stripe")) return "Credit / Debit Card"
      if (providerId.includes("manual")) return "Cash on Delivery"
      return providerId
    }

    const payload: PaymentConfirmationData = {
      order_id: order.id,
      display_id: order.display_id || order.id.slice(-6),
      customer_name: customerName,
      customer_email: recipientEmail,
      amount: order.total || 0,
      currency_code: order.currency_code || "USD",
      payment_date: paymentDate,
      payment_method: formatPaymentMethod(rawProvider),
      status: "CAPTURED",
      view_order_url: viewOrderUrl,
    }

    const orderFromEmail =
      process.env.SENDGRID_ORDER_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      "orders@laptopzone.co.zw"

    await notificationModuleService.createNotifications({
      to: recipientEmail,
      from: orderFromEmail,
      channel: "email",
      template: "payment-confirmation",
      data: payload as Record<string, unknown>,
      trigger_type: "order.payment_captured",
      resource_id: order.id,
      resource_type: "order",
      idempotency_key: `payment_captured_${order.id}`,
    })

    logger.info(`[Subscriber: order.payment_captured] Payment receipt queued for order #${order.display_id || order.id} to ${recipientEmail}`)
  } catch (error: any) {
    logger.error(`[Subscriber: order.payment_captured] Failed to process notification for order ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.payment_captured",
}
