import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function fixInflatedPrices({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const isDryRun = (args || []).some((a) => a.includes("dry-run"))
  const forceAll = (args || []).some((a) => a.includes("force"))

  logger.info("Scanning catalog for inflated prices...")
  if (isDryRun) {
    logger.info("Running in DRY-RUN mode (no database updates will be applied)")
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "metadata",
      "variants.id",
      "variants.title",
      "variants.metadata",
      "variants.prices.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
  })

  if (!products || products.length === 0) {
    logger.info("No products found in catalog.")
    return
  }

  const variantPricesToUpdate: {
    variant_id: string
    product_id: string
    prices: {
      id: string
      amount: number
      currency_code: string
    }[]
  }[] = []

  let fixedCount = 0
  const summary: {
    title: string
    variant: string
    oldPrice: number
    newPrice: number
    reason: string
  }[] = []

  for (const product of products as any[]) {
    const pMeta = product.metadata || {}
    const rawWooRegular = pMeta.woo_regular_price
    const rawWooSale = pMeta.woo_sale_price
    const parsedWooRegular = rawWooRegular ? parseFloat(String(rawWooRegular).replace(/,/g, "")) : null
    const parsedWooSale = rawWooSale ? parseFloat(String(rawWooSale).replace(/,/g, "")) : null
    const targetWooPrice = (parsedWooSale && parsedWooSale > 0)
      ? parsedWooSale
      : (parsedWooRegular && parsedWooRegular > 0)
      ? parsedWooRegular
      : null

    for (const variant of product.variants || []) {
      const vMeta = variant.metadata || {}
      const vWooRegular = vMeta.woo_regular_price ? parseFloat(String(vMeta.woo_regular_price).replace(/,/g, "")) : null
      const vWooSale = vMeta.woo_sale_price ? parseFloat(String(vMeta.woo_sale_price).replace(/,/g, "")) : null
      const targetVariantPrice = (vWooSale && vWooSale > 0)
        ? vWooSale
        : (vWooRegular && vWooRegular > 0)
        ? vWooRegular
        : targetWooPrice

      for (const price of variant.prices || []) {
        const currentAmount = Number(price.amount)
        if (isNaN(currentAmount) || currentAmount <= 0) continue

        let correctedAmount: number | null = null
        let fixReason = ""

        if (targetVariantPrice && Math.round(targetVariantPrice * 100) === Math.round(currentAmount)) {
          // Exact 100x match with WooCommerce metadata (e.g. 109000 vs 1090.00)
          correctedAmount = targetVariantPrice
          fixReason = `Matched WC price ($${targetVariantPrice})`
        } else if (forceAll && currentAmount >= 5000) {
          // Fallback if forced: divide by 100 for any price >= 5000
          correctedAmount = Math.round((currentAmount / 100) * 100) / 100
          fixReason = "Forced 100x reduction"
        } else if (currentAmount >= 10000 && (pMeta.woo_product_id || vMeta.stock_status)) {
          // Belongs to WooCommerce import and price is abnormally large (>= 10,000)
          correctedAmount = Math.round((currentAmount / 100) * 100) / 100
          fixReason = "WooCommerce imported item with 100x inflation"
        }

        if (correctedAmount !== null && correctedAmount !== currentAmount) {
          fixedCount++
          summary.push({
            title: product.title,
            variant: variant.title,
            oldPrice: currentAmount,
            newPrice: correctedAmount,
            reason: fixReason,
          })

          variantPricesToUpdate.push({
            variant_id: variant.id,
            product_id: product.id,
            prices: [
              {
                id: price.id,
                amount: correctedAmount,
                currency_code: price.currency_code || "usd",
              },
            ],
          })
        }
      }
    }
  }

  if (summary.length === 0) {
    logger.info("All variant prices appear correct. No inflated prices detected.")
    return
  }

  logger.info(`Found ${summary.length} price(s) that need correction:`)
  console.table(
    summary.slice(0, 30).map((s) => ({
      Product: s.title.slice(0, 35),
      Variant: s.variant.slice(0, 20),
      "Current ($)": `$${s.oldPrice.toFixed(2)}`,
      "Corrected ($)": `$${s.newPrice.toFixed(2)}`,
      Reason: s.reason,
    }))
  )

  if (summary.length > 30) {
    logger.info(`... and ${summary.length - 30} more item(s)`)
  }

  if (isDryRun) {
    logger.info(`Dry run complete. Run with: npx medusa exec ./src/scripts/fix-inflated-prices.ts to apply corrections to ${fixedCount} variant(s).`)
    return
  }

  const pricingModule = container.resolve(Modules.PRICING)
  const pricesToUpdate = variantPricesToUpdate.flatMap((v) => v.prices)

  logger.info(`Applying corrections to ${pricesToUpdate.length} variant prices...`)
  const batchSize = 50
  let updatedCount = 0

  for (let i = 0; i < pricesToUpdate.length; i += batchSize) {
    const chunk = pricesToUpdate.slice(i, i + batchSize)
    try {
      await (pricingModule as any).updatePrices(
        chunk.map((p) => ({
          id: p.id,
          amount: p.amount,
        }))
      )
      updatedCount += chunk.length
      logger.info(`Updated batch ${Math.floor(i / batchSize) + 1} (${updatedCount}/${pricesToUpdate.length})`)
    } catch (batchErr: any) {
      logger.error(`Error updating batch: ${batchErr.message}`)
    }
  }

  logger.info(`Successfully updated ${updatedCount} variant price(s).`)
}
