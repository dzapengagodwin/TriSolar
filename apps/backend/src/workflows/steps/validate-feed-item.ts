import { ProductFeedItem } from "./types"

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
  sanitizedItem: ProductFeedItem
}

/**
 * Validates and sanitizes a single product feed item according to Google Merchant Center specification
 */
export function validateFeedItem(item: ProductFeedItem): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const sanitized: ProductFeedItem = {
    ...item,
    title: (item.title || "").trim().slice(0, 150),
    description: (item.description || "").trim().slice(0, 5000),
  }

  // 1. Required field: id
  if (!sanitized.id || typeof sanitized.id !== "string") {
    errors.push("Missing or invalid id")
  }

  // 2. Required field: title
  if (!sanitized.title) {
    errors.push("Missing title")
  }

  // 3. Required field: description
  if (!sanitized.description) {
    errors.push("Missing description")
  }

  // 4. Required field: link
  if (!sanitized.link || !/^https?:\/\//i.test(sanitized.link)) {
    errors.push(`Invalid product link URL: "${sanitized.link}"`)
  }

  // 5. Required field: image_link
  if (!sanitized.image_link || !/^https?:\/\//i.test(sanitized.image_link)) {
    errors.push(`Invalid image link URL: "${sanitized.image_link}"`)
  }

  // 6. Required field: availability
  const validAvailabilities = ["in_stock", "out_of_stock", "preorder"]
  if (!validAvailabilities.includes(sanitized.availability)) {
    errors.push(`Invalid availability: "${sanitized.availability}"`)
  }

  // 7. Required field: price (Format: '123.45 USD')
  if (!sanitized.price || !/^\d+(\.\d{1,2})?\s+[A-Z]{3}$/.test(sanitized.price)) {
    errors.push(`Invalid price format: "${sanitized.price}". Expected format "123.45 USD"`)
  }

  // 8. Sale price (if present, must match format)
  if (sanitized.sale_price && !/^\d+(\.\d{1,2})?\s+[A-Z]{3}$/.test(sanitized.sale_price)) {
    warnings.push(`Invalid sale_price format: "${sanitized.sale_price}". Ignored.`)
    delete sanitized.sale_price
  }

  // 9. Condition
  const validConditions = ["new", "refurbished", "used"]
  if (!validConditions.includes(sanitized.condition)) {
    warnings.push(`Invalid condition "${sanitized.condition}", defaulting to "new"`)
    sanitized.condition = "new"
  }

  // 10. Unique Product Identifiers (GTIN, MPN, Brand)
  if (sanitized.gtin) {
    sanitized.gtin = String(sanitized.gtin).trim().replace(/[\s-]/g, "")
  }
  if (sanitized.mpn) {
    sanitized.mpn = String(sanitized.mpn).trim()
  }

  const hasGtin = !!sanitized.gtin && sanitized.gtin.length >= 8
  const hasBrand = !!sanitized.brand && String(sanitized.brand).trim().length > 0
  const hasMpn = !!sanitized.mpn && sanitized.mpn.length > 0

  // Google Merchant rules: If no identifiers (GTIN or MPN) exist, identifier_exists MUST be 'no'.
  // If identifiers do exist, default to 'yes' unless explicitly set to 'no'.
  const hasIdentifiers = hasGtin || (hasBrand && hasMpn)

  if (!hasIdentifiers) {
    sanitized.identifier_exists = "no"
  } else if (sanitized.identifier_exists !== "no") {
    sanitized.identifier_exists = "yes"
  }

  if (sanitized.identifier_exists === "no") {
    if (!hasBrand) {
      warnings.push("Missing brand identifier")
    }
    if (!hasGtin && !hasMpn) {
      warnings.push("Missing both GTIN and MPN unique identifiers")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedItem: sanitized,
  }
}
