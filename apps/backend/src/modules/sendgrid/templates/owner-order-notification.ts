import { OrderConfirmationData, SendgridTemplateResult } from "../types"
import { escapeHtml, formatMoney } from "./base-layout"

export type OwnerOrderNotificationData = OrderConfirmationData & {
  is_test?: boolean
  admin_order_url?: string
}

export function renderOwnerOrderNotification(
  data: OwnerOrderNotificationData
): SendgridTemplateResult {
  const currency = data.currency_code || "USD"
  const orderNumber = data.display_id || data.order_id
  const totalFormatted = formatMoney(data.total, currency)
  const isTest = Boolean(data.is_test)

  const subject = isTest
    ? `[Test] New order #${orderNumber} — ${totalFormatted}`
    : `New order #${orderNumber} — ${totalFormatted}`

  const safe = (val: unknown) => escapeHtml(String(val ?? ""))
  const customerName = data.customer_name || "Guest Customer"
  const customerEmail = data.customer_email || "Not provided"
  const customerPhone = data.customer_phone || data.shipping_address?.phone || "Not provided"

  const adminBaseUrl = process.env.ADMIN_URL || "http://localhost:9000/app"
  const adminOrderUrl =
    data.admin_order_url || `${adminBaseUrl.replace(/\/$/, "")}/orders/${data.order_id}`

  // Items table rows
  const items = data.items || []
  const itemsRowsHtml = items
    .map((item, index) => {
      const isLast = index === items.length - 1
      const borderStyle = isLast ? "" : "border-bottom: 1px solid #f3f4f6;"
      const unitPriceFormatted = formatMoney(item.unit_price, currency)
      const lineTotalFormatted = formatMoney(item.total_price, currency)

      const thumb = item.thumbnail
        ? `<img src="${escapeHtml(item.thumbnail)}" alt="${safe(item.title)}" width="44" height="44" style="border-radius: 6px; object-fit: contain; background-color: #f9fafb; border: 1px solid #e5e7eb; display: block;" />`
        : `<div style="width: 44px; height: 44px; border-radius: 6px; background-color: #f3f4f6; border: 1px solid #e5e7eb; text-align: center; line-height: 44px; font-size: 10px; font-weight: 500; color: #9ca3af;">ITEM</div>`

      return `
      <tr>
        <td style="padding: 10px 0; ${borderStyle} width: 52px; vertical-align: top;">
          ${thumb}
        </td>
        <td style="padding: 10px 12px; ${borderStyle} vertical-align: top;">
          <div style="font-weight: 500; font-size: 13px; color: #111827; line-height: 1.4;">
            ${safe(item.title)}
          </div>
          ${
            item.variant_title && item.variant_title !== "Default Variant"
              ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${safe(item.variant_title)}</div>`
              : ""
          }
          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
            Qty ${item.quantity} ${item.quantity > 1 ? `&times; ${unitPriceFormatted}` : ""}
          </div>
        </td>
        <td align="right" style="padding: 10px 0; ${borderStyle} vertical-align: top; font-weight: 500; font-size: 13px; color: #111827; white-space: nowrap;">
          ${lineTotalFormatted}
        </td>
      </tr>`
    })
    .join("")

  // Shipping address block (HTML)
  const sAddr = data.shipping_address
  const shippingAddressHtml = sAddr
    ? `${sAddr.address_1 ? `${escapeHtml(sAddr.address_1)}<br>` : ""}
       ${sAddr.address_2 ? `${escapeHtml(sAddr.address_2)}<br>` : ""}
       ${sAddr.city ? `${safe(sAddr.city)}` : ""}${sAddr.postal_code ? `, ${safe(sAddr.postal_code)}` : ""}${sAddr.city || sAddr.postal_code ? "<br>" : ""}
       ${sAddr.country_code ? safe(sAddr.country_code.toUpperCase()) : ""}`
    : `<span style="color: #9ca3af;">No shipping address provided</span>`

  // Shipping address block (Plain Text)
  const shippingAddressText = sAddr
    ? [
        `${sAddr.first_name || ""} ${sAddr.last_name || ""}`.trim(),
        sAddr.address_1,
        sAddr.address_2,
        [sAddr.city, sAddr.postal_code].filter(Boolean).join(", "),
        sAddr.country_code?.toUpperCase(),
      ]
        .filter(Boolean)
        .join("\n")
    : "No shipping address provided"

  // Test banner HTML
  const testBannerHtml = isTest
    ? `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 12px 16px; margin: 20px 24px 0 24px;">
      <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 2px;">
        Test notification
      </div>
      <div style="font-size: 12px; color: #b45309; line-height: 1.4;">
        This test notification was triggered from the admin dashboard. No order or payment was processed.
      </div>
    </div>`
    : ""

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111827;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Brand & Date Header Bar -->
          <tr>
            <td style="padding: 20px 24px; border-bottom: 1px solid #f3f4f6;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${escapeHtml(adminBaseUrl)}" style="text-decoration: none; display: inline-block;">
                      <img src="https://cdn.laptopzone.co.zw/logo.png" alt="LaptopZone" width="120" style="display: block; height: auto; border: 0; max-height: 28px; object-fit: contain;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 12px; color: #6b7280;">
                      ${safe(data.date)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${testBannerHtml ? `<tr><td>${testBannerHtml}</td></tr>` : ""}

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px;">

              <!-- Order Headline -->
              <div style="margin-bottom: 20px;">
                <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 600; color: #111827; letter-spacing: -0.3px;">
                  Order #${safe(orderNumber)}
                </h1>
                <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                  ${safe(customerName)} placed a new order for <strong style="color: #111827; font-weight: 600;">${totalFormatted}</strong>.
                </p>
              </div>

              <!-- Action Link -->
              <div style="margin: 0 0 24px 0;">
                <a href="${escapeHtml(adminOrderUrl)}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 9px 18px; border-radius: 6px;">
                  View in Medusa Admin
                </a>
              </div>

              <!-- Items Table -->
              <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 20px;">
                <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Items (${items.length})
                </div>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${itemsRowsHtml}
                </table>
              </div>

              <!-- Financial Totals -->
              <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 8px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #4b5563; padding: 4px 0;">Subtotal</td>
                    <td align="right" style="font-size: 13px; color: #111827; padding: 4px 0;">${formatMoney(data.subtotal, currency)}</td>
                  </tr>
                  ${
                    data.discount_total && Number(data.discount_total) > 0
                      ? `<tr>
                          <td style="font-size: 13px; color: #16a34a; padding: 4px 0;">Discount</td>
                          <td align="right" style="font-size: 13px; font-weight: 500; color: #16a34a; padding: 4px 0;">-${formatMoney(data.discount_total, currency)}</td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size: 13px; color: #4b5563; padding: 4px 0;">Shipping (${safe(data.delivery_method || "Standard")})</td>
                    <td align="right" style="font-size: 13px; color: #111827; padding: 4px 0;">${formatMoney(data.shipping_total, currency)}</td>
                  </tr>
                  ${
                    data.tax_total && Number(data.tax_total) > 0
                      ? `<tr>
                          <td style="font-size: 13px; color: #4b5563; padding: 4px 0;">Tax</td>
                          <td align="right" style="font-size: 13px; color: #111827; padding: 4px 0;">${formatMoney(data.tax_total, currency)}</td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size: 14px; font-weight: 600; color: #111827; padding-top: 10px; border-top: 1px solid #e5e7eb;">Total</td>
                    <td align="right" style="font-size: 15px; font-weight: 600; color: #111827; padding-top: 10px; border-top: 1px solid #e5e7eb;">${totalFormatted}</td>
                  </tr>
                </table>
              </div>

              <!-- Customer & Delivery Details -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="48%" style="vertical-align: top; padding-right: 12px;">
                      <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        Customer
                      </div>
                      <div style="font-size: 13px; font-weight: 500; color: #111827; line-height: 1.4;">
                        ${safe(customerName)}
                      </div>
                      <div style="font-size: 13px; color: #2563eb; margin-top: 3px; line-height: 1.4;">
                        <a href="mailto:${escapeHtml(customerEmail)}" style="color: #2563eb; text-decoration: none;">${safe(customerEmail)}</a>
                      </div>
                      <div style="font-size: 13px; color: #4b5563; margin-top: 3px; line-height: 1.4;">
                        ${customerPhone !== "Not provided" ? `<a href="tel:${escapeHtml(customerPhone)}" style="color: #4b5563; text-decoration: none;">${safe(customerPhone)}</a>` : '<span style="color: #9ca3af;">No phone provided</span>'}
                      </div>
                    </td>

                    <td width="48%" style="vertical-align: top; padding-left: 12px;">
                      <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        Delivery & Payment
                      </div>
                      <div style="font-size: 13px; color: #111827; line-height: 1.4;">
                        ${safe(data.payment_method || "Online Payment")}${data.payment_status ? ` &bull; <span style="color: #059669;">${safe(data.payment_status)}</span>` : ""}
                      </div>
                      <div style="font-size: 13px; color: #4b5563; margin-top: 4px; line-height: 1.4;">
                        ${shippingAddressHtml}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Clean Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px 24px; text-align: center;">
              <div style="font-size: 11px; color: #9ca3af;">
                LaptopZone Admin Notification &bull; Harare, Zimbabwe
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [
    `LaptopZone Admin Notification: New Order #${orderNumber}`,
    `Total: ${totalFormatted}`,
    "",
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    "",
    `Payment: ${data.payment_method || "Online Payment"} (${data.payment_status || "Pending"})`,
    `Delivery: ${data.delivery_method || "Standard"}`,
    "",
    "Items:",
    ...items.map(
      (item) =>
        `- ${item.title}${item.variant_title ? ` (${item.variant_title})` : ""} x ${item.quantity} = ${formatMoney(item.total_price, currency)}`
    ),
    "",
    `Subtotal: ${formatMoney(data.subtotal, currency)}`,
    ...(data.discount_total && Number(data.discount_total) > 0
      ? [`Discount: -${formatMoney(data.discount_total, currency)}`]
      : []),
    `Shipping: ${formatMoney(data.shipping_total, currency)}`,
    ...(data.tax_total && Number(data.tax_total) > 0
      ? [`Tax: ${formatMoney(data.tax_total, currency)}`]
      : []),
    `Total: ${totalFormatted}`,
    "",
    "Shipping Address:",
    shippingAddressText,
    "",
    `View in Admin: ${adminOrderUrl}`,
  ]

  return {
    subject,
    html,
    text: textLines.join("\n"),
  }
}
