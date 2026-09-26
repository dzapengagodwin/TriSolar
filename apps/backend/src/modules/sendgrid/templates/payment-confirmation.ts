import { PaymentConfirmationData, SendgridTemplateResult } from "../types"
import { escapeHtml, formatMoney, renderBaseLayout } from "./base-layout"

export function renderPaymentConfirmation(
  data: PaymentConfirmationData
): SendgridTemplateResult {
  const brandName = process.env.SENDGRID_FROM_NAME || "Laptopzone"
  const currency = data.currency_code || "USD"
  const orderNumber = data.display_id || data.order_id
  const safeOrderNumber = escapeHtml(String(orderNumber))
  const customerName = data.customer_name || "Valued Customer"
  const safeCustomerName = escapeHtml(customerName)
  const formattedAmount = formatMoney(data.amount, currency)

  const paymentDate =
    data.payment_date ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  const safePaymentDate = escapeHtml(paymentDate)

  const rawStatus = (data.status || "CAPTURED").toUpperCase()
  const isPending = rawStatus === "PENDING" || rawStatus === "AUTHORIZED"
  const statusBadgeText = isPending ? "Payment Pending" : "Payment Received"
  const statusBadgeBg = isPending ? "#fef3c7" : "#ecfdf5"
  const statusBadgeColor = isPending ? "#b45309" : "#059669"
  const statusPillBg = isPending ? "#fef3c7" : "#dcfce7"
  const statusPillColor = isPending ? "#b45309" : "#15803d"

  const safePaymentMethod = data.payment_method
    ? escapeHtml(data.payment_method)
    : undefined

  const viewOrderBtnHtml = data.view_order_url
    ? `
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(data.view_order_url)}" class="mobile-btn" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
        View Your Order
      </a>
    </div>`
    : ""

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        ${statusBadgeText}
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Payment Confirmation
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        Order <strong style="color: #0f172a;">#${safeOrderNumber}</strong>
      </p>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${safeCustomerName}</strong>,<br>
      We've received your payment of <strong style="color: #0f172a;">${formattedAmount}</strong> successfully. Your order is now being processed.
    </p>

    <!-- Payment Receipt Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Order Reference</td>
          <td align="right" style="padding: 8px 0; font-weight: 700; color: #0f172a;">#${safeOrderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Payment Date</td>
          <td align="right" style="padding: 8px 0; font-weight: 600; color: #0f172a;">${safePaymentDate}</td>
        </tr>
        ${
          safePaymentMethod
            ? `<tr>
                <td style="padding: 8px 0; color: #64748b;">Payment Method</td>
                <td align="right" style="padding: 8px 0; font-weight: 600; color: #0f172a;">${safePaymentMethod}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Payment Status</td>
          <td align="right" style="padding: 8px 0;">
            <span style="display: inline-block; background-color: ${statusPillBg}; color: ${statusPillColor}; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
              ${escapeHtml(rawStatus)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0;">
            Amount Paid
          </td>
          <td align="right" style="padding: 12px 0 0 0; font-size: 17px; font-weight: 900; color: #059669; border-top: 1px solid #e2e8f0;">
            ${formattedAmount}
          </td>
        </tr>
      </table>
    </div>

    ${viewOrderBtnHtml}
  `

  const subject = `Payment Received for Order #${orderNumber} - ${brandName}`
  const html = renderBaseLayout({
    title: subject,
    previewText: `Payment of ${formattedAmount} for Order #${orderNumber} has been received.`,
    content,
    trackPackageUrl: data.view_order_url,
    supportEmail: "orders@laptopzone.co.zw",
    supportPhone: "+263 8612 600 600",
  })

  const text = `${brandName.toUpperCase()} - PAYMENT RECEIPT
Order #${orderNumber}

Hello ${customerName},

We've received your payment of ${formattedAmount} successfully. Your order is now being processed.

RECEIPT DETAILS:
- Order Reference: #${orderNumber}
- Amount Paid: ${formattedAmount}
- Payment Date: ${paymentDate}
${data.payment_method ? `- Payment Method: ${data.payment_method}\n` : ""}- Status: ${rawStatus}

${data.view_order_url ? `View your order: ${data.view_order_url}\n` : ""}
Thank you for choosing ${brandName}.`

  return { subject, html, text }
}
