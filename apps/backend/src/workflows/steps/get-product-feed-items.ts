import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
import { ProductFeedConfig, ProductFeedDiagnostic, ProductFeedItem } from "./types"
import { FeedProduct, mapProductToFeedItem } from "./map-product-to-feed-item"
import { validateFeedItem } from "./validate-feed-item"

export const getProductFeedItemsStep = createStep(
  "get-product-feed-items",
  async (config: ProductFeedConfig, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const queryFilters = { status: "published" }
    const fields = [
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
      "variants.calculated_price.calculated_amount",
      "variants.calculated_price.original_amount",
      "variants.calculated_price.currency_code",
      "sales_channels.id",
      "sales_channels.stock_locations.id",
      "sales_channels.stock_locations.address.country_code",
      "variants.inventory_items.inventory.location_levels.location_id",
      "variants.inventory_items.inventory.location_levels.stocked_quantity",
      "variants.inventory_items.inventory.location_levels.reserved_quantity",
    ]
    const pageSize = 100
    let offset = 0
    let productCount = 0
    const products: FeedProduct[] = []

    do {
      const { data, metadata } = await query.graph({
        entity: "product",
        fields,
        filters: queryFilters,
        context: {
          variants: {
            calculated_price: QueryContext({
              currency_code: config.currency_code.toLowerCase(),
            }),
          },
        },
        pagination: { skip: offset, take: pageSize },
      })

      const page = data as FeedProduct[]
      products.push(...page)
      productCount = metadata?.count ?? offset + page.length
      offset += page.length
    } while (offset < productCount && offset > 0)

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
        const warnings = [...validation.warnings]
        const hasVariantIdentifiers = Boolean(
          variant.barcode ||
            variant.ean ||
            variant.upc ||
            variant.metadata?.gtin ||
            (variant.metadata?.google_merchant as Record<string, unknown> | undefined)?.gtin ||
            (variant.metadata?.google_merchant as Record<string, unknown> | undefined)?.mpn ||
            variant.metadata?.mpn ||
            variant.metadata?.manufacturer_mpn ||
            variant.metadata?.part_number
        )
        if (
          variants.length > 1 &&
          !hasVariantIdentifiers &&
          (merchant.gtin || merchant.mpn || product.metadata?.gtin || product.metadata?.mpn)
        ) {
          warnings.push(
            "Product-level GTIN/MPN was omitted for a multi-variant product; add each variant's manufacturer identifiers to its variant metadata."
          )
        }

        diagnostics.push({
          variant_id: variant.id,
          product_id: product.id,
          title: rawFeedItem.title,
          valid: validation.valid,
          errors: validation.errors,
          warnings,
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
