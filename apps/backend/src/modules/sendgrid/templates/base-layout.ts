export type BaseEmailLayoutOptions = {
  title: string
  previewText?: string
  content: string
  trackPackageUrl?: string
  supportEmail?: string
  supportPhone?: string
  showHelpSection?: boolean
}

export function renderBaseLayout({
  title,
  previewText = "",
  content,
  trackPackageUrl,
  supportEmail = "orders@laptopzone.co.zw",
  supportPhone = "+263 8612 600 600",
  showHelpSection = true,
}: BaseEmailLayoutOptions): string {
  const storefrontUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"
  const cleanPhone = supportPhone.replace(/\s+/g, "")
  const trackUrl = trackPackageUrl || storefrontUrl

  const helpSectionHtml = showHelpSection
    ? `
    <!-- Problems with the Order? Section -->
    <div style="margin-top: 36px;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800; color: #0f172a; text-align: center; letter-spacing: -0.3px;">
        Problems with the Order?
      </h3>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <!-- Email Us Card -->
          <td width="48%" class="mobile-stack" style="vertical-align: top;">
            <a href="mailto:${escapeHtml(supportEmail)}" style="text-decoration: none; display: block;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f6ff; border-radius: 14px; padding: 14px 16px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
                      EMAIL US
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; word-break: break-all;">
                      ${escapeHtml(supportEmail)}
                    </div>
                  </td>
                  <td align="right" width="32" style="vertical-align: middle; padding-left: 8px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>
          <td width="4%" class="mobile-stack-gap">&nbsp;</td>
          <!-- Phone Us Card -->
          <td width="48%" class="mobile-stack" style="vertical-align: top;">
            <a href="tel:${escapeHtml(cleanPhone)}" style="text-decoration: none; display: block;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f6ff; border-radius: 14px; padding: 14px 16px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
                      PHONE US
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap;">
                      ${escapeHtml(supportPhone)}
                    </div>
                  </td>
                  <td align="right" width="32" style="vertical-align: middle; padding-left: 8px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      </table>
    </div>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .mobile-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-padding {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .mobile-card-padding {
        padding: 24px 16px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-bottom: 12px !important;
      }
      .mobile-stack-gap {
        display: none !important;
      }
      .mobile-btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
        padding: 14px 20px !important;
      }
      .mobile-logo {
        max-width: 120px !important;
        height: auto !important;
      }
      .mobile-nav-link {
        font-size: 12px !important;
        margin-right: 10px !important;
      }
      .mobile-footer {
        padding: 24px 16px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(previewText)}</div>` : ""}
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; width: 100%;">
    <tr>
      <td align="center" class="mobile-padding" style="padding: 16px 12px 32px 12px;">
        <!-- Container Table -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="mobile-container" style="max-width: 600px; width: 100%;">
          
          <!-- Top Header Navigation -->
          <tr>
            <td style="padding: 12px 4px 24px 4px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${escapeHtml(storefrontUrl)}" style="text-decoration: none; display: inline-block;">
                      <img src="https://cdn.laptopzone.co.zw/logo.png" alt="LaptopZone" width="140" class="mobile-logo" style="display: block; height: auto; border: 0; max-height: 40px; object-fit: contain;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="${escapeHtml(trackUrl)}" class="mobile-nav-link" style="font-size: 13px; font-weight: 600; color: #0f172a; text-decoration: none; margin-right: 18px;">
                      Track Package
                    </a>
                    <a href="mailto:${escapeHtml(supportEmail)}" style="font-size: 13px; font-weight: 600; color: #0f172a; text-decoration: none;">
                      Contact Us
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Slot -->
          <tr>
            <td>
              ${content}
            </td>
          </tr>

          <!-- Problems with Order Support Box -->
          <tr>
            <td>
              ${helpSectionHtml}
            </td>
          </tr>

          <!-- Vibrant Blue Footer -->
          <tr>
            <td style="padding-top: 24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0066ff; border-radius: 18px; padding: 32px 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <!-- Brand Typography in Footer -->
                    <div style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px;">
                      LAPTOP<span style="color: #fed7aa;">ZONE</span>
                    </div>
                    <!-- Physical Store Address -->
                    <div style="font-size: 12px; color: #ffffff; opacity: 0.9; margin-bottom: 12px; line-height: 1.5;">
                      Authentic Hardware &bull; Harare, Zimbabwe
                    </div>
                    <!-- Email Preferences -->
                    <div style="font-size: 11px; color: #ffffff; opacity: 0.8; margin-bottom: 24px;">
                      <a href="${escapeHtml(storefrontUrl)}" style="color: #ffffff; text-decoration: underline;">Unsubscribe</a> or <a href="${escapeHtml(storefrontUrl)}" style="color: #ffffff; text-decoration: underline;">Change email preferences</a>
                    </div>
                    <!-- Social Media Links (Pure White SVGs) -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <!-- Instagram -->
                        <td style="padding: 0 10px;">
                          <a href="https://instagram.com" style="display: inline-block; text-decoration: none;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                          </a>
                        </td>
                        <!-- X (Twitter) -->
                        <td style="padding: 0 10px;">
                          <a href="https://twitter.com" style="display: inline-block; text-decoration: none;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style="display: block;">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                        </td>
                        <!-- Facebook -->
                        <td style="padding: 0 10px;">
                          <a href="https://facebook.com" style="display: inline-block; text-decoration: none;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style="display: block;">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                          </a>
                        </td>
                        <!-- TikTok -->
                        <td style="padding: 0 10px;">
                          <a href="https://tiktok.com" style="display: inline-block; text-decoration: none;">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="#ffffff" style="display: block;">
                              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v-3a3 3 0 0 1-3-3H9v12z"/>
                            </svg>
                          </a>
                        </td>
                        <!-- YouTube -->
                        <td style="padding: 0 10px;">
                          <a href="https://youtube.com" style="display: inline-block; text-decoration: none;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style="display: block;">
                              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0066ff"/>
                            </svg>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function formatMoney(amount: any, currencyCode: string = "USD"): string {
  if (amount === null || amount === undefined) {
    const currencyUpper = (currencyCode || "USD").toUpperCase()
    return currencyUpper === "USD" ? "$0.00" : `${currencyUpper} 0.00`
  }

  let num = 0
  if (typeof amount === "number") {
    num = amount
  } else if (typeof amount === "string") {
    num = parseFloat(amount)
  } else if (typeof amount === "object") {
    num = Number(amount?.numeric ?? amount?.value ?? amount?.amount ?? 0)
  } else {
    num = Number(amount)
  }

  if (isNaN(num)) num = 0

  const formatted = num.toFixed(2)
  const currencyUpper = (currencyCode || "USD").toUpperCase()

  if (currencyUpper === "USD") {
    return `$${formatted}`
  }
  return `${currencyUpper} ${formatted}`
}
