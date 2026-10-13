import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { syncMedusaOrderToErpnext } from "../modules/erpnext/services/sales-order-service"
import { ERPNEXT_MODULE } from "../modules/erpnext"

export default async function orderErpnextSalesOrderHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const erpnextService = container.resolve(ERPNEXT_MODULE) as any
    const [settings] = await erpnextService.listErpnextSettings({}, { take: 1 })

    // Check if auto-create is enabled (defaults to true)
    if (settings && settings.auto_create_sales_order === false) {
      logger.info(`[Subscriber: order.placed -> ERPNext] Auto Sales Order creation disabled in settings. Skipping for order ${data.id}.`)
      return
    }

    logger.info(`[Subscriber: order.placed -> ERPNext] Triggering ERPNext Sales Order sync for order ${data.id}...`)
    const result = await syncMedusaOrderToErpnext(data.id, container)

    if (result.success) {
      logger.info(`[Subscriber: order.placed -> ERPNext] Successfully created Sales Order ${result.salesOrderId} for order ${data.id}`)
    } else {
      logger.warn(`[Subscriber: order.placed -> ERPNext] Sales Order creation skipped/failed: ${result.message}`)
    }
  } catch (error: any) {
    logger.error(`[Subscriber: order.placed -> ERPNext] Error creating ERPNext Sales Order for order ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
