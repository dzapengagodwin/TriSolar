import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SEO_MODULE } from "../../modules/seo"
import SeoModuleService from "../../modules/seo/service"
import { UpsertSeoMetadataInput } from "../../modules/seo/types"

export type UpsertEntitySeoStepInput = {
  entityType: string
  entityId: string
  data: UpsertSeoMetadataInput
}

export const upsertEntitySeoStep = createStep(
  "upsert-entity-seo",
  async (input: UpsertEntitySeoStepInput, { container }) => {
    const seoService: SeoModuleService = container.resolve(SEO_MODULE)

    const previousSeo = await seoService.retrieveForEntity(
      input.entityType,
      input.entityId
    )

    const seo = await seoService.upsertForEntity(
      input.entityType,
      input.entityId,
      input.data
    )

    return new StepResponse(seo, {
      entityType: input.entityType,
      entityId: input.entityId,
      previousData: previousSeo,
    })
  },
  async (rollbackData, { container }) => {
    if (!rollbackData) return
    const seoService: SeoModuleService = container.resolve(SEO_MODULE)

    if (rollbackData.previousData) {
      await seoService.upsertForEntity(
        rollbackData.entityType,
        rollbackData.entityId,
        rollbackData.previousData
      )
    } else {
      await seoService.deleteForEntity(
        rollbackData.entityType,
        rollbackData.entityId
      )
    }
  }
)
