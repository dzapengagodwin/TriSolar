import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ProductFeedConfig, ProductFeedDiagnostic, ProductFeedItem } from "./types"
import { mapProductToFeedItem } from "./map-product-to-feed-item"
import { validateFeedItem } from "./validate-feed-item"

export const getProductFeedItemsStep = createStep(
  "get-product-feed-items",
  async (config: ProductFeedConfig, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const queryFilters: any = {
      status: "published",
    }

    if (config.sales_channel_id) {
      queryFilters.sales_channels = {
        id: config.sales_channel_id,
      }
    }

    // Query published products with all relations, inventory, variants and pricing
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "thumbnail",
        "status",
        "metadata",
        "images.id",
        "images.url",
        "categories.id",
        "categories.name",
        "categories.handle",
        "collection.id",
        "collection.title",
        "brand.id",
        "brand.name",
        "brand.handle",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.barcode",
        "variants.ean",
        "variants.upc",
        "variants.manage_inventory",
        "variants.allow_backorder",
        "variants.metadata",
        "variants.options.value",
        "variants.options.option.title",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "variants.prices.price_list_id",
        "variants.inventory_items.inventory.location_levels.stocked_quantity",
        "variants.inventory_items.inventory.location_levels.reserved_quantity",
      ],
      filters: queryFilters,
      context: {
        currency_code: config.currency_code.toLowerCase(),
        country_code: config.country_code.toLowerCase(),
      },
    })

    const validItems: ProductFeedItem[] = []
    const diagnostics: ProductFeedDiagnostic[] = []

    for (const product of products || []) {
      const merchant = (product.metadata?.google_merchant || {}) as Record<string, unknown>
      if (merchant.excluded === true) {
        continue
      }

      const variants = product.variants || []

      for (const variant of variants) {
        const rawFeedItem = mapProductToFeedItem(product, variant, config)
        const validation = validateFeedItem(rawFeedItem)

        diagnostics.push({
          variant_id: variant.id,
          product_id: product.id,
          title: rawFeedItem.title,
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
        })

        if (validation.valid) {
          validItems.push(validation.sanitizedItem)
        }
      }
    }

    return new StepResponse({
      items: validItems,
      diagnostics,
    })
  }
)
