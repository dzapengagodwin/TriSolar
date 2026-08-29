import { SendgridTemplateResult, ShipmentConfirmationData } from "../types"
import { escapeHtml, renderBaseLayout } from "./base-layout"

export function renderShipmentConfirmation(
  data: ShipmentConfirmationData
): SendgridTemplateResult {
  const orderNumber = data.display_id || data.order_id
  const customerName = data.customer_name || "Valued Customer"

  // Render shipped items
  const itemsHtml = (data.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; font-size: 14px; color: #0f172a;">
          ${escapeHtml(item.title)}
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; font-weight: 600;">
          Qty: ${item.quantity}
        </td>
      </tr>`
    )
    .join("")

  // Tracking box
  const trackingHtml = data.tracking_number
    ? `
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #166534; margin-bottom: 6px;">
        Tracking Number
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 1px; font-family: monospace;">
        ${escapeHtml(data.tracking_number)}
      </div>
      ${
        data.carrier
          ? `<div style="font-size: 12px; color: #166534; margin-top: 4px;">Carrier: <strong>${escapeHtml(data.carrier)}</strong></div>`
          : ""
      }
      ${
        data.tracking_url
          ? `<div style="margin-top: 14px;">
              <a href="${escapeHtml(data.tracking_url)}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 700; font-size: 13px; padding: 10px 22px; border-radius: 9999px; text-decoration: none;">
                Track Package
              </a>
            </div>`
          : ""
      }
    </div>`
    : ""

  const viewOrderBtnHtml = data.view_order_url
    ? `
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(data.view_order_url)}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
        View Order Status
      </a>
    </div>`
    : ""

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Dispatched
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Your Order is on Its Way!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        Items from Order <strong style="color: #0f172a;">#${orderNumber}</strong> have been fulfilled and dispatched.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${escapeHtml(customerName)}</strong>,<br>
      Great news! We've packaged your items with care and handed them over for delivery.
    </p>

    ${trackingHtml}

    <!-- Shipped Items -->
    <div style="margin-top: 24px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px;">
        Items in this Shipment:
      </div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    ${viewOrderBtnHtml}
  `

  const subject = `Your Order #${orderNumber} Has Been Dispatched! - LaptopZone`
  const html = renderBaseLayout({
    title: subject,
    previewText: `Great news! Items from Order #${orderNumber} are on their way to you.`,
    content,
  })

  const text = `LAPTOPZONE ZIMBABWE - SHIPMENT CONFIRMATION
Order #${orderNumber}

Hello ${customerName},

Your order #${orderNumber} has been dispatched and is on its way!

${data.tracking_number ? `Tracking Number: ${data.tracking_number}\n` : ""}${data.carrier ? `Carrier: ${data.carrier}\n` : ""}${data.tracking_url ? `Track online: ${data.tracking_url}\n` : ""}
ITEMS SHIPPED:
${(data.items || []).map((i) => `- ${i.title} (Qty: ${i.quantity})`).join("\n")}

${data.view_order_url ? `View your order details: ${data.view_order_url}\n` : ""}
LaptopZone Zimbabwe
Authentic Hardware, Zimbabwe`

  return { subject, html, text }
}
