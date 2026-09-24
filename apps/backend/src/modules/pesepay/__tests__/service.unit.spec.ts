import PesepayPaymentProviderService from "../service"

describe("PesepayPaymentProviderService Unit Tests", () => {
  let service: PesepayPaymentProviderService

  beforeEach(() => {
    service = new PesepayPaymentProviderService({} as any)
  })

  describe("initiatePayment", () => {
    it("should capture and return cart_id in session data", async () => {
      // Mock getActiveConfig
      jest.spyOn(service as any, "getActiveConfig").mockResolvedValue({
        integrationKey: "test_key",
        encryptionKey: "test_encryption_key_32_bytes_long!",
        callbackUrl: "https://storefront.example.com/payment-callback",
      })

      // Mock request
      jest.spyOn(service as any, "request").mockResolvedValue({
        referenceNumber: "PESE-REF-12345",
        redirectUrl: "https://pay.pesepay.com/checkout/12345",
      })

      const result = await service.initiatePayment({
        amount: 2999,
        currency_code: "usd",
        data: {
          cart_id: "cart_01HXTESTCART",
        },
      } as any)

      expect(result.id).toBe("PESE-REF-12345")
      expect(result.status).toBe("pending")
      expect(result.data).toBeDefined()
      expect(result.data?.cart_id).toBe("cart_01HXTESTCART")
      expect(result.data?.referenceNumber).toBe("PESE-REF-12345")
    })
  })

  describe("authorizePayment", () => {
    it("should authorize immediately if webhookConfirmed is present", async () => {
      const result = await service.authorizePayment({
        data: {
          referenceNumber: "PESE-REF-12345",
          webhookConfirmed: true,
          cart_id: "cart_01HXTESTCART",
        },
      } as any)

      expect(result.status).toBe("authorized")
      expect(result.data).toBeDefined()
      expect(result.data?.webhookConfirmed).toBe(true)
      expect(result.data?.cart_id).toBe("cart_01HXTESTCART")
    })
  })

  describe("status mapping", () => {
    it("should map SUCCESS, COMPLETED, CAPTURED to captured", () => {
      const mapStatus = (service as any).mapStatus.bind(service)
      expect(mapStatus("SUCCESS")).toBe("captured")
      expect(mapStatus("SUCCESSFUL")).toBe("captured")
      expect(mapStatus("COMPLETED")).toBe("captured")
      expect(mapStatus("captured")).toBe("captured")
    })

    it("should map FAILED to error and CANCELLED to canceled", () => {
      const mapStatus = (service as any).mapStatus.bind(service)
      expect(mapStatus("FAILED")).toBe("error")
      expect(mapStatus("error")).toBe("error")
      expect(mapStatus("CANCELLED")).toBe("canceled")
      expect(mapStatus("canceled")).toBe("canceled")
    })

    it("should map PENDING to pending", () => {
      const mapStatus = (service as any).mapStatus.bind(service)
      expect(mapStatus("PENDING")).toBe("pending")
      expect(mapStatus("INITIATED")).toBe("pending")
    })
  })
})
