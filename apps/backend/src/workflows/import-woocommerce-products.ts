import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createProductCategoriesWorkflow,
  createCollectionsWorkflow,
  createProductsWorkflow,
  createPriceListsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { WooCommerceClient } from "../modules/woocommerce-migrator/services/woocommerce-client"
import { WooCommerceTransformer } from "../modules/woocommerce-migrator/services/woocommerce-transformer"
import type { WooVariation } from "../modules/woocommerce-migrator/services/woocommerce-client"

export type ImportWooCommerceInput = {
  wooUrl: string
  consumerKey: string
  consumerSecret: string
  currencyCode: string
  importCategories: boolean
  importTags: boolean
  publishProducts: boolean
  createPriceList?: boolean
  jsonData?: {
    products?: any[]
    categories?: any[]
    tags?: any[]
  }
}

export type ImportedProductDetail = {
  wcId: number
  wcTitle: string
  medusaId: string
  variantsCount: number
  status: "success" | "failed" | "skipped"
  error?: string
}

export type ImportResult = {
  totalProducts: number
  importedProducts: number
  failedProducts: number
  importedCategories: number
  importedCollections: number
  errors: string[]
  importedProductDetails: ImportedProductDetail[]
}

export const importWooCommerceStep = createStep(
  "import-woo-commerce",
  async (input: ImportWooCommerceInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    let wooProducts: any[] = []
    let wooCategories: any[] = []
    let wooTags: any[] = []
    const variationsMap = new Map<number, WooVariation[]>()

    if (input.jsonData) {
      logger.info("Using provided JSON data for import")
      if (Array.isArray(input.jsonData)) {
        wooProducts = input.jsonData
      } else {
        wooProducts = input.jsonData.products || []
        wooCategories = input.jsonData.categories || []
        wooTags = input.jsonData.tags || []
      }
    } else {
      const client = new WooCommerceClient(
        input.wooUrl,
        input.consumerKey,
        input.consumerSecret
      )

      logger.info("Fetching products from WooCommerce API")
      wooProducts = await client.fetchAllProducts()

      if (input.importCategories) {
        logger.info("Fetching categories from WooCommerce API")
        wooCategories = await client.fetchAllCategories()
      }

      if (input.importTags) {
        logger.info("Fetching tags from WooCommerce API")
        wooTags = await client.fetchAllTags()
      }

      for (const product of wooProducts) {
        if (product.type === "variable" && product.variations?.length > 0) {
          logger.info(`Fetching variations for product: ${product.name}`)
          try {
            const variations = await client.fetchProductVariations(product.id)
            variationsMap.set(product.id, variations)
          } catch (err: any) {
            logger.warn(`Failed to fetch variations for product ${product.name}: ${err.message}`)
          }
        }
      }
    }

    const transformer = new WooCommerceTransformer()
    const result: ImportResult = {
      totalProducts: wooProducts.length,
      importedProducts: 0,
      failedProducts: 0,
      importedCategories: 0,
      importedCollections: 0,
      errors: [],
      importedProductDetails: [],
    }

    const categoryMap = new Map<number, string>()
    const collectionMap = new Map<number, string>()
    const importedVariantsPrices: { variantId: string; amount: number; currencyCode: string }[] = []

    // Resolve or create "Web Sales Channel"
    let webSalesChannelId: string | undefined
    try {
      // First try to get the store's default sales channel
      const { data: stores } = await query.graph({
        entity: "store",
        fields: ["id", "default_sales_channel_id"],
      })
      if (stores?.[0]?.default_sales_channel_id) {
        webSalesChannelId = stores[0].default_sales_channel_id
        logger.info(`Using store default sales channel: ${webSalesChannelId}`)
      }
    } catch (err: any) {
      logger.warn(`Failed to fetch store default sales channel: ${err.message}`)
    }

    // Fall back to name-based lookup
    if (!webSalesChannelId) {
      try {
        const { data: salesChannels } = await query.graph({
          entity: "sales_channel",
          fields: ["id", "name"],
        })
        const webChannel = salesChannels.find(
          (sc: any) =>
            sc.name.toLowerCase() === "web sales channel" ||
            sc.name.toLowerCase() === "default sales channel"
        )
        if (webChannel) {
          webSalesChannelId = webChannel.id
          logger.info(`Found sales channel by name: ${webChannel.name}`)
        }
      } catch (err: any) {
        logger.warn(`Failed to fetch sales channels: ${err.message}`)
      }
    }

    // Create if still not found
    if (!webSalesChannelId) {
      try {
        const channelsResult = await createSalesChannelsWorkflow(container).run({
          input: {
            salesChannelsData: [
              {
                name: "Web Sales Channel",
                description: "Sales Channel for WooCommerce Migrated Products",
              },
            ],
          },
        })
        webSalesChannelId = channelsResult.result[0]?.id
        logger.info(`Created Web Sales Channel: ${webSalesChannelId}`)
      } catch (err: any) {
        logger.error(`Failed to create Web Sales Channel: ${err.message}`)
      }
    }

    // Fetch existing categories to prevent duplicates
    let existingCategories: any[] = []
    try {
      const { data } = await query.graph({
        entity: "product_category",
        fields: ["id", "name", "handle"],
      })
      existingCategories = data || []
    } catch (err: any) {
      logger.warn(`Failed to fetch existing categories: ${err.message}`)
    }

    // Import categories
    if (input.importCategories && wooCategories.length > 0) {
      logger.info(`Importing ${wooCategories.length} categories`)
      try {
        const transformedCategories = transformer.transformCategories(wooCategories)

        // Filter out categories that already exist in Medusa
        const categoriesToCreate = transformedCategories.filter((newCat) => {
          const matched = existingCategories.find(
            (ec) => ec.handle === newCat.handle || ec.name.toLowerCase() === newCat.name.toLowerCase()
          )
          if (matched) {
            // Map the WooCommerce category to the existing Medusa category ID
            const wcCat = wooCategories.find(
              (wc) => wc.slug === newCat.handle || wc.name.toLowerCase() === newCat.name.toLowerCase()
            )
            if (wcCat) {
              categoryMap.set(wcCat.id, matched.id)
            }
            return false
          }
          return true
        })

        if (categoriesToCreate.length > 0) {
          const categoriesResult = await createProductCategoriesWorkflow(container).run({
            input: {
              product_categories: categoriesToCreate,
            },
          })

          result.importedCategories = categoriesResult.result.length

          for (const wcCategory of wooCategories) {
            const medusaCategory = categoriesResult.result.find(
              (c: any) => c.handle === wcCategory.slug || c.name === wcCategory.name
            )
            if (medusaCategory) {
              categoryMap.set(wcCategory.id, medusaCategory.id)
            }
          }
        }
      } catch (error: any) {
        logger.error(`Failed to import categories: ${error.message}`)
        result.errors.push(`Category import error: ${error.message}`)
      }
    }

    // Fetch existing collections to prevent duplicates
    let existingCollections: any[] = []
    try {
      const { data } = await query.graph({
        entity: "product_collection",
        fields: ["id", "title", "handle"],
      })
      existingCollections = data || []
    } catch (err: any) {
      logger.warn(`Failed to fetch existing collections: ${err.message}`)
    }

    // Import tags as collections
    if (input.importTags && wooTags.length > 0) {
      logger.info(`Importing ${wooTags.length} tags as collections`)
      try {
        const transformedCollections = transformer.transformTags(wooTags)

        // Filter out collections that already exist in Medusa
        const collectionsToCreate = transformedCollections.filter((newColl) => {
          const matched = existingCollections.find(
            (ec) => ec.handle === newColl.handle || ec.title.toLowerCase() === newColl.title.toLowerCase()
          )
          if (matched) {
            // Map the WooCommerce tag to the existing Medusa collection ID
            const wcTag = wooTags.find(
              (wt) => wt.slug === newColl.handle || wt.name.toLowerCase() === newColl.title.toLowerCase()
            )
            if (wcTag) {
              collectionMap.set(wcTag.id, matched.id)
            }
            return false
          }
          return true
        })

        if (collectionsToCreate.length > 0) {
          const collectionsResult = await createCollectionsWorkflow(container).run({
            input: {
              collections: collectionsToCreate,
            },
          })

          result.importedCollections = collectionsResult.result.length

          for (const wcTag of wooTags) {
            const medusaCollection = collectionsResult.result.find(
              (c: any) => c.handle === wcTag.slug || c.title === wcTag.name
            )
            if (medusaCollection) {
              collectionMap.set(wcTag.id, medusaCollection.id)
            }
          }
        }
      } catch (error: any) {
        logger.error(`Failed to import collections: ${error.message}`)
        result.errors.push(`Collection import error: ${error.message}`)
      }
    }

    // Fetch existing products to prevent unique constraint handle failures
    let existingProducts: any[] = []
    try {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "metadata"],
      })
      existingProducts = data || []
    } catch (err: any) {
      logger.warn(`Failed to fetch existing products: ${err.message}`)
    }

    // Import products in batches
    logger.info(`Transforming and importing ${wooProducts.length} products`)
    const batchSize = 20

    for (let i = 0; i < wooProducts.length; i += batchSize) {
      const batch = wooProducts.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(wooProducts.length / batchSize)
      logger.info(`Processing batch ${batchNum} of ${totalBatches}`)

      // Filter batch to separate new products vs existing skipped products
      const skippedProductsInBatch: ImportedProductDetail[] = []
      const productsToTransform: any[] = []

      for (const wcProduct of batch) {
        const transformedHandle =
          wcProduct.slug || wcProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

        // Check if product already exists by WooCommerce ID in metadata or matching handle
        const matchedProduct = existingProducts.find(
          (ep) =>
            ep.metadata?.woo_product_id === wcProduct.id ||
            ep.handle === transformedHandle
        )

        if (matchedProduct) {
          skippedProductsInBatch.push({
            wcId: wcProduct.id,
            wcTitle: wcProduct.name,
            medusaId: matchedProduct.id,
            variantsCount: 0,
            status: "skipped",
            error: "Product already exists in catalog",
          })
        } else {
          productsToTransform.push(wcProduct)
        }
      }

      if (productsToTransform.length === 0) {
        // All products in this batch already exist
        result.importedProductDetails.push(...skippedProductsInBatch)
        continue
      }

      const productsPayload = productsToTransform.map((wcProduct: any) => {
        const variations = variationsMap.get(wcProduct.id) || []
        return transformer.transformProduct(
          wcProduct,
          variations,
          input.currencyCode,
          categoryMap,
          collectionMap
        )
      })

      // Override status if publishProducts is set
      if (input.publishProducts) {
        for (const p of productsPayload) {
          p.status = "published" as any
        }
      }
      if (webSalesChannelId) {
        for (const p of productsPayload) {
          p.sales_channels = [{ id: webSalesChannelId }]
        }
      }

      try {
        const productsResult = await createProductsWorkflow(container).run({
          input: {
            products: productsPayload,
          },
        })

        const createdProducts = productsResult.result

        for (let j = 0; j < productsToTransform.length; j++) {
          const wcProduct = productsToTransform[j]
          const medusaProduct = createdProducts[j]

          if (medusaProduct) {
            result.importedProducts++
            result.importedProductDetails.push({
              wcId: wcProduct.id,
              wcTitle: wcProduct.name,
              medusaId: medusaProduct.id,
              variantsCount: medusaProduct.variants?.length || 0,
              status: "success",
            })

            if (input.createPriceList && medusaProduct.variants) {
              const payloadProduct = productsPayload[j]
              for (let k = 0; k < medusaProduct.variants.length; k++) {
                const variant = medusaProduct.variants[k]
                const payloadVariant = payloadProduct.variants?.[k]
                const payloadPrice = payloadVariant?.prices?.[0]
                if (payloadPrice) {
                  importedVariantsPrices.push({
                    variantId: variant.id,
                    amount: payloadPrice.amount,
                    currencyCode: payloadPrice.currency_code || input.currencyCode.toLowerCase(),
                  })
                }
              }
            }
          }
        }

        // Add the skipped ones to detail list
        result.importedProductDetails.push(...skippedProductsInBatch)
      } catch (error: any) {
        logger.error(`Failed to import batch ${batchNum}: ${error.message}`)
        for (const wcProduct of productsToTransform) {
          result.failedProducts++
          result.errors.push(
            `Product "${wcProduct.name}" (ID: ${wcProduct.id}) failed: ${error.message}`
          )
          result.importedProductDetails.push({
            wcId: wcProduct.id,
            wcTitle: wcProduct.name,
            medusaId: "",
            variantsCount: 0,
            status: "failed",
            error: error.message,
          })
        }
        result.importedProductDetails.push(...skippedProductsInBatch)
      }
    }

    // Create Price List if requested
    if (input.createPriceList && importedVariantsPrices.length > 0) {
      try {
        const timestamp = new Date().toLocaleString("en-US", { hour12: false })
        await createPriceListsWorkflow(container).run({
          input: {
            price_lists_data: [
              {
                title: `WooCommerce Import - ${timestamp}`,
                description: `Prices imported from WooCommerce (${input.wooUrl || "JSON Upload"})`,
                status: "active" as any,
                prices: importedVariantsPrices.map((vp) => ({
                  variant_id: vp.variantId,
                  amount: vp.amount,
                  currency_code: vp.currencyCode,
                })),
              },
            ],
          },
        })
        logger.info(`Successfully created Price List with ${importedVariantsPrices.length} prices`)
      } catch (err: any) {
        logger.error(`Failed to create Price List: ${err.message}`)
        result.errors.push(`Price List creation error: ${err.message}`)
      }
    }

    logger.info(
      `WooCommerce import completed: ${result.importedProducts} imported, ${result.failedProducts} failed`
    )
    return new StepResponse(result)
  }
)

export const importWooCommerceProductsWorkflow = createWorkflow(
  "import-woo-commerce-products",
  (input: ImportWooCommerceInput) => {
    return new WorkflowResponse(importWooCommerceStep(input))
  }
)
