import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { YoastSeoClient, YoastSeoRecord } from "../modules/woocommerce-migrator/services/yoast-seo-client"
import { transformYoastRecord, buildPreviewRow, YoastPreviewRow } from "../modules/woocommerce-migrator/services/yoast-seo-transformer"
import { SEO_MODULE } from "../modules/seo"
import type SeoModuleService from "../modules/seo/service"

// -------------------------------------------------------------------
// Input / Output Types
// -------------------------------------------------------------------

export type ImportYoastSeoInput = {
  wooUrl: string
  consumerKey: string
  consumerSecret: string
  importProducts?: boolean
  importCategories?: boolean
  importBrands?: boolean
  importPages?: boolean
  overwriteExisting?: boolean
  dryRun?: boolean
}

export type YoastSeoEntityResult = {
  slug: string
  entityType: string
  entityTitle: string
  medusaId: string
  status: "imported" | "skipped" | "no_match" | "error"
  error?: string
}

export type ImportYoastSeoResult = {
  dryRun: boolean
  totalFetched: number
  matched: number
  imported: number
  skipped: number
  noMatch: number
  errors: string[]
  details: YoastSeoEntityResult[]
  preview?: YoastPreviewRow[]
}

// -------------------------------------------------------------------
// Helper: resolve Medusa entity IDs from slugs/handles via Graph API
// -------------------------------------------------------------------

async function resolveEntityId(
  query: any,
  entityType: "product" | "category" | "brand" | "page",
  slug: string
): Promise<string | null> {
  try {
    if (entityType === "product") {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle: slug },
      })
      return data?.[0]?.id || null
    }

    if (entityType === "category") {
      const { data } = await query.graph({
        entity: "product_category",
        fields: ["id"],
        filters: { handle: slug },
      })
      return data?.[0]?.id || null
    }

    if (entityType === "brand") {
      // Brand module custom entity
      const { data } = await query.graph({
        entity: "brand",
        fields: ["id"],
        filters: { handle: slug },
      })
      return data?.[0]?.id || null
    }

    if (entityType === "page") {
      // Pages use slug as entity_id since they may not exist in Medusa yet
      return `page_${slug}`
    }
  } catch {
    // Non-fatal — treat as no match
  }
  return null
}

// -------------------------------------------------------------------
// Step: Fetch all Yoast SEO records from WordPress
// -------------------------------------------------------------------

export const fetchYoastSeoStep = createStep(
  "fetch-yoast-seo",
  async (input: ImportYoastSeoInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    const client = new YoastSeoClient(
      input.wooUrl,
      input.consumerKey,
      input.consumerSecret
    )

    const allRecords: YoastSeoRecord[] = []

    logger.info("[Yoast SEO] Starting fetch from WordPress REST API...")

    const [productRecords, categoryRecords, brandRecords, pageRecords] =
      await Promise.allSettled([
        input.importProducts !== false
          ? client.fetchProductSeoRecords()
          : Promise.resolve([]),
        input.importCategories !== false
          ? client.fetchCategorySeoRecords()
          : Promise.resolve([]),
        input.importBrands !== false
          ? client.fetchBrandSeoRecords()
          : Promise.resolve([]),
        input.importPages !== false
          ? client.fetchPageSeoRecords()
          : Promise.resolve([]),
      ])

    if (productRecords.status === "fulfilled") {
      logger.info(`[Yoast SEO] Fetched ${productRecords.value.length} product SEO records`)
      allRecords.push(...productRecords.value)
    } else {
      logger.warn(`[Yoast SEO] Failed to fetch product SEO: ${productRecords.reason?.message}`)
    }

    if (categoryRecords.status === "fulfilled") {
      logger.info(`[Yoast SEO] Fetched ${categoryRecords.value.length} category SEO records`)
      allRecords.push(...categoryRecords.value)
    } else {
      logger.warn(`[Yoast SEO] Failed to fetch category SEO: ${categoryRecords.reason?.message}`)
    }

    if (brandRecords.status === "fulfilled") {
      logger.info(`[Yoast SEO] Fetched ${brandRecords.value.length} brand SEO records`)
      allRecords.push(...brandRecords.value)
    } else {
      logger.warn(`[Yoast SEO] Failed to fetch brand SEO: ${brandRecords.reason?.message}`)
    }

    if (pageRecords.status === "fulfilled") {
      logger.info(`[Yoast SEO] Fetched ${pageRecords.value.length} page SEO records`)
      allRecords.push(...pageRecords.value)
    } else {
      logger.warn(`[Yoast SEO] Failed to fetch page SEO: ${pageRecords.reason?.message}`)
    }

    logger.info(`[Yoast SEO] Total records fetched: ${allRecords.length}`)

    return new StepResponse(allRecords)
  }
)

