import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createTaxRegionsWorkflow,
  createTaxRatesWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedTaxRates({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Checking existing tax regions...")

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "provider_id", "tax_rates.*"],
  })

  const targetCountries = ["zw", "gb", "de", "dk", "us"]

  for (const country of targetCountries) {
    let region: any = taxRegions?.find(
      (r: any) => r.country_code?.toLowerCase() === country.toLowerCase()
    )

    if (!region) {
      logger.info(`Creating tax region for ${country.toUpperCase()}...`)
      const { result } = await createTaxRegionsWorkflow(container).run({
        input: [
          {
            country_code: country.toLowerCase(),
            provider_id: "tp_system",
          },
        ],
      })
      region = result?.[0]
    }

    if (region) {
      const existingRates = region.tax_rates || []
      const hasVatRate = existingRates.some(
        (rate: any) => rate.code === "VAT" || rate.rate === 15
      )

      if (!hasVatRate) {
        logger.info(
          `Creating default 15% VAT tax rate for ${country.toUpperCase()} (Region: ${region.id})...`
        )
        await createTaxRatesWorkflow(container).run({
          input: [
            {
              tax_region_id: region.id,
              name: "VAT (15%)",
              code: "VAT",
              rate: 15,
              is_default: true,
            },
          ],
        })
        logger.info(`Default 15% VAT attached to ${country.toUpperCase()}.`)
      } else {
        logger.info(
          `Tax region ${country.toUpperCase()} already has VAT configured.`
        )
      }
    }
  }

  logger.info("Tax regions and VAT rates configuration complete.")
}
