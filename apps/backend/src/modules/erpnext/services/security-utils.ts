import { MedusaError } from "@medusajs/framework/utils"

/**
 * Validates external ERPNext URL against SSRF and bad protocol vulnerabilities.
 */
export function validateErpnextUrl(url: string): void {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid ERPNext URL format")
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Only HTTP and HTTPS protocols are allowed for ERPNext URL"
    )
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "HTTPS is strictly required for ERPNext connection in production"
    )
  }

  // Block cloud metadata service IP in all environments
  if (hostname === "169.254.169.254" || /^169\.254\./.test(hostname)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Cloud metadata endpoints are strictly forbidden"
    )
  }

  // In production, block localhost and private RFC1918 ranges
  if (process.env.NODE_ENV === "production") {
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1"
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Localhost is not permitted in production"
      )
    }

    if (
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^192\.168\./.test(hostname)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Private network addresses are not permitted in production"
      )
    }
  }
}

/**
 * Redacts sensitive tokens and secrets from strings before logging or returning in error responses.
 */
export function redactSensitiveString(text: string): string {
  if (!text) return ""
  return text
    .replace(/(token\s+)([a-zA-Z0-9_\-]+)(:)([a-zA-Z0-9_\-]+)/gi, "$1[REDACTED_KEY]:[REDACTED_SECRET]")
    .replace(/(api_secret["']?\s*[:=]\s*["']?)([^"',\s]+)/gi, "$1[REDACTED]")
    .replace(/(api_key["']?\s*[:=]\s*["']?)([^"',\s]+)/gi, "$1[REDACTED]")
    .replace(/(password["']?\s*[:=]\s*["']?)([^"',\s]+)/gi, "$1[REDACTED]")
    .replace(/(authorization["']?\s*[:=]\s*["']?)([^"',\s]+)/gi, "$1[REDACTED]")
}

/**
 * Prevents CSV formula injection (OWASP) by prefixing cells starting with formula characters.
 */
export function sanitizeCsvCell(val: any): string {
  if (val === null || val === undefined) {
    return '""'
  }
  let str = String(val).trim()
  // Prefix dangerous formula trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  // Escape internal double quotes
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

