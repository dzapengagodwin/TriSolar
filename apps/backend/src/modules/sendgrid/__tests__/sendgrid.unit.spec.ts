import sendgrid from "@sendgrid/mail"
import { SendgridNotificationService } from "../service"
import {
  OrderConfirmationData,
  PaymentConfirmationData,
  ShipmentConfirmationData,
  PasswordResetData,
  WelcomeData,
  InviteData,
} from "../types"

// Mock SendGrid SDK
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202, headers: { "x-message-id": "sg_test_12345" } }]),
}))

describe("SendgridNotificationService", () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Initialization", () => {
    it("initializes in sandbox mode with a warning if API key is not provided", () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        { from: "orders@laptopzone.co.zw", sandbox: true }
      )

      expect(service).toBeDefined()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("SENDGRID_API_KEY is not set")
      )
    })

    it("configures SendGrid API key when provided", () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_12345",
          from: "orders@laptopzone.co.zw",
          from_name: "LaptopZone",
        }
      )

      expect(service).toBeDefined()
      expect(sendgrid.setApiKey).toHaveBeenCalledWith("SG.test_key_12345")
    })
  })

  describe("Order Confirmation Notification", () => {
    const orderData: OrderConfirmationData = {
      order_id: "order_123",
      display_id: 1001,
      date: "Aug 28, 2026",
      customer_name: "John Doe",
      customer_email: "john@example.com",
      currency_code: "USD",
      items: [
        {
          title: "HP EliteBook 840 G8",
          variant_title: "16GB RAM / 512GB SSD",
          quantity: 1,
          unit_price: 650,
          total_price: 650,
        },
      ],
      subtotal: 650,
      shipping_total: 10,
      total: 660,
      shipping_address: {
        first_name: "John",
        last_name: "Doe",
        address_1: "123 Samora Machel Ave",
        city: "Harare",
        country_code: "zw",
      },
      view_order_url: "http://localhost:8000/zw/order/confirmed/order_123",
    }

    it("simulates email sending in sandbox mode", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        { from: "orders@laptopzone.co.zw", sandbox: true }
      )

      const result = await service.send({
        to: "john@example.com",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      expect(result.id).toContain("mock_sendgrid_")
      expect(sendgrid.send).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Email simulated successfully")
      )
    })

    it("sends live email through SendGrid when configured", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          from_name: "LaptopZone",
          sandbox: false,
        }
      )

      const result = await service.send({
        to: "john@example.com",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      expect(result.id).toBe("sg_test_12345")
      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          from: {
            email: "orders@laptopzone.co.zw",
            name: "LaptopZone",
          },
          subject: expect.stringContaining("#1001"),
          html: expect.stringContaining("HP EliteBook 840 G8"),
          text: expect.stringContaining("HP EliteBook 840 G8"),
        })
      )
    })
  })

  describe("Payment Confirmation Notification", () => {
    const paymentData: PaymentConfirmationData = {
      order_id: "order_123",
      display_id: 1001,
      customer_name: "John Doe",
      customer_email: "john@example.com",
      amount: 660,
      currency_code: "USD",
      payment_date: "Aug 28, 2026",
      status: "CAPTURED",
    }

    it("renders payment receipt and sends via SendGrid", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          from_name: "LaptopZone",
          sandbox: false,
        }
      )

      const result = await service.send({
        to: "john@example.com",
        channel: "email",
        template: "payment-confirmation",
        data: paymentData as any,
      })

      expect(result.id).toBe("sg_test_12345")
      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Payment Received for Order #1001"),
          html: expect.stringContaining("$660.00"),
        })
      )
    })
  })

  describe("Shipment Confirmation Notification", () => {
    const shipmentData: ShipmentConfirmationData = {
      order_id: "order_123",
      display_id: 1001,
      customer_name: "John Doe",
      customer_email: "john@example.com",
      fulfillment_status: "Dispatched",
      tracking_number: "LZ-ZW-987654",
      tracking_url: "https://track.laptopzone.co.zw/LZ-ZW-987654",
      carrier: "Harare Express",
      items: [
        {
          title: "HP EliteBook 840 G8",
          quantity: 1,
        },
      ],
    }

    it("renders shipment details and tracking info", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "john@example.com",
        channel: "email",
        template: "shipment-confirmation",
        data: shipmentData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Has Been Dispatched"),
          html: expect.stringContaining("LZ-ZW-987654"),
        })
      )
    })
  })

  describe("Password Reset Notification", () => {
    const passwordResetData: PasswordResetData = {
      customer_name: "Jane Doe",
      email: "jane@example.com",
      token: "secret_reset_token_123",
      reset_url: "http://localhost:8000/zw/account/reset-password?token=secret_reset_token_123",
      expires_in_hours: 24,
    }

    it("renders password reset email with secure link", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "jane@example.com",
        channel: "email",
        template: "password-reset",
        data: passwordResetData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "jane@example.com",
          subject: "Reset Your LaptopZone Password",
          html: expect.stringContaining("secret_reset_token_123"),
        })
      )
    })
  })

  describe("Welcome Notification", () => {
    const welcomeData: WelcomeData = {
      customer_name: "Jane Doe",
      email: "jane@example.com",
      storefront_url: "http://localhost:8000/zw",
    }

    it("renders welcome email for new customers", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "jane@example.com",
        channel: "email",
        template: "welcome",
        data: welcomeData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "jane@example.com",
          subject: expect.stringContaining("Welcome to LaptopZone"),
          html: expect.stringContaining("Welcome to LaptopZone!"),
        })
      )
    })
  })

  describe("Invite Notification", () => {
    const inviteData: InviteData = {
      email: "staff@laptopzone.co.zw",
      token: "invite_token_456",
      invite_url: "http://localhost:9000/app/invite?token=invite_token_456",
      role: "admin",
    }

    it("renders staff invitation email", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "staff@laptopzone.co.zw",
        channel: "email",
        template: "invite",
        data: inviteData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "staff@laptopzone.co.zw",
          subject: "Invitation to Join LaptopZone Admin",
          html: expect.stringContaining("invite_token_456"),
        })
      )
    })
  })

  describe("Error Handling", () => {
    it("handles missing recipient gracefully", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        { from: "orders@laptopzone.co.zw", sandbox: true }
      )

      const result = await service.send({
        to: "",
        channel: "email",
        template: "order-confirmation",
        data: {},
      })

      expect(result).toEqual({})
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("missing recipient")
      )
    })

    it("handles unknown template gracefully", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        { from: "orders@laptopzone.co.zw", sandbox: true }
      )

      const result = await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "non-existent-template",
        data: {},
      })

      expect(result).toEqual({})
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Unknown template")
      )
    })

    it("logs sanitized error and returns empty object on SendGrid API failure", async () => {
      ;(sendgrid.send as jest.Mock).mockRejectedValueOnce({
        code: 401,
        response: {
          statusCode: 401,
          body: {
            errors: [{ message: "The provided authorization grant is invalid, expired, or revoked" }],
          },
        },
      })

      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.invalid_key",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      const result = await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "welcome",
        data: { customer_name: "Customer", email: "customer@example.com" },
      })

      expect(result).toEqual({})
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send email")
      )
      // Ensure API key was NOT leaked in error logs
      expect(mockLogger.error).not.toHaveBeenCalledWith(
        expect.stringContaining("SG.invalid_key")
      )
    })
  })

  describe("Sender Email Routing", () => {
    it("routes order templates to order_from_email (orders@laptopzone.co.zw)", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_from_email: "orders@laptopzone.co.zw",
          account_from_email: "noreply@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "order-confirmation",
        data: {
          order_id: "123",
          display_id: 101,
          date: "Aug 31, 2026",
          customer_name: "Customer",
          customer_email: "customer@example.com",
          currency_code: "USD",
          items: [],
          subtotal: 100,
          shipping_total: 0,
          total: 100,
        },
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.objectContaining({
            email: "orders@laptopzone.co.zw",
          }),
        })
      )
    })

    it("routes account templates to account_from_email (noreply@laptopzone.co.zw)", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_from_email: "orders@laptopzone.co.zw",
          account_from_email: "noreply@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "password-reset",
        data: {
          email: "customer@example.com",
          token: "reset123",
          reset_url: "http://localhost:8000/reset",
        },
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.objectContaining({
            email: "noreply@laptopzone.co.zw",
          }),
        })
      )
    })

    it("allows explicit from address on notification to override defaults", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_from_email: "orders@laptopzone.co.zw",
          account_from_email: "noreply@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        from: "support@laptopzone.co.zw",
        channel: "email",
        template: "welcome",
        data: {
          customer_name: "Customer",
          email: "customer@example.com",
        },
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.objectContaining({
            email: "support@laptopzone.co.zw",
          }),
        })
      )
    })
  })
})
