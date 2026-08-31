import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { OrderConfirmationData } from "../modules/sendgrid/types"

export default async function orderPlacedHandler({
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
        "subtotal",
        "shipping_total",
        "discount_total",
        "tax_total",
        "created_at",
        "items.id",
        "items.title",
        "items.variant_title",
        "items.quantity",
        "items.unit_price",
        "items.thumbnail",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.phone",
        "customer.first_name",
        "customer.last_name",
        "customer.email",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[Subscriber: order.placed] Order with ID ${data.id} not found.`)
      return
    }

    const recipientEmail = order.email || order.customer?.email
    if (!recipientEmail) {
      logger.warn(`[Subscriber: order.placed] No email found for order #${order.display_id || order.id}.`)
      return
    }

    const customerName = [
      order.shipping_address?.first_name || order.customer?.first_name || "",
      order.shipping_address?.last_name || order.customer?.last_name || "",
    ]
      .filter(Boolean)
      .join(" ") || "Customer"

    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"
    const countryCode = (order.shipping_address?.country_code || "zw").toLowerCase()
    const viewOrderUrl = `${storefrontUrl}/${countryCode}/order/confirmed/${order.id}`

    const items = (order.items || []).map((item: any) => ({
      title: item.title || "Product",
      variant_title: item.variant_title,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      total_price: (item.unit_price || 0) * (item.quantity || 1),
      thumbnail: item.thumbnail,
    }))

    const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    const payload: OrderConfirmationData = {
      order_id: order.id,
      display_id: order.display_id || order.id.slice(-6),
      date: orderDate,
      customer_name: customerName,
      customer_email: recipientEmail,
      currency_code: order.currency_code || "USD",
      items,
      subtotal: order.subtotal || 0,
      discount_total: order.discount_total || 0,
      shipping_total: order.shipping_total || 0,
      tax_total: order.tax_total || 0,
      total: order.total || 0,
      shipping_address: order.shipping_address,
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
      template: "order-confirmation",
      data: payload as Record<string, unknown>,
      trigger_type: "order.placed",
      resource_id: order.id,
      resource_type: "order",
      idempotency_key: `order_placed_${order.id}`,
    })

    logger.info(`[Subscriber: order.placed] Order confirmation queued for order #${order.display_id || order.id} to ${recipientEmail}`)
  } catch (error: any) {
    logger.error(`[Subscriber: order.placed] Failed to process notification for order ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
