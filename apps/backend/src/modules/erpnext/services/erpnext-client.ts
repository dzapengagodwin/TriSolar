import { MedusaError } from "@medusajs/framework/utils"
import { validateErpnextUrl, redactSensitiveString } from "./security-utils"

export interface ErpnextItem {
  name: string
  item_code: string
  item_name?: string
  disabled?: number
  is_stock_item?: number
  stock_uom?: string
  standard_rate?: number
}

export interface ErpnextItemPrice {
  name: string
  item_code: string
  price_list: string
  price_list_rate: number
  currency: string
  selling: number
}

export interface ErpnextBin {
  name: string
  item_code: string
  warehouse: string
  actual_qty: number
  reserved_qty?: number
}

export interface ErpnextWarehouse {
  name: string
  warehouse_name?: string
  is_group?: number
  company?: string
  disabled?: number
}

export interface ErpnextSalesOrderItem {
  item_code: string
  item_name?: string
  qty: number
  rate: number
  amount?: number
  warehouse?: string
  delivery_date?: string
}

export interface ErpnextSalesOrderData {
  company: string
  customer: string
  transaction_date: string // YYYY-MM-DD
  delivery_date: string // YYYY-MM-DD
  currency: string
  po_no?: string
  items: ErpnextSalesOrderItem[]
  customer_address?: string
  remarks?: string
}

export interface ErpnextSalesOrder {
  name: string
  customer: string
  company: string
  status?: string
  docstatus?: number
  grand_total?: number
  currency?: string
}

export interface ErpnextClientOptions {
  baseUrl: string
  apiKey: string
  apiSecret: string
  timeoutMs?: number
  maxRetries?: number
}

export class ErpnextClient {
  private baseUrl: string
  private apiKey: string
  private apiSecret: string
  private timeoutMs: number
  private maxRetries: number

