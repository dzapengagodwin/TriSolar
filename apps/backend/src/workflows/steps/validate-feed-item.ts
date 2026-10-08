import { ProductFeedItem } from "./types"
import { isValidGtin, normalizeGtin } from "./normalize-gtin"

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
  sanitizedItem: ProductFeedItem
}

function isValidHttpUrl(value: string): boolean {
  if (!value || value !== value.trim() || /\s/.test(value) || value.length > 2000) {
    return false
  }

  try {
    const url = new URL(value)
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !!url.hostname &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
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

  if (!sanitized.id || sanitized.id.length > 50) {
    errors.push("Product id is required and must not exceed 50 characters")
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
  if (!isValidHttpUrl(sanitized.link)) {
    errors.push(`Invalid product link URL: "${sanitized.link}"`)
  }

  // 5. Required field: image_link
  if (!isValidHttpUrl(sanitized.image_link)) {
    errors.push(`Invalid image link URL: "${sanitized.image_link}"`)
  }

  // 6. Required field: availability
  const validAvailabilities = ["in_stock", "out_of_stock", "preorder", "backorder"]
  if (!validAvailabilities.includes(sanitized.availability)) {
    errors.push(`Invalid availability: "${sanitized.availability}"`)
  }

  if (sanitized.availability === "preorder" || sanitized.availability === "backorder") {
    const availabilityDate = sanitized.availability_date
    const parsedDate = availabilityDate ? new Date(availabilityDate) : null
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      errors.push(`Availability date is required for ${sanitized.availability} items`)
    } else {
      sanitized.availability_date = parsedDate.toISOString()
    }
  }

  // 7. Required field: price (Format: '123.45 USD')
  const priceMatch = sanitized.price.match(/^(\d+(?:\.\d{1,2})?)\s+([A-Z]{3})$/)
  if (!priceMatch || Number(priceMatch[1]) <= 0) {
    errors.push(`Invalid price format: "${sanitized.price}". Expected format "123.45 USD"`)
  }

  // 8. Sale price (if present, must match format)
  if (sanitized.sale_price) {
    const salePriceMatch = sanitized.sale_price.match(
      /^(\d+(?:\.\d{1,2})?)\s+([A-Z]{3})$/
    )
    if (
      !salePriceMatch ||
      Number(salePriceMatch[1]) <= 0 ||
      !priceMatch ||
      salePriceMatch[2] !== priceMatch[2] ||
      Number(salePriceMatch[1]) >= Number(priceMatch[1])
    ) {
      warnings.push(`Invalid sale_price format or amount: "${sanitized.sale_price}". Ignored.`)
      delete sanitized.sale_price
    }
  }

  // 9. Condition
  const validConditions = ["new", "refurbished", "used"]
  if (!validConditions.includes(sanitized.condition)) {
    warnings.push(`Invalid condition "${sanitized.condition}", defaulting to "new"`)
    sanitized.condition = "new"
  }

  // 10. Unique Product Identifiers (GTIN, MPN, Brand)
  if (sanitized.gtin) {
    const normalizedGtin = normalizeGtin(sanitized.gtin)
    if (!normalizedGtin || !isValidGtin(normalizedGtin)) {
      warnings.push(`Invalid GTIN "${sanitized.gtin}" was omitted from the feed item`)
      delete sanitized.gtin
    } else {
      sanitized.gtin = normalizedGtin
    }
  }
  if (sanitized.mpn) {
    sanitized.mpn = String(sanitized.mpn).trim()
  }

  const hasGtin = !!sanitized.gtin && isValidGtin(sanitized.gtin)
  const hasBrand = !!sanitized.brand && String(sanitized.brand).trim().length > 0
  const hasMpn = !!sanitized.mpn && sanitized.mpn.length > 0

  // Never claim identifiers do not exist when valid identifiers are included.
  const hasIdentifiers = hasGtin || (hasBrand && hasMpn)

  if (hasIdentifiers) {
    if (sanitized.identifier_exists === "no") {
      warnings.push("identifier_exists was changed to yes because valid identifiers are present")
    }
    sanitized.identifier_exists = "yes"
  } else if (sanitized.identifier_exists === "yes") {
    warnings.push("identifier_exists is yes, but no GTIN or brand and MPN combination was provided")
  } else {
    sanitized.identifier_exists = "no"
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
