import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ShipmentConfirmationData } from "../modules/sendgrid/types"

export default async function orderFulfillmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ order_id?: string; id?: string; fulfillment_id?: string; no_notification?: boolean }>) {
  if (data.no_notification) {
    return
  }

  const orderId = data.order_id || data.id
  if (!orderId) {
    return
  }

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
        "customer.first_name",
        "customer.last_name",
        "customer.email",
        "shipping_address.country_code",
        "items.id",
        "items.title",
        "items.quantity",
        "fulfillments.id",
        "fulfillments.labels.*",
        "fulfillments.items.*",
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[Subscriber: order.fulfillment_created] Order with ID ${orderId} not found.`)
      return
    }

    const recipientEmail = order.email || order.customer?.email
    if (!recipientEmail) {
      return
    }

    const customerName = [order.customer?.first_name || "", order.customer?.last_name || ""]
      .filter(Boolean)
      .join(" ") || "Valued Customer"

    const latestFulfillment = (order.fulfillments || []).slice(-1)[0]
    const labels = latestFulfillment?.labels || []
    const firstLabel = labels[0]
    const trackingNumber = firstLabel?.tracking_number
    const trackingUrl = firstLabel?.tracking_url
    const carrier = firstLabel?.label_url ? "Express Logistics" : undefined

    const items = (order.items || []).map((item: any) => ({
      title: item.title || "Product",
      quantity: item.quantity || 1,
    }))

    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:8000"
    const countryCode = (order.shipping_address?.country_code || "zw").toLowerCase()
    const viewOrderUrl = `${storefrontUrl}/${countryCode}/order/confirmed/${order.id}`

    const payload: ShipmentConfirmationData = {
      order_id: order.id,
      display_id: order.display_id || order.id.slice(-6),
      customer_name: customerName,
      customer_email: recipientEmail,
      fulfillment_status: "Dispatched",
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      carrier,
      items,
      view_order_url: viewOrderUrl,
    }

    const fulfillmentId = latestFulfillment?.id || data.fulfillment_id || "default"

    const orderFromEmail =
      process.env.SENDGRID_ORDER_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      "orders@laptopzone.co.zw"

    await notificationModuleService.createNotifications({
      to: recipientEmail,
      from: orderFromEmail,
      channel: "email",
      template: "shipment-confirmation",
      data: payload as Record<string, unknown>,
      trigger_type: "order.fulfillment_created",
      resource_id: order.id,
      resource_type: "order",
      idempotency_key: `shipment_${order.id}_${fulfillmentId}`,
    })

    logger.info(`[Subscriber: order.fulfillment_created] Shipment notification queued for order #${order.display_id || order.id} to ${recipientEmail}`)
  } catch (error: any) {
    logger.error(`[Subscriber: order.fulfillment_created] Failed to process notification for order ${orderId}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
