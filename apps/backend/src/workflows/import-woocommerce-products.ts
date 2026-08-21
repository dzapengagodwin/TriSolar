import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createPriceListsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { WooCommerceClient } from "../modules/woocommerce-migrator/services/woocommerce-client"
import { WooCommerceTransformer } from "../modules/woocommerce-migrator/services/woocommerce-transformer"
import type { WooVariation } from "../modules/woocommerce-migrator/services/woocommerce-client"
import { BRAND_MODULE } from "../modules/brand"

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
  importedBrands: number
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
    let brandImageMap = new Map<string, string>()

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

      // Fetch brand attribute term images (slug/name → logo URL)
      logger.info("Fetching brand attribute term images from WooCommerce")
      brandImageMap = await client.fetchBrandTermImages()
      logger.info(`Loaded ${brandImageMap.size} brand logo entries from attribute terms`)

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
      importedBrands: 0,
      errors: [],
      importedProductDetails: [],
    }

    const categoryMap = new Map<number, string>()
    const collectionMap = new Map<number, string>()
    const brandMap = new Map<string, string>()
    const importedVariantsPrices: { variantId: string; amount: number; currencyCode: string }[] = []

    let brandModuleService: any = null
    // brandLogoMap tracks which existing brands already have a logo set
    const brandLogoMap = new Map<string, string | null>()
    try {
      brandModuleService = container.resolve(BRAND_MODULE)
      const existingBrands = await brandModuleService.listBrands(
        {},
        { select: ["id", "name", "handle", "logo"] }
      )
      for (const b of existingBrands || []) {
        brandMap.set(b.handle, b.id)
        brandLogoMap.set(b.handle, b.logo || null)
      }
    } catch (err: any) {
      logger.warn(`Brand module service lookup note: ${err.message}`)
    }

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

    // Import categories hierarchically
    if (input.importCategories && wooCategories.length > 0) {
      logger.info(`Importing ${wooCategories.length} categories with hierarchy`)
      try {
        const validCategories = wooCategories.filter(
          (cat) => cat.name && cat.name.toLowerCase() !== "uncategorized"
        )

        // 1. Check existing categories in Medusa
        const remainingToProcess: any[] = []
        for (const wcCat of validCategories) {
          const matched = existingCategories.find(
            (ec) =>
              ec.handle === wcCat.slug ||
              ec.name.toLowerCase() === wcCat.name.toLowerCase()
          )
          if (matched) {
            categoryMap.set(wcCat.id, matched.id)
          } else {
            remainingToProcess.push(wcCat)
          }
        }

        // 2. Process remaining categories level-by-level (parents first, then children)
        let iterations = 0
        while (remainingToProcess.length > 0 && iterations < 6) {
          iterations++
          const readyToCreate: any[] = []
          const stillWaiting: any[] = []

          for (const cat of remainingToProcess) {
            // Ready if top-level root (parent 0/unset) OR if parent is already created and in categoryMap
            if (!cat.parent || cat.parent === 0 || categoryMap.has(cat.parent)) {
              readyToCreate.push(cat)
            } else {
              stillWaiting.push(cat)
            }
          }

          // Fallback if there are orphan categories with nonexistent parent IDs
          const batch = readyToCreate.length > 0 ? readyToCreate : stillWaiting
          const transformedBatch = transformer.transformCategories(batch, categoryMap)

          if (transformedBatch.length > 0) {
            const categoriesResult = await createProductCategoriesWorkflow(container).run({
              input: {
                product_categories: transformedBatch.map((c) => ({
                  name: c.name,
                  handle: c.handle,
                  is_active: c.is_active,
                  parent_category_id: c.parent_category_id || undefined,
                })),
              },
            })

            const createdCategories = categoriesResult.result
            result.importedCategories += createdCategories.length

            for (let idx = 0; idx < batch.length; idx++) {
              if (createdCategories[idx]) {
                categoryMap.set(batch[idx].id, createdCategories[idx].id)
              }
            }
          }

          if (readyToCreate.length > 0) {
            remainingToProcess.length = 0
            remainingToProcess.push(...stillWaiting)
          } else {
            break
          }
        }

        logger.info(`Successfully mapped ${categoryMap.size} categories with parent-child hierarchy`)
      } catch (error: any) {
        logger.error(`Failed to import categories: ${error.message}`)
        result.errors.push(`Category import error: ${error.message}`)
      }
    }

    // Fetch existing collections to prevent duplicates
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
          transformer.sanitizeHandle(wcProduct.slug) ||
          transformer.sanitizeHandle(wcProduct.name) ||
          `product-${wcProduct.id}`

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
          brandImageMap
        )
      })

      // Ensure handles are unique within the batch and not colliding with existing products
      for (const p of productsPayload) {
        let baseHandle = p.handle
        let handleCounter = 1
        while (existingProducts.some((ep) => ep.handle === p.handle)) {
          handleCounter++
          p.handle = `${baseHandle}-${handleCounter}`
        }
        existingProducts.push({ handle: p.handle })
      }

      // Create any missing brands for this batch; back-fill logo on existing brands that lack one
      if (brandModuleService) {
        for (const p of productsPayload) {
          if (!p.brand) continue

          if (!brandMap.has(p.brand.handle)) {
            // New brand — create with logo
            try {
              const createdBrand = await brandModuleService.createBrands({
                name: p.brand.name,
                handle: p.brand.handle,
                logo: p.brand.logo || null,
                is_active: true,
              })
              brandMap.set(p.brand.handle, createdBrand.id)
              brandLogoMap.set(p.brand.handle, p.brand.logo || null)
              result.importedBrands++
              logger.info(`Created brand: ${p.brand.name} (${p.brand.handle})${p.brand.logo ? " with logo" : ""}`)
            } catch (brandErr: any) {
              logger.warn(`Could not create brand ${p.brand.name}: ${brandErr.message}`)
            }
          } else if (p.brand.logo && !brandLogoMap.get(p.brand.handle)) {
            // Existing brand has no logo yet — update it
            const existingBrandId = brandMap.get(p.brand.handle)
            if (existingBrandId) {
              try {
                await brandModuleService.updateBrands({
                  id: existingBrandId,
                  logo: p.brand.logo,
                })
                brandLogoMap.set(p.brand.handle, p.brand.logo)
                logger.info(`Updated logo for brand: ${p.brand.name}`)
              } catch (updateErr: any) {
                logger.warn(`Could not update logo for brand ${p.brand.name}: ${updateErr.message}`)
              }
            }
          }
        }
      }

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

        // Link created products to their brands
        const linksToCreate: any[] = []
        for (let j = 0; j < productsToTransform.length; j++) {
          const medusaProduct = createdProducts[j]
          const payloadBrand = productsPayload[j]?.brand

          if (medusaProduct && payloadBrand) {
            const brandId = brandMap.get(payloadBrand.handle)
            if (brandId) {
              linksToCreate.push({
                [Modules.PRODUCT]: {
                  product_id: medusaProduct.id,
                },
                [BRAND_MODULE]: {
                  brand_id: brandId,
                },
              })
            }
          }
        }

        if (linksToCreate.length > 0) {
          try {
            const link = container.resolve(ContainerRegistrationKeys.LINK)
            await link.create(linksToCreate)
            logger.info(`Linked ${linksToCreate.length} products to brands in batch ${batchNum}`)
          } catch (linkErr: any) {
            logger.warn(`Failed to link products to brands: ${linkErr.message}`)
          }
        }

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