// -------------------------------------------------------------------
// Step: Match records to Medusa entities and upsert SEO metadata
// -------------------------------------------------------------------

export const upsertYoastSeoStep = createStep(
  "upsert-yoast-seo",
  async (
    {
      records,
      overwriteExisting,
      dryRun,
    }: {
      records: YoastSeoRecord[]
      overwriteExisting: boolean
      dryRun: boolean
    },
    { container }
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const seoService: SeoModuleService = container.resolve(SEO_MODULE)

    const result: ImportYoastSeoResult = {
      dryRun,
      totalFetched: records.length,
      matched: 0,
      imported: 0,
      skipped: 0,
      noMatch: 0,
      errors: [],
      details: [],
      preview: dryRun ? [] : undefined,
    }

    const CONCURRENCY = 5

    for (let i = 0; i < records.length; i += CONCURRENCY) {
      const chunk = records.slice(i, i + CONCURRENCY)

      await Promise.all(
        chunk.map(async (record) => {
          const medusaId = await resolveEntityId(query, record.entityType, record.entitySlug)

          // Dry-run mode: collect preview rows without writing
          if (dryRun) {
            if (result.preview) {
              result.preview.push(buildPreviewRow(record, medusaId))
            }
            if (medusaId) {
              result.matched++
            } else {
              result.noMatch++
            }
            return
          }

          if (!medusaId) {
            result.noMatch++
            result.details.push({
              slug: record.entitySlug,
              entityType: record.entityType,
              entityTitle: record.entityTitle,
              medusaId: "",
              status: "no_match",
            })
            return
          }

          result.matched++

          try {
            const existing = await seoService.retrieveForEntity(record.entityType, medusaId)

            // If overwriteExisting = false and record exists → skip
            if (existing && !overwriteExisting) {
              result.skipped++
              result.details.push({
                slug: record.entitySlug,
                entityType: record.entityType,
                entityTitle: record.entityTitle,
                medusaId,
                status: "skipped",
              })
              return
            }

            const seoData = transformYoastRecord(record)
            await seoService.upsertForEntity(record.entityType, medusaId, seoData)

            result.imported++
            result.details.push({
              slug: record.entitySlug,
              entityType: record.entityType,
              entityTitle: record.entityTitle,
              medusaId,
              status: "imported",
            })
          } catch (err: any) {
            result.errors.push(`[${record.entityType}] ${record.entitySlug}: ${err.message}`)
            result.details.push({
              slug: record.entitySlug,
              entityType: record.entityType,
              entityTitle: record.entityTitle,
              medusaId,
              status: "error",
              error: err.message,
            })
          }
        })
      )
    }

    logger.info(
      `[Yoast SEO] Import complete — matched: ${result.matched}, imported: ${result.imported}, ` +
        `skipped: ${result.skipped}, no_match: ${result.noMatch}, errors: ${result.errors.length}`
    )

    return new StepResponse(result)
  }
)

// -------------------------------------------------------------------
// Main Workflow
// -------------------------------------------------------------------

export const importYoastSeoWorkflow = createWorkflow(
  "import-yoast-seo",
  (input: ImportYoastSeoInput) => {
    const records = fetchYoastSeoStep(input)

    const stepInput = transform({ input, records }, (data) => ({
      records: data.records,
      overwriteExisting: data.input.overwriteExisting ?? true,
      dryRun: data.input.dryRun ?? false,
    }))

    const result = upsertYoastSeoStep(stepInput)

    return new WorkflowResponse(result)
  }
)
