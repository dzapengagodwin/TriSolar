import { SendgridTemplateResult, WelcomeData } from "../types"
import { escapeHtml, renderBaseLayout } from "./base-layout"

export function renderWelcome(
  data: WelcomeData
): SendgridTemplateResult {
  const customerName = data.customer_name || "Valued Customer"
  const storeUrl = data.storefront_url || "http://localhost:8000"

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #ffedd5; color: #c2410c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
        Welcome to the Family
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
        Welcome to LaptopZone!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        Your account has been created successfully.
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${escapeHtml(customerName)}</strong>,<br>
      We're thrilled to have you with us! LaptopZone is your premium destination for authentic laptops, high-performance desktops, printers, and accessories with nationwide delivery across Zimbabwe.
    </p>

    <!-- Perks Grid -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 12px;">
            <strong style="color: #0f172a; font-size: 13px;">100% Authentic Hardware</strong><br>
            <span style="font-size: 12px; color: #64748b;">Direct from authorized global distributors with full warranty support.</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px;">
            <strong style="color: #0f172a; font-size: 13px;">Fast &amp; Secure Delivery</strong><br>
            <span style="font-size: 12px; color: #64748b;">Door-to-door delivery across Harare, Bulawayo, and throughout Zimbabwe.</span>
          </td>
        </tr>
        <tr>
          <td>
            <strong style="color: #0f172a; font-size: 13px;">Flexible Payment Options</strong><br>
            <span style="font-size: 12px; color: #64748b;">Pay securely using EcoCash, Zipit, USD, or Visa/Mastercard.</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(storeUrl)}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.25);">
        Explore the Store
      </a>
    </div>
  `

  const subject = "Welcome to LaptopZone Zimbabwe!"
  const html = renderBaseLayout({
    title: subject,
    previewText: "Your account is ready. Discover authentic laptops and hardware with nationwide delivery.",
    content,
  })

  const text = `WELCOME TO LAPTOPZONE ZIMBABWE

Hello ${customerName},

Thank you for creating an account with LaptopZone!

With your new account you can:
- Track orders in real-time
- Save items to your wishlist
- Check out faster with saved addresses

Visit our store: ${storeUrl}

LaptopZone Zimbabwe
Authentic Hardware, Zimbabwe`

  return { subject, html, text }
}
