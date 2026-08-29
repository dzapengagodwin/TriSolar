import { PaymentConfirmationData, SendgridTemplateResult } from "../types"
import { escapeHtml, formatMoney, renderBaseLayout } from "./base-layout"

export function renderPaymentConfirmation(
  data: PaymentConfirmationData
): SendgridTemplateResult {
  const currency = data.currency_code || "USD"
  const orderNumber = data.display_id || data.order_id
  const customerName = data.customer_name || "Valued Customer"
  const formattedAmount = formatMoney(data.amount, currency)

  const viewOrderBtnHtml = data.view_order_url
    ? `
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(data.view_order_url)}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
        View Order Status
      </a>
    </div>`
    : ""

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Payment Received
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Payment Confirmation
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        We have successfully received payment for Order <strong style="color: #0f172a;">#${orderNumber}</strong>.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${escapeHtml(customerName)}</strong>,<br>
      This email serves as an official receipt confirming your payment has been processed and captured.
    </p>

    <!-- Payment Receipt Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Order Reference</td>
          <td align="right" style="padding: 6px 0; font-weight: 700; color: #0f172a;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Payment Date</td>
          <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(data.payment_date)}</td>
        </tr>
        ${
          data.payment_method
            ? `<tr>
                <td style="padding: 6px 0; color: #64748b;">Payment Method</td>
                <td align="right" style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(data.payment_method)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Payment Status</td>
          <td align="right" style="padding: 6px 0;">
            <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
              ${escapeHtml(data.status || "CAPTURED")}
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

  const subject = `Payment Received for Order #${orderNumber} - LaptopZone`
  const html = renderBaseLayout({
    title: subject,
    previewText: `Payment of ${formattedAmount} for Order #${orderNumber} has been received.`,
    content,
  })

  const text = `LAPTOPZONE ZIMBABWE - PAYMENT RECEIPT
Order #${orderNumber}

Hello ${customerName},

We have successfully processed your payment of ${formattedAmount} for Order #${orderNumber}.

RECEIPT DETAILS:
- Order Reference: #${orderNumber}
- Amount Paid: ${formattedAmount}
- Payment Date: ${data.payment_date}
- Status: ${data.status || "CAPTURED"}

${data.view_order_url ? `View your order: ${data.view_order_url}\n` : ""}
Thank you for choosing LaptopZone Zimbabwe.`

  return { subject, html, text }
}
