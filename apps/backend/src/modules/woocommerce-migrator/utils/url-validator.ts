import { MedusaError } from "@medusajs/framework/utils"

export function validateExternalUrl(url: string): void {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch (error) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid URL format")
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only HTTP and HTTPS protocols are allowed")
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::1") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Localhost URLs are not permitted")
  }

  if (hostname === "169.254.169.254") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Cloud metadata endpoints are not permitted")
  }

  if (/^10\./.test(hostname)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Private IP ranges are not permitted")
  }
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Private IP ranges are not permitted")
  }
  if (/^192\.168\./.test(hostname)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Private IP ranges are not permitted")
  }
  if (/^169\.254\./.test(hostname)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Private IP ranges are not permitted")
  }
}
