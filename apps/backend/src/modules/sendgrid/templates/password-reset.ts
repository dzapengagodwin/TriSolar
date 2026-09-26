import { PasswordResetData, SendgridTemplateResult } from "../types"
import { escapeHtml, renderBaseLayout } from "./base-layout"

export function renderPasswordReset(
  data: PasswordResetData
): SendgridTemplateResult {
  const customerName = data.customer_name || "Valued Customer"
  const expiresIn = data.expires_in_hours || 24

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Account Security
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Reset Your Password
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        We received a request to reset the password for your Laptopzone account.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
      Hello <strong>${escapeHtml(customerName)}</strong>,<br>
      To choose a new password and regain access to your account, please click the button below. This link is valid for the next <strong>${expiresIn} hours</strong>.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(data.reset_url)}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.25);">
        Reset Password
      </a>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 12px; color: #64748b; line-height: 1.6;">
      <strong style="color: #0f172a;">Button not working?</strong> Copy and paste this URL into your browser:<br>
      <a href="${escapeHtml(data.reset_url)}" target="_blank" style="color: #2563eb; word-break: break-all;">
        ${escapeHtml(data.reset_url)}
      </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
    </p>
  `

  const subject = "Reset Your Laptopzone Password"
  const html = renderBaseLayout({
    title: subject,
    previewText: "Follow this link to reset your Laptopzone account password.",
    content,
  })

  const text = `LAPTOPZONE ZIMBABWE - PASSWORD RESET

Hello ${customerName},

We received a request to reset your Laptopzone account password.

To set a new password, click the link below (valid for ${expiresIn} hours):
${data.reset_url}

If you did not request this change, please ignore this email.

Laptopzone Zimbabwe`

  return { subject, html, text }
}
