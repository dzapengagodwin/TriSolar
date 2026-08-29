import { OrderConfirmationData, SendgridTemplateResult } from "../types"
import { escapeHtml, formatMoney, renderBaseLayout } from "./base-layout"

export function renderOrderConfirmation(
  data: OrderConfirmationData
): SendgridTemplateResult {
  const currency = data.currency_code || "USD"
  const orderNumber = data.display_id || data.order_id
  const customerName = data.customer_name || "Valued Customer"

  // Render items rows HTML
  const itemsHtml = (data.items || [])
    .map((item) => {
      const unitFormatted = formatMoney(item.unit_price, currency)
      const totalFormatted = formatMoney(item.total_price, currency)
      const thumbnailHtml = item.thumbnail
        ? `<img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" width="56" height="56" style="border-radius: 8px; object-fit: contain; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" />`
        : `<div style="width: 56px; height: 56px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; text-align: center; line-height: 56px; font-size: 20px;">📦</div>`

      return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; width: 64px; vertical-align: top;">
          ${thumbnailHtml}
        </td>
        <td style="padding: 12px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.4;">
            ${escapeHtml(item.title)}
          </div>
          ${
            item.variant_title && item.variant_title !== "Default Variant"
              ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${escapeHtml(item.variant_title)}</div>`
              : ""
          }
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
            Qty: ${item.quantity} &times; ${unitFormatted}
          </div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-weight: 700; font-size: 14px; color: #0f172a; white-space: nowrap;">
          ${totalFormatted}
        </td>
      </tr>`
    })
    .join("")

  // Shipping Address HTML
  const addr = data.shipping_address
  const addressHtml = addr
    ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-top: 24px;">
      <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin-bottom: 8px;">
        📍 Delivery Address
      </div>
      <div style="font-size: 13px; color: #334155; line-height: 1.6;">
        ${addr.first_name || ""} ${addr.last_name || ""}<br>
        ${addr.address_1 ? `${escapeHtml(addr.address_1)}<br>` : ""}
        ${addr.address_2 ? `${escapeHtml(addr.address_2)}<br>` : ""}
        ${addr.city ? `${escapeHtml(addr.city)}, ` : ""}${addr.postal_code || ""}<br>
        ${addr.country_code ? `${addr.country_code.toUpperCase()}` : "Zimbabwe"}
        ${addr.phone ? `<br>📞 ${escapeHtml(addr.phone)}` : ""}
      </div>
    </div>`
    : ""

  const viewOrderBtnHtml = data.view_order_url
    ? `
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(data.view_order_url)}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.25);">
        View Your Order
      </a>
    </div>`
    : ""

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Order Confirmed
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Thank You for Your Order!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        Order <strong style="color: #0f172a;">#${orderNumber}</strong> has been successfully placed.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${escapeHtml(customerName)}</strong>,<br>
      We're getting your order ready for processing. You will receive an update as soon as your package has been prepared and dispatched.
    </p>

    <!-- Items Table -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr>
          <th colspan="2" align="left" style="padding-bottom: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0;">
            Item Details
          </th>
          <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0;">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Subtotal</td>
        <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formatMoney(data.subtotal, currency)}</td>
      </tr>
      ${
        data.discount_total && Number(data.discount_total) > 0
          ? `<tr>
              <td style="padding: 6px 0; color: #16a34a;">Discount</td>
              <td align="right" style="padding: 6px 0; font-weight: 600; color: #16a34a;">-${formatMoney(data.discount_total, currency)}</td>
            </tr>`
          : ""
      }
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Shipping / Delivery</td>
        <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">
          ${Number(data.shipping_total) === 0 ? "FREE" : formatMoney(data.shipping_total, currency)}
        </td>
      </tr>
      ${
        data.tax_total && Number(data.tax_total) > 0
          ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Taxes</td>
              <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formatMoney(data.tax_total, currency)}</td>
            </tr>`
          : ""
      }
      <tr>
        <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #e2e8f0;">
          Total Amount
        </td>
        <td align="right" style="padding: 12px 0 0 0; font-size: 18px; font-weight: 900; color: #f97316; border-top: 2px solid #e2e8f0;">
          ${formatMoney(data.total, currency)}
        </td>
      </tr>
    </table>

    ${addressHtml}
    ${viewOrderBtnHtml}
  `

  const subject = `Order Confirmed: #${orderNumber} - LaptopZone`
  const html = renderBaseLayout({
    title: subject,
    previewText: `Thank you for your order #${orderNumber}. We're preparing your items for delivery.`,
    content,
  })

  // Plain-text alternative
  const itemsText = (data.items || [])
    .map(
      (item) =>
        `- ${item.title} (Qty: ${item.quantity}) - ${formatMoney(item.total_price, currency)}`
    )
    .join("\n")

  const text = `LAPTOPZONE ZIMBABWE - ORDER CONFIRMATION
Order #${orderNumber}

Hello ${customerName},

Thank you for shopping with LaptopZone! Your order has been placed successfully.

ORDER SUMMARY:
${itemsText}

Subtotal: ${formatMoney(data.subtotal, currency)}
${data.discount_total ? `Discount: -${formatMoney(data.discount_total, currency)}\n` : ""}Shipping: ${Number(data.shipping_total) === 0 ? "FREE" : formatMoney(data.shipping_total, currency)}
${data.tax_total ? `Tax: ${formatMoney(data.tax_total, currency)}\n` : ""}Total: ${formatMoney(data.total, currency)}

${data.view_order_url ? `View your order online: ${data.view_order_url}\n` : ""}
LaptopZone Zimbabwe
Authentic Hardware, Zimbabwe`

  return { subject, html, text }
}
