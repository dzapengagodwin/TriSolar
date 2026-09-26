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
import { renderOwnerOrderNotification } from "../templates/owner-order-notification"

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
          from_name: "Laptopzone",
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
      gift_card_total: 25,
      shipping_total: 10,
      total: 660,
      delivery_method: "Harare Same-Day Delivery",
      payment_method: "Cash on Delivery",
      payment_status: "Pending",
      shipping_address: {
        first_name: "<John>",
        last_name: "Doe & Co",
        address_1: "123 Samora Machel Ave",
        city: "Harare",
        postal_code: "<0000>",
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
          from_name: "Laptopzone",
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
            name: "Laptopzone",
          },
          subject: expect.stringContaining("#1001"),
          text: expect.stringContaining("HP EliteBook 840 G8"),
        })
      )

      const message = (sendgrid.send as jest.Mock).mock.calls.at(-1)?.[0]
      expect(message.cc).toBe("laptops@laptopzone.co.zw")
      expect(message.html).toContain("Gift card")
      expect(message.html).toContain("Harare Same-Day Delivery")
      expect(message.html).toContain("Cash on Delivery (Pending)")
      expect(message.html).toContain("&lt;John&gt;")
      expect(message.html).not.toContain("<John>")
      expect(message.html).not.toContain(">Zimbabwe<")
    })

    it("attaches default CC laptops@laptopzone.co.zw to order confirmation emails", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "customer@example.com",
          cc: "laptops@laptopzone.co.zw",
        })
      )
    })

    it("respects custom order_cc_email option and supports comma-separated list", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_cc_email: "sales@laptopzone.co.zw, manager@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      expect(sendgrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "customer@example.com",
          cc: ["sales@laptopzone.co.zw", "manager@laptopzone.co.zw"],
        })
      )
    })

    it("filters out CC if recipient email is identical to prevent SendGrid error", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_cc_email: "laptops@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "laptops@laptopzone.co.zw",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      const message = (sendgrid.send as jest.Mock).mock.calls.at(-1)?.[0]
      expect(message.cc).toBeUndefined()
    })

    it("disables CC when order_cc_email is 'false' or 'none'", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_cc_email: "false",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "order-confirmation",
        data: orderData as any,
      })

      const message = (sendgrid.send as jest.Mock).mock.calls.at(-1)?.[0]
      expect(message.cc).toBeUndefined()
    })

    it("does not attach CC to non-order emails like password reset", async () => {
      const service = new SendgridNotificationService(
        { logger: mockLogger },
        {
          api_key: "SG.test_key_live",
          from: "orders@laptopzone.co.zw",
          order_cc_email: "laptops@laptopzone.co.zw",
          sandbox: false,
        }
      )

      await service.send({
        to: "customer@example.com",
        channel: "email",
        template: "password-reset",
        data: { customer_name: "Customer", email: "customer@example.com", token: "xyz", reset_url: "http://..." } as any,
      })

      const message = (sendgrid.send as jest.Mock).mock.calls.at(-1)?.[0]
      expect(message.cc).toBeUndefined()
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
          from_name: "Laptopzone",
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
          subject: "Reset Your Laptopzone Password",
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
          subject: expect.stringContaining("Welcome to Laptopzone"),
          html: expect.stringContaining("Welcome to Laptopzone!"),
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
          subject: "Invitation to Join Laptopzone Admin",
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

  describe("renderOwnerOrderNotification", () => {
    const mockOrderData = {
      order_id: "order_12345",
      display_id: 1001,
      date: "Sep 23, 2026, 02:30 PM",
      customer_name: "Jane Smith",
      customer_email: "jane@example.com",
      customer_phone: "+263 77 123 4567",
      currency_code: "usd",
      items: [
        {
          title: "Lenovo ThinkPad E14 Gen 5",
          variant_title: "16GB RAM / 512GB SSD",
          quantity: 2,
          unit_price: 650,
          total_price: 1300,
          thumbnail: "https://cdn.laptopzone.co.zw/thinkpad.jpg",
        },
      ],
      subtotal: 1300,
      discount_total: 50,
      shipping_total: 10,
      tax_total: 0,
      total: 1260,
      payment_method: "Pesepay (EcoCash)",
      payment_status: "Paid",
      delivery_method: "Harare Same-Day Delivery",
      shipping_address: {
        first_name: "Jane",
        last_name: "Smith",
        address_1: "15 Nelson Mandela Ave",
        city: "Harare",
        country_code: "zw",
        phone: "+263 77 123 4567",
      },
      admin_order_url: "http://localhost:9000/app/orders/order_12345",
    }

    it("renders clean merchant email without AI template tropes", () => {
      const result = renderOwnerOrderNotification(mockOrderData)

      expect(result.subject).toBe("New order #1001 — $1,260.00")
      // Should not contain AI tropes
      expect(result.html).not.toContain("STORE ALERT")
      expect(result.html).not.toContain("&rarr;")
      expect(result.html).not.toContain("font-weight: 800")
      expect(result.html).not.toContain("font-weight: 900")
      // Should contain clean typography and details
      expect(result.html).toContain("Order #1001")
      expect(result.html).toContain("Jane Smith")
      expect(result.html).toContain("Lenovo ThinkPad E14 Gen 5")
      expect(result.html).toContain("16GB RAM / 512GB SSD")
      expect(result.html).toContain("Qty 2 &times; $650.00")
      expect(result.html).toContain("Pesepay (EcoCash)")
      expect(result.html).toContain("Harare Same-Day Delivery")
      expect(result.html).toContain("View in Medusa Admin")
      expect(result.html).toContain("http://localhost:9000/app/orders/order_12345")
    })

    it("renders test banner cleanly when is_test is true", () => {
      const result = renderOwnerOrderNotification({
        ...mockOrderData,
        is_test: true,
      })

      expect(result.subject).toBe("[Test] New order #1001 — $1,260.00")
      expect(result.html).toContain("Test notification")
    })

    it("produces readable plain text version", () => {
      const result = renderOwnerOrderNotification(mockOrderData)

      expect(result.text).toContain("Laptopzone Admin Notification: New Order #1001")
      expect(result.text).toContain("Customer: Jane Smith")
      expect(result.text).toContain("Total: $1,260.00")
      expect(result.text).toContain("Lenovo ThinkPad E14 Gen 5")
    })
  })
})

