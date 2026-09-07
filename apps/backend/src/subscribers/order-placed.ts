import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import sendgrid from "@sendgrid/mail"
import { OrderConfirmationData } from "../modules/sendgrid/types"
import { renderOrderConfirmation } from "../modules/sendgrid/templates/order-confirmation"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const toNumber = (value: unknown) => {
    if (typeof value === "number") return value
    if (typeof value === "string") return Number(value) || 0
    if (value && typeof value === "object") {
      const amount = value as { numeric?: unknown; value?: unknown; amount?: unknown }
      return Number(amount.numeric ?? amount.value ?? amount.amount) || 0
    }
    return 0
  }

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
        "item_total",
        "item_subtotal",
        "item_tax_total",
        "shipping_total",
        "shipping_subtotal",
        "shipping_tax_total",
        "discount_total",
        "gift_card_total",
        "tax_total",
        "created_at",
        "items.id",
        "items.title",
        "items.variant_title",
        "items.quantity",
        "items.unit_price",
        "items.total",
        "items.tax_total",
        "items.thumbnail",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.phone",
        "shipping_methods.name",
        "shipping_methods.amount",
        "shipping_methods.total",
        "shipping_methods.subtotal",
        "shipping_methods.tax_total",
        "shipping_methods.tax_lines.rate",
        "shipping_methods.tax_lines.code",
        "shipping_methods.tax_lines.name",
        "shipping_methods.tax_lines.total",
        "tax_lines.rate",
        "tax_lines.code",
        "tax_lines.name",
        "tax_lines.total",
        "items.tax_lines.rate",
        "items.tax_lines.code",
        "items.tax_lines.name",
        "items.tax_lines.total",
        "payment_collections.payments.provider_id",
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

    const items = (order.items || []).map((item: any) => {
      const quantity = toNumber(item.quantity) || 1
      const unitPrice = toNumber(item.unit_price)
      const totalPrice = toNumber(item.total) || unitPrice * quantity

      return {
        title: item.title || "Product",
        variant_title: item.variant_title,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        thumbnail: item.thumbnail,
      }
    })

    const itemSubtotal = items.reduce(
      (sum, item) => sum + toNumber(item.total_price),
      0
    )
    const discountTotal = toNumber(order.discount_total)
    const giftCardTotal = toNumber(order.gift_card_total)
    const reportedTotal = toNumber(order.total)

    // In our store, product prices and shipping fees already include tax (tax-inclusive pricing)
    const firstShippingMethod = order.shipping_methods?.[0]
    let shippingAmount = 0

    if (firstShippingMethod) {
      if (firstShippingMethod.amount !== undefined && firstShippingMethod.amount !== null && toNumber(firstShippingMethod.amount) > 0) {
        shippingAmount = toNumber(firstShippingMethod.amount)
      } else if (firstShippingMethod.subtotal !== undefined && firstShippingMethod.subtotal !== null && toNumber(firstShippingMethod.subtotal) > 0) {
        shippingAmount = toNumber(firstShippingMethod.subtotal)
      } else if (firstShippingMethod.total !== undefined && firstShippingMethod.total !== null && toNumber(firstShippingMethod.total) > 0) {
        shippingAmount = toNumber(firstShippingMethod.total)
      }
    }

    const shippingTotal =
      shippingAmount ||
      toNumber(order.shipping_total) ||
      toNumber(order.shipping_subtotal)

    // Extract tax rate and label from tax lines or default to 15.5% VAT from tax region
    const detectedTaxRate =
      toNumber(order.tax_lines?.[0]?.rate) ||
      toNumber(order.items?.[0]?.tax_lines?.[0]?.rate) ||
      toNumber(firstShippingMethod?.tax_lines?.[0]?.rate) ||
      15.5

    const taxCode =
      order.tax_lines?.[0]?.code ||
      order.items?.[0]?.tax_lines?.[0]?.code ||
      firstShippingMethod?.tax_lines?.[0]?.code ||
      "VAT"

    const taxLabel = `${taxCode} (${detectedTaxRate}% Included)`

    // Combined product + delivery tax
    const itemsTaxSum = (order.items || []).reduce(
      (sum: number, item: any) => sum + (toNumber(item.tax_total) || 0),
      0
    )
    const shippingTax =
      toNumber(order.shipping_tax_total) ||
      toNumber(firstShippingMethod?.tax_total) ||
      (firstShippingMethod?.tax_lines || []).reduce(
        (sum: number, tl: any) => sum + (toNumber(tl.total) || toNumber(tl.amount) || 0),
        0
      )

    // Compute the included tax amounts using the configured tax rate
    const calculatedItemsTax =
      itemsTaxSum > 0
        ? itemsTaxSum
        : (itemSubtotal > 0 && detectedTaxRate > 0
            ? Math.round((itemSubtotal * (detectedTaxRate / (100 + detectedTaxRate))) * 100) / 100
            : 0)

    const calculatedShippingTax =
      shippingTax > 0
        ? shippingTax
        : (shippingTotal > 0 && detectedTaxRate > 0
            ? Math.round((shippingTotal * (detectedTaxRate / (100 + detectedTaxRate))) * 100) / 100
            : 0)

    const combinedTaxTotal =
      toNumber(order.tax_total) > (calculatedItemsTax + calculatedShippingTax)
        ? toNumber(order.tax_total)
        : Math.round((calculatedItemsTax + calculatedShippingTax) * 100) / 100

    // Product prices and delivery are tax-inclusive: Grand Total = Subtotal - Discounts - GiftCards + Shipping
    const calculatedTotal =
      itemSubtotal - discountTotal - giftCardTotal + shippingTotal

    // If reportedTotal is missing items (e.g. reportedTotal < itemSubtotal), use calculatedTotal
    const finalTotal =
      reportedTotal >= itemSubtotal
        ? reportedTotal
        : calculatedTotal

    if (Math.abs(reportedTotal - finalTotal) > 0.01) {
      logger.warn(
        `[Subscriber: order.placed] Order #${order.display_id || order.id} reported total (${reportedTotal}) is inconsistent with line items (${calculatedTotal}). Using calculated total: ${finalTotal}.`
      )
    }

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
      subtotal: itemSubtotal,
      discount_total: discountTotal,
      gift_card_total: giftCardTotal,
      shipping_total: shippingTotal,
      tax_total: combinedTaxTotal,
      tax_rate: detectedTaxRate,
      tax_label: taxLabel,
      total: finalTotal,
      payment_method: order.payment_collections?.[0]?.payments?.[0]?.provider_id,
      payment_status: order.payment_collections?.[0]?.payments?.length
        ? "Paid"
        : "Pending",
      delivery_method: order.shipping_methods?.[0]?.name,
      shipping_address: order.shipping_address,
      view_order_url: viewOrderUrl,
    }

    const orderFromEmail =
      process.env.SENDGRID_ORDER_FROM_EMAIL ||
      process.env.SENDGRID_FROM_EMAIL ||
      "orders@laptopzone.co.zw"

    const createdNotifications = await notificationModuleService.createNotifications({
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

    const notifItem = Array.isArray(createdNotifications) ? createdNotifications[0] : createdNotifications
    const externalId = notifItem?.external_id

    // Fallback: If notification provider returned empty ID or mock ID, send directly via SendGrid
    if (!externalId || externalId.startsWith("mock_")) {
      const apiKey = process.env.SENDGRID_API_KEY
      if (apiKey) {
        sendgrid.setApiKey(apiKey)
        const rendered = renderOrderConfirmation(payload)
        if (rendered) {
          const msg = {
            to: recipientEmail,
            from: {
              email: orderFromEmail,
              name: process.env.SENDGRID_FROM_NAME || "LaptopZone",
            },
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
          }
          const [sgRes] = await sendgrid.send(msg)
          const msgId = sgRes?.headers?.["x-message-id"] || `sg_${Date.now()}`
          logger.info(`[Subscriber: order.placed] Order #${order.display_id || order.id} confirmation sent via SendGrid (ID: ${msgId})`)
        }
      }
    } else {
      logger.info(`[Subscriber: order.placed] Order #${order.display_id || order.id} confirmation sent via notification service (ID: ${externalId})`)
    }
  } catch (error: any) {
    logger.error(`[Subscriber: order.placed] Failed to process notification for order ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
