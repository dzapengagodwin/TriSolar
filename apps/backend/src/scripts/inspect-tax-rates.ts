import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inspectTaxRates({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: [
      "id",
      "country_code",
      "provider_id",
      "tax_rates.id",
      "tax_rates.name",
      "tax_rates.code",
      "tax_rates.rate",
      "tax_rates.is_default",
      "tax_rates.is_combinable",
      "tax_rates.created_at",
    ],
  })

  logger.info("Found Tax Regions:\n" + JSON.stringify(taxRegions, null, 2))
}
