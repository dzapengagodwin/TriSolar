import { validateExternalUrl } from "../utils/url-validator"

describe("URL Validator Unit Tests", () => {
  describe("Valid external URLs", () => {
    it("should not throw for valid https URL", () => {
      expect(() => validateExternalUrl("https://store.example.com")).not.toThrow()
    })

    it("should not throw for valid http URL", () => {
      expect(() => validateExternalUrl("http://store.example.com")).not.toThrow()
    })
  })

  describe("Invalid or blocked URLs", () => {
    it("should throw for localhost", () => {
      expect(() => validateExternalUrl("http://localhost")).toThrow()
    })

    it("should throw for localhost with port", () => {
      expect(() => validateExternalUrl("http://localhost:3000")).toThrow()
    })

    it("should throw for 127.0.0.1 loopback IP", () => {
      expect(() => validateExternalUrl("http://127.0.0.1")).toThrow()
    })

    it("should throw for 10.0.0.1 private IP", () => {
      expect(() => validateExternalUrl("http://10.0.0.1")).toThrow()
    })

    it("should throw for 172.16.0.1 private IP", () => {
      expect(() => validateExternalUrl("http://172.16.0.1")).toThrow()
    })

    it("should throw for 192.168.1.1 private IP", () => {
      expect(() => validateExternalUrl("http://192.168.1.1")).toThrow()
    })

    it("should throw for 169.254.169.254 AWS metadata endpoint", () => {
      expect(() => validateExternalUrl("http://169.254.169.254")).toThrow()
    })

    it("should throw for 0.0.0.0 IP", () => {
      expect(() => validateExternalUrl("http://0.0.0.0")).toThrow()
    })

    it("should throw for ftp scheme (non-http scheme)", () => {
      expect(() => validateExternalUrl("ftp://files.example.com")).toThrow()
    })

    it("should throw for file scheme", () => {
      expect(() => validateExternalUrl("file:///etc/passwd")).toThrow()
    })

    it("should throw for not-a-url malformed string", () => {
      expect(() => validateExternalUrl("not-a-url")).toThrow()
    })
  })
})
