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
  status: "success" | "failed"
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

    let wooProducts: any[] = []
    let wooCategories: any[] = []
    let wooTags: any[] = []
    const variationsMap = new Map<number, WooVariation[]>()

    if (input.jsonData) {
      logger.info("Using provided JSON data for import")
      wooProducts = input.jsonData.products || []
      wooCategories = input.jsonData.categories || []
      wooTags = input.jsonData.tags || []
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

      // Fetch variations for variable products
      for (const product of wooProducts) {
        if (product.type === "variable" && product.variations?.length > 0) {
          logger.info(`Fetching variations for product: ${product.name}`)
          const variations = await client.fetchProductVariations(product.id)
          variationsMap.set(product.id, variations)
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

    // Import categories
    if (input.importCategories && wooCategories.length > 0) {
      logger.info(`Importing ${wooCategories.length} categories`)
      try {
        const transformedCategories = transformer.transformCategories(wooCategories)
        if (transformedCategories.length > 0) {
          const categoriesResult = await createProductCategoriesWorkflow(container).run({
            input: {
              product_categories: transformedCategories,
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

    // Import tags as collections
    if (input.importTags && wooTags.length > 0) {
      logger.info(`Importing ${wooTags.length} tags as collections`)
      try {
        const transformedCollections = transformer.transformTags(wooTags)
        if (transformedCollections.length > 0) {
          const collectionsResult = await createCollectionsWorkflow(container).run({
            input: {
              collections: transformedCollections,
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

    // Import products in batches
    logger.info(`Transforming and importing ${wooProducts.length} products`)
    const batchSize = 20

    for (let i = 0; i < wooProducts.length; i += batchSize) {
      const batch = wooProducts.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(wooProducts.length / batchSize)
      logger.info(`Processing batch ${batchNum} of ${totalBatches}`)

      const productsPayload = batch.map((wcProduct: any) => {
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

      try {
        const productsResult = await createProductsWorkflow(container).run({
          input: {
            products: productsPayload,
          },
        })

        const createdProducts = productsResult.result

        for (let j = 0; j < batch.length; j++) {
          const wcProduct = batch[j]
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
          }
        }
      } catch (error: any) {
        logger.error(`Failed to import batch ${batchNum}: ${error.message}`)
        for (const wcProduct of batch) {
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
