import { OrderConfirmationData, SendgridTemplateResult } from "../types"
import { escapeHtml, formatMoney, renderBaseLayout } from "./base-layout"

export function renderOrderConfirmation(
  data: OrderConfirmationData
): SendgridTemplateResult {
  const brandName = process.env.SENDGRID_FROM_NAME || "LaptopZone"
  const currency = data.currency_code || "USD"
  const orderNumber = data.display_id || data.order_id
  const safe = (value: unknown) => escapeHtml(String(value ?? ""))
  const customerName = data.customer_name || "Valued Customer"

  // Render items rows in the white inner card
  const itemsList = data.items || []
  const itemsHtml = itemsList
    .map((item, index) => {
      const unitFormatted = formatMoney(item.unit_price, currency)
      const totalFormatted = formatMoney(item.total_price, currency)
      const isLast = index === itemsList.length - 1
      const borderStyle = isLast ? "" : "border-bottom: 1px solid #f1f5f9;"

      const thumbnailHtml = item.thumbnail
        ? `<img src="${escapeHtml(item.thumbnail)}" alt="${safe(item.title)}" width="52" height="52" style="border-radius: 8px; object-fit: contain; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" />`
        : `<div style="width: 52px; height: 52px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; text-align: center; line-height: 52px; font-size: 10px; font-weight: 700; color: #94a3b8;">ITEM</div>`

      return `
      <tr>
        <td style="padding: 12px 0; ${borderStyle} width: 60px; vertical-align: top;">
          ${thumbnailHtml}
        </td>
        <td style="padding: 12px 12px; ${borderStyle} vertical-align: top;">
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.4;">
            ${safe(item.title)}
          </div>
          ${
            item.variant_title && item.variant_title !== "Default Variant"
              ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${safe(item.variant_title)}</div>`
              : ""
          }
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
            Qty: ${item.quantity} ${item.quantity > 1 ? `&times; ${unitFormatted}` : ""}
          </div>
        </td>
        <td align="right" style="padding: 12px 0; ${borderStyle} vertical-align: top; font-weight: 700; font-size: 14px; color: #0f172a; white-space: nowrap;">
          ${totalFormatted}
        </td>
      </tr>`
    })
    .join("")

  // Shipping Address
  const sAddr = data.shipping_address
  const shippingAddressHtml = sAddr
    ? `${safe(sAddr.first_name)} ${safe(sAddr.last_name)}<br>
       ${sAddr.address_1 ? `${escapeHtml(sAddr.address_1)}<br>` : ""}
       ${sAddr.address_2 ? `${escapeHtml(sAddr.address_2)}<br>` : ""}
       ${sAddr.city ? `${safe(sAddr.city)}, ` : ""}${safe(sAddr.postal_code || "")}<br>
       ${sAddr.country_code ? safe(sAddr.country_code.toUpperCase()) : ""}`
    : `<span style="color: #94a3b8;">Not provided</span>`

  // Billing Address / Payment Info
  const bAddr = data.billing_address || data.shipping_address
  const billingPhone = data.customer_phone || sAddr?.phone || bAddr?.phone
  const billingAddressHtml = bAddr
    ? `${safe(bAddr.first_name)} ${safe(bAddr.last_name)}<br>
       ${bAddr.address_1 ? `${escapeHtml(bAddr.address_1)}<br>` : ""}
       ${bAddr.city ? `${safe(bAddr.city)}, ` : ""}${safe(bAddr.postal_code || "")}<br>
       ${billingPhone ? `Phone: ${escapeHtml(billingPhone)}<br>` : ""}
       ${data.payment_method ? `<span style="display: inline-block; margin-top: 4px; font-weight: 600; color: #0f172a;">${safe(data.payment_method)}${data.payment_status ? ` (${safe(data.payment_status)})` : ""}</span>` : ""}`
    : `<span style="color: #94a3b8;">Same as shipping</span>`

  const viewOrderBtnHtml = data.view_order_url
    ? `
    <div style="margin: 20px 0 4px 0;">
      <a href="${escapeHtml(data.view_order_url)}" class="mobile-btn" style="display: inline-block; background-color: #0066ff; color: #ffffff; font-weight: 700; font-size: 14px; padding: 13px 32px; border-radius: 9999px; text-decoration: none; letter-spacing: 0.3px;">
        Setup Notifications
      </a>
    </div>`
    : ""

  const content = `
    <!-- Hero Card (Soft Blue #f0f6ff) -->
    <div class="mobile-card-padding" style="background-color: #f0f6ff; border-radius: 18px; padding: 36px 24px; text-align: center;">
      <!-- Hand Holding Heart SVG Illustration -->
      <div style="margin-bottom: 8px;">
        <svg width="96" height="96" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
          <!-- Soft Cloud Base -->
          <path d="M30 92C24 92 20 87 20 81C20 76 23 72 28 71C29 65 34 60 41 60C43 60 45 61 47 62C50 58 56 55 62 55C70 55 77 60 79 67C82 66 84 66 87 68C91 70 94 74 94 79C94 86 88 92 81 92H30Z" fill="#CBD5E1" opacity="0.45"/>
          <!-- Arm with Striped Cuff -->
          <rect x="50" y="80" width="22" height="28" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
          <line x1="55" y1="84" x2="55" y2="104" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="61" y1="84" x2="61" y2="104" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="67" y1="84" x2="67" y2="104" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Hand Palm & Fingers -->
          <path d="M42 66C38 60 43 52 49 55L57 60C58 54 63 50 68 53L73 57C75 53 80 52 83 55C86 58 84 63 80 67L74 78C73 80 71 81 68 81H54C50 81 46 78 44 74L42 66Z" fill="#FED7AA"/>
          <!-- Heart -->
          <path d="M62 44C62 44 51 35 51 26C51 20 55 16 60 16C63 16 66 18 68 21C70 18 73 16 76 16C81 16 85 20 85 26C85 35 74 44 74 44L68 49L62 44Z" fill="#EF4444"/>
          <!-- Heart Highlight -->
          <path d="M55 22C53.5 24 53 27 53.5 29" stroke="#FECACA" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Thanks for the Order
      </h1>
      <p style="margin: 0 auto 20px auto; max-width: 440px; font-size: 13px; color: #475569; line-height: 1.6;">
        Great news! Your order is all set to hit the road. We're packing it up with care and it'll be on its way to you in no time.
      </p>

      ${viewOrderBtnHtml}
    </div>

    <!-- 3-Step Progress Stepper -->
    <div style="margin: 28px 8px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <!-- Step 1: Confirmed -->
          <td align="center" width="20%" style="vertical-align: middle;">
            <div style="margin-bottom: 6px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                <circle cx="12" cy="12" r="10" stroke="#0066ff" stroke-width="2.2"/>
                <path d="m8.5 12 2.5 2.5 5-5" stroke="#0066ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div style="font-size: 11px; font-weight: 800; color: #0066ff; text-transform: capitalize;">
              Confirmed
            </div>
          </td>

          <!-- Dashed Active Connector Line -->
          <td width="20%" style="vertical-align: middle; padding: 0 4px;">
            <div style="border-top: 2px dashed #0066ff; height: 1px; width: 100%;"></div>
          </td>

          <!-- Step 2: Shipping -->
          <td align="center" width="20%" style="vertical-align: middle;">
            <div style="margin-bottom: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.2-2 1-.3.7 0 1.6.6 2l6.1 4.3-3.5 3.5-2.5-.5c-.5-.1-1 .1-1.3.4-.4.4-.5 1-.2 1.5l1.6 1.6c.5.3 1.1.2 1.5-.2l.4-2.5 3.5-3.5 4.3 6.1c.4.6 1.3.9 2 .6.8-.4 1.2-1.2 1-2z"/>
              </svg>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: capitalize;">
              Shipping
            </div>
          </td>

          <!-- Dotted Pending Connector Line -->
          <td width="20%" style="vertical-align: middle; padding: 0 4px;">
            <div style="border-top: 2px dashed #cbd5e1; height: 1px; width: 100%;"></div>
          </td>

          <!-- Step 3: Delivered -->
          <td align="center" width="20%" style="vertical-align: middle;">
            <div style="margin-bottom: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
                <rect x="3" y="8" width="18" height="13" rx="2"/>
                <path d="M12 8v13"/>
                <path d="M19 8a3 3 0 0 0-3-3c-3 0-4 3-4 3s-1-3-4-3a3 3 0 0 0-3 3h14z"/>
              </svg>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: capitalize;">
              Delivered
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Order Details Container Card (Soft Blue #f0f6ff) -->
    <div class="mobile-card-padding" style="background-color: #f0f6ff; border-radius: 18px; padding: 24px 20px; margin-top: 24px;">
      <!-- Title & Order number -->
      <h2 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.3px;">
        Your item${itemsList.length > 1 ? "s" : ""} in this order
      </h2>
      <p style="margin: 4px 0 20px 0; font-size: 13px; color: #64748b; text-align: center;">
        Order number: #${safe(orderNumber)}
      </p>

      <!-- Nested White Card: Line Items -->
      <div style="background-color: #ffffff; border-radius: 14px; padding: 8px 16px; margin-bottom: 12px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          ${itemsHtml}
        </table>
      </div>

      <!-- Nested White Card: Totals Breakdown -->
      <div style="background-color: #ffffff; border-radius: 14px; padding: 16px 18px; margin-bottom: 24px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #475569;">Subtotal</td>
            <td align="right" style="padding: 6px 0; font-weight: 700; color: #0f172a;">${formatMoney(data.subtotal, currency)}</td>
          </tr>
          ${
            data.discount_total && Number(data.discount_total) > 0
              ? `<tr>
                  <td style="padding: 6px 0; color: #16a34a;">Discount</td>
                  <td align="right" style="padding: 6px 0; font-weight: 700; color: #16a34a;">-${formatMoney(data.discount_total, currency)}</td>
                </tr>`
              : ""
          }
          ${
            data.gift_card_total && Number(data.gift_card_total) > 0
              ? `<tr>
                  <td style="padding: 6px 0; color: #16a34a;">Gift card</td>
                  <td align="right" style="padding: 6px 0; font-weight: 700; color: #16a34a;">-${formatMoney(data.gift_card_total, currency)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; color: #475569;">${safe(data.delivery_method || "Standard Delivery")}</td>
            <td align="right" style="padding: 6px 0; font-weight: 700; color: #0f172a;">
              ${Number(data.shipping_total) === 0 ? "FREE" : formatMoney(data.shipping_total, currency)}
            </td>
          </tr>
          ${
            data.tax_total && Number(data.tax_total) > 0
              ? `<tr>
                  <td style="padding: 6px 0; color: #475569;">${safe(data.tax_label || (data.tax_rate ? `VAT (${data.tax_rate}% Included)` : "Taxes (Included)"))}</td>
                  <td align="right" style="padding: 6px 0; font-weight: 600; color: #64748b;">${formatMoney(data.tax_total, currency)}</td>
                </tr>`
              : ""
          }
          ${
            data.payment_method || data.payment_status
              ? `<tr>
                  <td style="padding: 6px 0; color: #475569;">Payment</td>
                  <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${safe(data.payment_method || "Payment")}${data.payment_status ? ` (${safe(data.payment_status)})` : ""}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0;">
              Total
            </td>
            <td align="right" style="padding: 12px 0 0 0; font-size: 17px; font-weight: 900; color: #0f172a; border-top: 1px solid #e2e8f0;">
              ${formatMoney(data.total, currency)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Two-Column Addresses Section -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <!-- Shipping Address -->
          <td width="48%" class="mobile-stack" style="vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 8px;">
              Shipping Address
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.6;">
              ${shippingAddressHtml}
            </div>
          </td>
          <td width="4%" class="mobile-stack-gap">&nbsp;</td>
          <!-- Billing Address / Payment Info -->
          <td width="48%" class="mobile-stack" style="vertical-align: top;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 8px;">
              Billing Address
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.6;">
              ${billingAddressHtml}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `

  const subject = `Order Confirmed: #${String(orderNumber)} - ${brandName}`
  const html = renderBaseLayout({
    title: subject,
    previewText: `Great news! Your order #${orderNumber} is confirmed and being prepared.`,
    content,
    trackPackageUrl: data.view_order_url,
    supportEmail: "orders@laptopzone.co.zw",
    supportPhone: "+263 8612 600 600",
  })

  // Plain-text alternative
  const itemsText = itemsList
    .map(
      (item) =>
        `- ${item.title} (Qty: ${item.quantity}) - ${formatMoney(item.total_price, currency)}`
    )
    .join("\n")

  const taxLabelText = data.tax_label || (data.tax_rate ? `VAT (${data.tax_rate}% Included)` : "Taxes (Included)")

  const text = `${brandName.toUpperCase()} - ORDER CONFIRMATION
Order #${orderNumber}

Hello ${customerName},

Great news! Your order is all set to hit the road. We're packing it up with care and it'll be on its way to you in no time.

ORDER ITEMS:
${itemsText}

ORDER TOTALS:
Subtotal: ${formatMoney(data.subtotal, currency)}
${data.discount_total ? `Discount: -${formatMoney(data.discount_total, currency)}\n` : ""}Shipping: ${Number(data.shipping_total) === 0 ? "FREE" : formatMoney(data.shipping_total, currency)}
${data.gift_card_total ? `Gift card: -${formatMoney(data.gift_card_total, currency)}\n` : ""}${data.tax_total ? `${taxLabelText}: ${formatMoney(data.tax_total, currency)}\n` : ""}Total: ${formatMoney(data.total, currency)}

${data.view_order_url ? `Track your order: ${data.view_order_url}\n` : ""}
Questions with your order?
Email: orders@laptopzone.co.zw
Phone: +263 8612 600 600

Thank you for choosing ${brandName}.`

  return { subject, html, text }
}
