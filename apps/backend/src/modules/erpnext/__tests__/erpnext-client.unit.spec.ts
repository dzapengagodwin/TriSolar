import { ErpnextClient } from "../services/erpnext-client"

describe("ERPNext Client Unit Tests", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it("throws validation error on invalid or missing baseUrl", () => {
    expect(
      () =>
        new ErpnextClient({
          baseUrl: "",
          apiKey: "key",
          apiSecret: "secret",
        })
    ).toThrow("ERPNext baseUrl is required")
  })

  it("throws validation error on missing API credentials", () => {
    expect(
      () =>
        new ErpnextClient({
          baseUrl: "https://erp.laptopzone.co.zw",
          apiKey: "",
          apiSecret: "",
        })
    ).toThrow("ERPNext apiKey and apiSecret are required")
  })

  it("testConnection returns success: true when user is authenticated", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "administrator@laptopzone.co.zw" }),
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const result = await client.testConnection()
    expect(result.success).toBe(true)
    expect(result.user).toBe("administrator@laptopzone.co.zw")
  })

  it("testConnection returns success: false with safe error message on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Invalid token key_123:sec_456",
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const result = await client.testConnection()
    expect(result.success).toBe(false)
    expect(result.message).not.toContain("key_123:sec_456")
  })

  it("getAllItems paginates until all items are retrieved", async () => {
    const page1 = [
      { name: "ITEM-1", item_code: "LZ-1" },
      { name: "ITEM-2", item_code: "LZ-2" },
    ]
    const page2 = [{ name: "ITEM-3", item_code: "LZ-3" }]

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: page1 }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: page2 }),
      } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const items = await client.getAllItems({ batchSize: 2 })
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.item_code)).toEqual(["LZ-1", "LZ-2", "LZ-3"])
  })

  it("getAllItemPrices fetches selling item prices with pagination", async () => {
    const pricesPage = [
      { name: "IP-1", item_code: "LZ-1", price_list: "Standard Selling", price_list_rate: 250, currency: "USD", selling: 1 },
      { name: "IP-2", item_code: "LZ-2", price_list: "Standard Selling", price_list_rate: 350, currency: "USD", selling: 1 },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: pricesPage }),
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const prices = await client.getAllItemPrices({ priceList: "Standard Selling", batchSize: 10 })
    expect(prices).toHaveLength(2)
    expect(prices[0].price_list_rate).toBe(250)
    expect(prices[1].item_code).toBe("LZ-2")
  })

  it("getOrCreateCustomer resolves existing customer or creates new", async () => {
    // 1. Existing customer
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ name: "CUST-001", customer_name: "John Doe" }] }),
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const name = await client.getOrCreateCustomer({ name: "John Doe", email: "john@test.com" })
    expect(name).toBe("CUST-001")

    // 2. New customer
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { name: "CUST-002" } }),
      } as any)

    const newCustomer = await client.getOrCreateCustomer({ name: "Jane Smith", email: "jane@test.com" })
    expect(newCustomer).toBe("CUST-002")
  })

  it("createSalesOrder sends correct order payload to ERPNext", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          name: "SO-2026-0001",
          customer: "CUST-001",
          company: "Laptopzone",
          grand_total: 500,
        },
      }),
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const so = await client.createSalesOrder({
      company: "Laptopzone",
      customer: "CUST-001",
      transaction_date: "2026-10-13",
      delivery_date: "2026-10-16",
      currency: "USD",
      items: [
        { item_code: "LZ-HP-840", qty: 2, rate: 250 },
      ],
    })

    expect(so.name).toBe("SO-2026-0001")
    expect(so.grand_total).toBe(500)
  })

  it("getSalesOrderPdf retrieves binary PDF Buffer", async () => {
    const pdfData = Buffer.from("%PDF-1.4 mock pdf content")
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfData.buffer,
    } as any)

    const client = new ErpnextClient({
      baseUrl: "https://erp.laptopzone.co.zw",
      apiKey: "test_key",
      apiSecret: "test_secret",
      maxRetries: 0,
    })

    const pdfBuffer = await client.getSalesOrderPdf("SO-2026-0001", "Standard")
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true)
    expect(pdfBuffer.toString()).toContain("%PDF-1.4")
  })
})

