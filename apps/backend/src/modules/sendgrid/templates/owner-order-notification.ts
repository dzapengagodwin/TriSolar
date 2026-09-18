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
    ? `[TEST] New Order #${orderNumber} — ${totalFormatted}`
    : `New Order #${orderNumber} — ${totalFormatted}`

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
      const borderStyle = isLast ? "" : "border-bottom: 1px solid #e2e8f0;"
      const unitPriceFormatted = formatMoney(item.unit_price, currency)
      const lineTotalFormatted = formatMoney(item.total_price, currency)

      const thumb = item.thumbnail
        ? `<img src="${escapeHtml(item.thumbnail)}" alt="${safe(item.title)}" width="48" height="48" style="border-radius: 6px; object-fit: contain; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" />`
        : `<div style="width: 48px; height: 48px; border-radius: 6px; background: #f1f5f9; border: 1px solid #e2e8f0; text-align: center; line-height: 48px; font-size: 10px; font-weight: 700; color: #94a3b8;">ITEM</div>`

      return `
      <tr>
        <td style="padding: 10px 0; ${borderStyle} width: 56px; vertical-align: top;">
          ${thumb}
        </td>
        <td style="padding: 10px 12px; ${borderStyle} vertical-align: top;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.4;">
            ${safe(item.title)}
          </div>
          ${
            item.variant_title && item.variant_title !== "Default Variant"
              ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Variant: ${safe(item.variant_title)}</div>`
              : ""
          }
          <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
            Qty: ${item.quantity} &times; ${unitPriceFormatted}
          </div>
        </td>
        <td align="right" style="padding: 10px 0; ${borderStyle} vertical-align: top; font-weight: 700; font-size: 13px; color: #0f172a; white-space: nowrap;">
          ${lineTotalFormatted}
        </td>
      </tr>`
    })
    .join("")

  // Shipping address block
  const sAddr = data.shipping_address
  const shippingAddressHtml = sAddr
    ? `${safe(sAddr.first_name)} ${safe(sAddr.last_name)}<br>
       ${sAddr.address_1 ? `${escapeHtml(sAddr.address_1)}<br>` : ""}
       ${sAddr.address_2 ? `${escapeHtml(sAddr.address_2)}<br>` : ""}
       ${sAddr.city ? `${safe(sAddr.city)}, ` : ""}${safe(sAddr.postal_code || "")}<br>
       ${sAddr.country_code ? safe(sAddr.country_code.toUpperCase()) : ""}`
    : `<span style="color: #94a3b8;">No shipping address provided</span>`

  // Test banner HTML
  const testBannerHtml = isTest
    ? `
    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 800; color: #92400e; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
        Test Order Notification
      </div>
      <div style="font-size: 13px; color: #b45309; line-height: 1.4;">
        This is a test notification email from LaptopZone. No real order was placed and no transaction was processed.
      </div>
    </div>`
    : ""

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      LaptopZone
                    </span>
                    <span style="display: inline-block; margin-left: 10px; background-color: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Store Alert
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 13px; color: #cbd5e1;">
                      ${safe(data.date)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 24px;">
              ${testBannerHtml}

              <!-- Headline -->
              <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;">
                  New Order Placed
                </div>
                <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                  Order #${safe(orderNumber)} &mdash; ${totalFormatted}
                </h1>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  A new order has been received and is ready for review.
                </p>
              </div>

              <!-- Quick Info Grid -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 50%;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${safe(customerName)}</div>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 50%;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Payment</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                      ${safe(data.payment_method || "Online Payment")}
                      <span style="color: ${data.payment_status === "Paid" ? "#16a34a" : "#ca8a04"}; font-size: 12px;">(${safe(data.payment_status || "Pending")})</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; width: 50%;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
                    <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                      <a href="mailto:${escapeHtml(customerEmail)}" style="color: #2563eb; text-decoration: none;">${safe(customerEmail)}</a>
                    </div>
                  </td>
                  <td style="padding: 12px 16px; width: 50%;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Phone</div>
                    <div style="font-size: 13px; color: #0f172a; margin-top: 2px;">
                      ${customerPhone !== "Not provided" ? `<a href="tel:${escapeHtml(customerPhone)}" style="color: #0f172a; text-decoration: none;">${safe(customerPhone)}</a>` : "Not provided"}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align: center; margin: 24px 0;">
                <a href="${escapeHtml(adminOrderUrl)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                  View Order in Medusa Admin &rarr;
                </a>
              </div>

              <!-- Items Ordered Section -->
              <div style="margin-top: 28px;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 8px;">
                  Items Purchased (${items.length})
                </div>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${itemsRowsHtml}
                </table>
              </div>

              <!-- Financial Totals -->
              <div style="margin-top: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Subtotal</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${formatMoney(data.subtotal, currency)}</td>
                  </tr>
                  ${
                    data.discount_total && Number(data.discount_total) > 0
                      ? `<tr>
                          <td style="font-size: 13px; color: #16a34a; padding: 4px 0;">Discount</td>
                          <td align="right" style="font-size: 13px; font-weight: 600; color: #16a34a; padding: 4px 0;">-${formatMoney(data.discount_total, currency)}</td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Delivery (${safe(data.delivery_method || "Standard")})</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${formatMoney(data.shipping_total, currency)}</td>
                  </tr>
                  ${
                    data.tax_total && Number(data.tax_total) > 0
                      ? `<tr>
                          <td style="font-size: 13px; color: #64748b; padding: 4px 0;">Tax (${safe(data.tax_label || "Included")})</td>
                          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${formatMoney(data.tax_total, currency)}</td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: #0f172a; padding-top: 10px; border-top: 1px solid #e2e8f0;">Total</td>
                    <td align="right" style="font-size: 16px; font-weight: 800; color: #0f172a; padding-top: 10px; border-top: 1px solid #e2e8f0;">${totalFormatted}</td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Address -->
              <div style="margin-top: 20px; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Delivery Address
                </div>
                <div style="font-size: 13px; color: #334155; line-height: 1.5;">
                  ${shippingAddressHtml}
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <div style="font-size: 11px; color: #94a3b8;">
                This internal notification was sent from your LaptopZone store backend.
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
    `LaptopZone Store Alert: New Order #${orderNumber}`,
    `Total: ${totalFormatted}`,
    `Customer: ${customerName} (${customerEmail}, ${customerPhone})`,
    `Payment: ${data.payment_method || "Online"} (${data.payment_status || "Pending"})`,
    `Delivery: ${data.delivery_method || "Standard"}`,
    "",
    "Items:",
    ...items.map(
      (item) =>
        `- ${item.title}${item.variant_title ? ` (${item.variant_title})` : ""} x ${item.quantity} = ${formatMoney(item.total_price, currency)}`
    ),
    "",
    `Subtotal: ${formatMoney(data.subtotal, currency)}`,
    `Delivery: ${formatMoney(data.shipping_total, currency)}`,
    `Total: ${totalFormatted}`,
    "",
    `View in Admin: ${adminOrderUrl}`,
  ]

  return {
    subject,
    html,
    text: textLines.join("\n"),
  }
}

