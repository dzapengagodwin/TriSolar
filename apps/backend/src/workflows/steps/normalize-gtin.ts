const GTIN_LENGTHS = new Set([8, 12, 13, 14])

export function normalizeGtin(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  const normalized = String(value).trim().replace(/[\s-]/g, "")
  return normalized || undefined
}

export function isValidGtin(value: string): boolean {
  if (!/^\d+$/.test(value) || !GTIN_LENGTHS.has(value.length)) {
    return false
  }

  const checkDigit = Number(value[value.length - 1])
  let sum = 0

  for (let index = value.length - 2, position = 0; index >= 0; index -= 1, position += 1) {
    sum += Number(value[index]) * (position % 2 === 0 ? 3 : 1)
  }

  return (10 - (sum % 10)) % 10 === checkDigit
}
