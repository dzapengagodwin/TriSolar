export type BaseEmailLayoutOptions = {
  title: string
  previewText?: string
  content: string
}

export function renderBaseLayout({
  title,
  previewText = "",
  content,
}: BaseEmailLayoutOptions): string {
  const currentYear = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(previewText)}</div>` : ""}
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; width: 100%;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Container Table -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 28px 24px; border-bottom: 3px solid #f97316;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
                      LAPTOP<span style="color: #f97316;">ZONE</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">
                      Authentic Hardware &bull; Zimbabwe
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Slot -->
          <tr>
            <td style="padding: 32px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 28px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 28px; background-color: #f8fafc; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">
                LaptopZone Zimbabwe
              </p>
              <p style="margin: 0 0 12px 0;">
                Your Trusted Destination for Laptops, Desktops, Printers & Accessories in Zimbabwe.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${currentYear} LaptopZone. All rights reserved.
              </p>
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
