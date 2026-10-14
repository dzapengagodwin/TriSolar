import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import { ERPNEXT_MODULE } from "../index"
import { ErpnextClient, ErpnextSalesOrderData, ErpnextSalesOrderItem } from "./erpnext-client"

export interface CreateSalesOrderResult {
  success: boolean
  salesOrderId?: string
  pdfBuffer?: Buffer
  pdfFilePath?: string
  message?: string
}

/**
 * Ensures public directory for sales order PDFs exists and returns absolute path.
 */
export function getSalesOrderStorageDir(): string {
  const dir = path.resolve(process.cwd(), "public", "sales-orders")
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Creates an ERPNext Sales Order for a given Medusa Order and downloads the official PDF.
 */
export async function syncMedusaOrderToErpnext(
  orderId: string,
  container: any
): Promise<CreateSalesOrderResult> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let erpnextService: any
  try {
    erpnextService = container.resolve(ERPNEXT_MODULE)
  } catch {
    return { success: false, message: "ERPNext module not found in container" }
  }

  const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })
  const baseUrl = process.env.ERPNEXT_BASE_URL
  const apiKey = process.env.ERPNEXT_API_KEY
  const apiSecret = process.env.ERPNEXT_API_SECRET
  const defaultCompany = settings?.default_company || process.env.ERPNEXT_DEFAULT_COMPANY || "Laptopzone"
  const defaultWarehouse = settings?.default_warehouse || process.env.ERPNEXT_DEFAULT_WAREHOUSE || "Stores - LZ"

  if (!baseUrl || !apiKey || !apiSecret) {
    logger.warn(`[ERPNext Sales Order] Missing ERPNext credentials. Skipping Sales Order creation for order ${orderId}.`)
    return { success: false, message: "ERPNext credentials not configured" }
  }

  // 1. Fetch order details from Medusa Graph
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "subtotal",
      "created_at",
      "metadata",
      "customer.id",
      "customer.first_name",
      "customer.last_name",
      "customer.email",
      "customer.phone",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.phone",
      "shipping_address.address_1",
      "shipping_address.city",
      "shipping_address.country_code",
      "items.id",
      "items.title",
      "items.variant_id",
      "items.variant_title",
      "items.variant_sku",
      "items.variant.sku",
      "items.quantity",
      "items.unit_price",
      "items.total",
    ],
    filters: { id: orderId },
  })

  const order = orders?.[0]
  if (!order) {
    return { success: false, message: `Order ${orderId} not found` }
  }

  // Idempotency check: If Sales Order already exists, return cached/existing record
  const existingSalesOrderId = (order.metadata as any)?.erpnext_sales_order_id
  if (existingSalesOrderId) {
    const storageDir = getSalesOrderStorageDir()
    const cachedPdfPath = path.join(storageDir, `${order.id}.pdf`)
    let pdfBuffer: Buffer | undefined
    if (fs.existsSync(cachedPdfPath)) {
      pdfBuffer = fs.readFileSync(cachedPdfPath)
    } else {
      try {
        const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })
        const printFormat = settings?.sales_order_print_format || "Standard"
        pdfBuffer = await client.getSalesOrderPdf(existingSalesOrderId, printFormat)
        fs.writeFileSync(cachedPdfPath, pdfBuffer)
      } catch (err: any) {
        logger.warn(`[ERPNext Sales Order] Could not re-fetch PDF for existing SO ${existingSalesOrderId}: ${err.message}`)
      }
    }
    return {
      success: true,
      salesOrderId: existingSalesOrderId,
      pdfBuffer,
      pdfFilePath: cachedPdfPath,
      message: `Sales Order ${existingSalesOrderId} already exists for this order`,
    }
  }

  const client = new ErpnextClient({ baseUrl, apiKey, apiSecret })

  // 2. Resolve Customer in ERPNext
  const customerName =
    [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(" ") ||
    order.customer?.first_name ||
    order.email ||
    "Online Store Customer"

  let erpCustomerName = "Online Store Customer"
  try {
    erpCustomerName = await client.getOrCreateCustomer({
      name: customerName,
      email: order.email || order.customer?.email,
      phone: order.shipping_address?.phone || order.customer?.phone,
    })
  } catch (custErr: any) {
    logger.warn(`[ERPNext Sales Order] Could not create customer "${customerName}": ${custErr.message}. Falling back to default.`)
  }

  // 3. Map line items (matching ERP item_code to variant SKU)
  const orderItems = order.items || []
  const soItems: ErpnextSalesOrderItem[] = []

  const orderDate = new Date(order.created_at || Date.now()).toISOString().split("T")[0]
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  for (const item of orderItems) {
    const sku = item.variant_sku?.trim() || item.variant?.sku?.trim() || item.title?.trim() || "MISC"
    const unitPrice = typeof item.unit_price === "number" ? item.unit_price : Number(item.unit_price) || 0
    const qty = typeof item.quantity === "number" ? item.quantity : Number(item.quantity) || 1

    soItems.push({
      item_code: sku,
      item_name: item.title || sku,
      qty,
      rate: unitPrice,
      amount: unitPrice * qty,
      warehouse: defaultWarehouse,
      delivery_date: deliveryDate,
    })
  }

  if (soItems.length === 0) {
    return { success: false, message: "Order has no line items" }
  }

  // 4. Create Sales Order in ERPNext
  const soData: ErpnextSalesOrderData = {
    company: defaultCompany,
    customer: erpCustomerName,
    transaction_date: orderDate,
    delivery_date: deliveryDate,
    currency: (order.currency_code || "usd").toUpperCase(),
    po_no: `#${order.display_id || order.id.slice(-6)}`,
    items: soItems,
    customer_address: order.shipping_address?.address_1,
    remarks: `Created automatically from Medusa Order #${order.display_id || order.id}`,
  }

  let salesOrder: any
  try {
    salesOrder = await client.createSalesOrder(soData)
    logger.info(`[ERPNext Sales Order] Created Sales Order ${salesOrder.name} for Medusa order #${order.display_id || order.id}`)
  } catch (err: any) {
    logger.error(`[ERPNext Sales Order] Failed to create Sales Order in ERPNext: ${err.message}`)
    return { success: false, message: err.message }
  }

  // 5. Download Sales Order PDF from ERPNext
  let pdfBuffer: Buffer | undefined
  let pdfFilePath: string | undefined

  try {
    const printFormat = settings?.sales_order_print_format || "Standard"
    pdfBuffer = await client.getSalesOrderPdf(salesOrder.name, printFormat)

    // Save to disk
    const storageDir = getSalesOrderStorageDir()
    pdfFilePath = path.join(storageDir, `${order.id}.pdf`)
    fs.writeFileSync(pdfFilePath, pdfBuffer)
    logger.info(`[ERPNext Sales Order] Downloaded and cached PDF to ${pdfFilePath}`)
  } catch (pdfErr: any) {
    logger.warn(`[ERPNext Sales Order] Could not download PDF immediately: ${pdfErr.message}`)
  }

  // 6. Update Medusa Order Metadata with ERPNext Sales Order details
  try {
    const currentMetadata = (order.metadata || {}) as Record<string, any>
    const orderModuleService = container.resolve(Modules.ORDER)
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...currentMetadata,
        erpnext_sales_order_id: salesOrder.name,
        erpnext_sales_order_status: "created",
        erpnext_sales_order_created_at: new Date().toISOString(),
        erpnext_sales_order_pdf_filename: `Sales-Order-${order.display_id || order.id}.pdf`,
      },
    })
  } catch (metaErr: any) {
    logger.warn(`[ERPNext Sales Order] Could not update order metadata: ${metaErr.message}`)
  }

  return {
    success: true,
    salesOrderId: salesOrder.name,
    pdfBuffer,
    pdfFilePath,
    message: `Sales Order ${salesOrder.name} created successfully`,
  }
}
