import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function inspectProductsStatus({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 1. Inspect Products
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "status",
      "sales_channels.id",
      "sales_channels.name",
      "variants.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    pagination: {
      take: 20,
    },
  })

  // 2. Count by status
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "status"],
  })

  const statusCounts: Record<string, number> = {}
  for (const p of allProducts || []) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
  }

  // 3. Inspect Sales Channels
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name", "is_disabled"],
  })

  // 4. Inspect Publishable API Keys
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "type", "title", "sales_channels.id", "sales_channels.name"],
  })

  // 5. Inspect Regions
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  logger.info(`Total products in DB: ${allProducts?.length || 0}`)
  logger.info(`Product status counts: ${JSON.stringify(statusCounts)}`)
  logger.info(`Sales channels: ${JSON.stringify(salesChannels)}`)
  logger.info(`API keys (type=publishable): ${JSON.stringify(apiKeys?.filter((k: any) => k.type === "publishable"))}`)
  logger.info(`Regions: ${JSON.stringify(regions)}`)
  logger.info(`Sample products (first 5): ${JSON.stringify(products?.slice(0, 5), null, 2)}`)
}