  constructor(options: ErpnextClientOptions) {
    if (!options.baseUrl) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "ERPNext baseUrl is required")
    }
    if (!options.apiKey || !options.apiSecret) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "ERPNext apiKey and apiSecret are required")
    }

    validateErpnextUrl(options.baseUrl)

    this.baseUrl = options.baseUrl.replace(/\/+$/, "")
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret
    this.timeoutMs = options.timeoutMs ?? 25000
    this.maxRetries = options.maxRetries ?? 3
  }

  private async request<T = any>(
    path: string,
    init: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`

    const headers: Record<string, string> = {
      Authorization: `token ${this.apiKey}:${this.apiSecret}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!res.ok) {
        let errBody = ""
        try {
          const jsonErr = await res.json()
          errBody = JSON.stringify(jsonErr)
        } catch {
          errBody = await res.text()
        }

        const safeErr = redactSensitiveString(errBody)

        // Only retry on 5xx or 429
        if ((res.status >= 500 || res.status === 429) && retryCount < this.maxRetries) {
          const backoff = Math.min(1000 * 2 ** retryCount, 8000) + Math.random() * 200
          await new Promise((r) => setTimeout(r, backoff))
          return this.request<T>(path, init, retryCount + 1)
        }

        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `ERPNext API error (${res.status}): ${safeErr}`
        )
      }

      return (await res.json()) as T
    } catch (err: any) {
      clearTimeout(timer)

      if (err.name === "AbortError") {
        if (retryCount < this.maxRetries) {
          const backoff = Math.min(1000 * 2 ** retryCount, 8000) + Math.random() * 200
          await new Promise((r) => setTimeout(r, backoff))
          return this.request<T>(path, init, retryCount + 1)
        }
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `ERPNext request timed out after ${this.timeoutMs}ms`
        )
      }

      // If it's a network error and we have retries left
      if (
        !(err instanceof MedusaError) &&
        retryCount < this.maxRetries &&
        (err.code === "ECONNRESET" || err.code === "ETIMEDOUT" || err.message?.includes("fetch failed"))
      ) {
        const backoff = Math.min(1000 * 2 ** retryCount, 8000) + Math.random() * 200
        await new Promise((r) => setTimeout(r, backoff))
        return this.request<T>(path, init, retryCount + 1)
      }

      const safeMsg = redactSensitiveString(err.message || "Unknown ERPNext error")
      if (err instanceof MedusaError) {
        throw err
      }
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, safeMsg)
    }
  }

  /**
   * Tests ERPNext connection and credentials without modifying any state.
   */
  async testConnection(): Promise<{ success: boolean; user?: string; message?: string }> {
    try {
      const data = await this.request<{ message?: string; data?: any }>(
        "/api/method/frappe.auth.get_logged_user"
      )
      const user = data?.message || "ERPNext User"
      return {
        success: true,
        user,
        message: `Successfully connected to ERPNext as ${user}`,
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
      }
    }
  }

  /**
   * Fetches active non-group warehouses.
   */
  async getWarehouses(company?: string): Promise<ErpnextWarehouse[]> {
    const filters: any[] = [["is_group", "=", 0], ["disabled", "=", 0]]
    if (company) {
      filters.push(["company", "=", company])
    }

    const fields = JSON.stringify(["name", "warehouse_name", "company", "is_group", "disabled"])
    const encodedFilters = encodeURIComponent(JSON.stringify(filters))
    const encodedFields = encodeURIComponent(fields)

    const res = await this.request<{ data: ErpnextWarehouse[] }>(
      `/api/resource/Warehouse?fields=${encodedFields}&filters=${encodedFilters}&limit_page_length=500`
    )

    return res.data || []
  }

  /**
   * Fetches all items from ERPNext with auto-pagination.
   * Includes standard_rate for fallback price resolution.
   */
  async getAllItems(options: { batchSize?: number } = {}): Promise<ErpnextItem[]> {
    const batchSize = options.batchSize ?? 100
    const fields = JSON.stringify([
      "name",
      "item_code",
      "item_name",
      "disabled",
      "is_stock_item",
      "stock_uom",
      "standard_rate",
    ])
    const encodedFields = encodeURIComponent(fields)

    const allItems: ErpnextItem[] = []
    let start = 0
    let hasMore = true

    while (hasMore) {
      const path = `/api/resource/Item?fields=${encodedFields}&limit_start=${start}&limit_page_length=${batchSize}`
      const res = await this.request<{ data: ErpnextItem[] }>(path)
      const items = res.data || []

      allItems.push(...items)

      if (items.length < batchSize) {
        hasMore = false
      } else {
        start += items.length
      }
    }

    return allItems
  }

  /**
   * Fetches all selling Item Prices from ERPNext with auto-pagination.
   * Optionally filtered by price list (e.g. "Standard Selling").
   */
  async getAllItemPrices(options: { priceList?: string; batchSize?: number } = {}): Promise<ErpnextItemPrice[]> {
    const batchSize = options.batchSize ?? 100
    const filters: any[] = [["selling", "=", 1]]
    if (options.priceList) {
      filters.push(["price_list", "=", options.priceList])
    }

    const fields = JSON.stringify([
      "name",
      "item_code",
      "price_list",
      "price_list_rate",
      "currency",
      "selling",
    ])
    const encodedFields = encodeURIComponent(fields)
    const encodedFilters = encodeURIComponent(JSON.stringify(filters))

    const allPrices: ErpnextItemPrice[] = []
    let start = 0
    let hasMore = true

    while (hasMore) {
      const path = `/api/resource/Item Price?fields=${encodedFields}&filters=${encodedFilters}&limit_start=${start}&limit_page_length=${batchSize}`
      const res = await this.request<{ data: ErpnextItemPrice[] }>(path)
      const prices = res.data || []

      allPrices.push(...prices)

      if (prices.length < batchSize) {
        hasMore = false
      } else {
        start += prices.length
      }
    }

    return allPrices
  }

  /**
   * Fetches stock balances (Bins) with auto-pagination, optionally filtered by warehouse.
   */
  async getAllBins(options: { warehouse?: string; batchSize?: number } = {}): Promise<ErpnextBin[]> {
    const batchSize = options.batchSize ?? 100
    const fields = JSON.stringify(["name", "item_code", "warehouse", "actual_qty", "reserved_qty"])
    const encodedFields = encodeURIComponent(fields)

    let filterParam = ""
    if (options.warehouse) {
      const filters = [["warehouse", "=", options.warehouse]]
      filterParam = `&filters=${encodeURIComponent(JSON.stringify(filters))}`
    }

    const allBins: ErpnextBin[] = []
    let start = 0
    let hasMore = true

    while (hasMore) {
      const path = `/api/resource/Bin?fields=${encodedFields}${filterParam}&limit_start=${start}&limit_page_length=${batchSize}`
      const res = await this.request<{ data: ErpnextBin[] }>(path)
      const bins = res.data || []

      allBins.push(...bins)

      if (bins.length < batchSize) {
        hasMore = false
      } else {
        start += bins.length
      }
    }

    return allBins
  }

  /**
   * Resolves or creates a Customer document in ERPNext.
   */
  async getOrCreateCustomer(customer: { name: string; email?: string; phone?: string }): Promise<string> {
    const customerName = customer.name.trim() || "Online Store Customer"
    const filters = encodeURIComponent(JSON.stringify([["customer_name", "=", customerName]]))

    try {
      const existing = await this.request<{ data: Array<{ name: string; customer_name: string }> }>(
        `/api/resource/Customer?filters=${filters}&limit_page_length=1`
      )

      if (existing.data && existing.data.length > 0) {
        return existing.data[0].name
      }
    } catch {
      // ignore and attempt creation
    }

    // Create customer in ERPNext
    const created = await this.request<{ data: { name: string } }>("/api/resource/Customer", {
      method: "POST",
      body: JSON.stringify({
        customer_name: customerName,
        customer_type: "Individual",
        customer_group: "Individual",
        territory: "All Territories",
        email_id: customer.email || undefined,
        mobile_no: customer.phone || undefined,
      }),
    })

    return created.data.name
  }

  /**
   * Creates a Sales Order in ERPNext.
   */
  async createSalesOrder(orderData: ErpnextSalesOrderData): Promise<ErpnextSalesOrder> {
    const res = await this.request<{ data: ErpnextSalesOrder }>("/api/resource/Sales Order", {
      method: "POST",
      body: JSON.stringify({
        naming_series: "SO-.YYYY.-",
        company: orderData.company,
        customer: orderData.customer,
        transaction_date: orderData.transaction_date,
        delivery_date: orderData.delivery_date,
        currency: orderData.currency.toUpperCase(),
        po_no: orderData.po_no,
        items: orderData.items.map((item) => ({
          item_code: item.item_code,
          item_name: item.item_name || item.item_code,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount ?? item.qty * item.rate,
          warehouse: item.warehouse,
          delivery_date: orderData.delivery_date,
        })),
        customer_address: orderData.customer_address,
        remarks: orderData.remarks,
      }),
    })

    return res.data
  }

  /**
   * Downloads the official Frappe/ERPNext Sales Order PDF as a binary Buffer.
   */
  async getSalesOrderPdf(salesOrderName: string, printFormat?: string): Promise<Buffer> {
    const path = `/api/method/frappe.utils.print_format.download_pdf?doctype=Sales+Order&name=${encodeURIComponent(
      salesOrderName
    )}&format=${encodeURIComponent(printFormat || "Standard")}&no_letterhead=0`

    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Authorization: `token ${this.apiKey}:${this.apiSecret}`,
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!res.ok) {
        const errText = await res.text()
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to download Sales Order PDF (${res.status}): ${redactSensitiveString(errText)}`
        )
      }

      const arrayBuffer = await res.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (err: any) {
      clearTimeout(timer)
      const safeMsg = redactSensitiveString(err.message || "Failed to download PDF")
      if (err instanceof MedusaError) {
        throw err
      }
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, safeMsg)
    }
  }
}
