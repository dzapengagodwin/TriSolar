import {
  validateErpnextUrl,
  redactSensitiveString,
  sanitizeCsvCell,
} from "../services/security-utils"

describe("ERPNext Security Utils Unit Tests", () => {
  describe("validateErpnextUrl", () => {
    it("accepts valid https URL", () => {
      expect(() => validateErpnextUrl("https://erp.laptopzone.co.zw")).not.toThrow()
    })

    it("throws for non-http/https protocol", () => {
      expect(() => validateErpnextUrl("ftp://erp.laptopzone.co.zw")).toThrow("Only HTTP and HTTPS protocols are allowed")
    })

    it("throws for invalid URL format", () => {
      expect(() => validateErpnextUrl("invalid-url-string")).toThrow("Invalid ERPNext URL format")
    })

    it("blocks cloud metadata service IP", () => {
      expect(() => validateErpnextUrl("http://169.254.169.254/latest/meta-data")).toThrow("Cloud metadata endpoints are strictly forbidden")
    })
  })

  describe("redactSensitiveString", () => {
    it("redacts auth tokens and api secrets", () => {
      const input = "Authorization: token key_12345:sec_67890 in request"
      const redacted = redactSensitiveString(input)
      expect(redacted).not.toContain("key_12345")
      expect(redacted).not.toContain("sec_67890")
      expect(redacted).toContain("[REDACTED_KEY]:[REDACTED_SECRET]")
    })

    it("redacts api_secret key values in json-like error strings", () => {
      const input = '{"error": "bad token", "api_secret": "supersecretvalue"}'
      const redacted = redactSensitiveString(input)
      expect(redacted).not.toContain("supersecretvalue")
      expect(redacted).toContain("[REDACTED]")
    })
  })

  describe("sanitizeCsvCell", () => {
    it("escapes formula injection prefixes with a single quote", () => {
      expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe('"\'=SUM(A1:A10)"')
      expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe('"\' +cmd|\' /C calc\'!A0"'.replace("' ", "'"))
      expect(sanitizeCsvCell("-5+5")).toBe('"\' -5+5"'.replace("' ", "'"))
      expect(sanitizeCsvCell("@malicious")).toBe('"\' @malicious"'.replace("' ", "'"))
    })

    it("handles regular text and escapes internal double quotes", () => {
      expect(sanitizeCsvCell("ThinkPad X1 Carbon 14\"")).toBe('"ThinkPad X1 Carbon 14"""')
      expect(sanitizeCsvCell("Normal SKU-123")).toBe('"Normal SKU-123"')
    })

    it("handles null and undefined safely", () => {
      expect(sanitizeCsvCell(null)).toBe('""')
      expect(sanitizeCsvCell(undefined)).toBe('""')
    })
  })
})
