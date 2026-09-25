import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { importWooCommerceProductsWorkflow } from "../workflows/import-woocommerce-products"

export default async function importWooCommerce({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let url = ""
  let key = ""
  let secret = ""
  let currency = "usd"
  let publish = true
  let importCategories = true
  let importTags = false
  let skipVariants = true
  let createdAfter = ""
  let createdBefore = ""

  for (const arg of args) {
    if (arg.startsWith("--url=")) url = arg.split("=").slice(1).join("=")
    if (arg.startsWith("--key=")) key = arg.split("=").slice(1).join("=")
    if (arg.startsWith("--secret=")) secret = arg.split("=").slice(1).join("=")
    if (arg.startsWith("--currency=")) currency = arg.split("=").slice(1).join("=")
    if (arg.startsWith("--after=")) createdAfter = arg.split("=").slice(1).join("=")
    if (arg.startsWith("--before=")) createdBefore = arg.split("=").slice(1).join("=")
    if (arg === "--publish") publish = true
    if (arg === "--draft" || arg === "--no-publish") publish = false
    if (arg === "--no-categories") importCategories = false
    if (arg === "--no-tags") importTags = false
    if (arg === "--include-variants") skipVariants = false
    if (arg === "--skip-variants") skipVariants = true
  }

  if (!url || !key || !secret) {
    logger.error("Missing required arguments.")
    logger.error("Usage: npx medusa exec ./src/scripts/import-woocommerce.ts --url=<wc-url> --key=<ck_...> --secret=<cs_...> [--currency=usd] [--after=YYYY-MM-DD] [--before=YYYY-MM-DD] [--include-variants] [--draft] [--no-categories] [--no-tags]")
    return
  }

  logger.info("Starting WooCommerce product import")
  logger.info(`  URL:        ${url}`)
  logger.info(`  Currency:   ${currency}`)
  logger.info(`  Publish:    ${publish}`)
  logger.info(`  Categories: ${importCategories}`)
  logger.info(`  Tags:       ${importTags}`)
  if (createdAfter) logger.info(`  After:      ${createdAfter}`)
  if (createdBefore) logger.info(`  Before:     ${createdBefore}`)

  try {
    const { result } = await importWooCommerceProductsWorkflow(container).run({
      input: {
        wooUrl: url,
        consumerKey: key,
        consumerSecret: secret,
        currencyCode: currency,
        importCategories,
        importTags,
        publishProducts: publish,
        skipVariants,
        createdAfter: createdAfter || undefined,
        createdBefore: createdBefore || undefined,
      },
    })

    logger.info("=== Import Summary ===")
    logger.info(`Total Products:   ${result.totalProducts}`)
    logger.info(`Imported:         ${result.importedProducts}`)
    logger.info(`Failed:           ${result.failedProducts}`)
    logger.info(`Categories:       ${result.importedCategories}`)
    logger.info(`Collections:      ${result.importedCollections}`)

    if (result.errors.length > 0) {
      logger.warn(`${result.errors.length} error(s) encountered:`)
      for (const error of result.errors) {
        logger.error(`  - ${error}`)
      }
    }

    if (result.importedProductDetails.length > 0) {
      logger.info("Imported Product Details:")
      console.table(
        result.importedProductDetails.map((p) => ({
          "WC ID": p.wcId,
          Title: p.wcTitle,
          "Medusa ID": p.medusaId || "-",
          Variants: p.variantsCount,
          Status: p.status,
        }))
      )
    }
  } catch (error: any) {
    logger.error(`Fatal error during import: ${error.message}`)
  }
}
