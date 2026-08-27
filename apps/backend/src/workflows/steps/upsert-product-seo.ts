import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SEO_MODULE } from "../../modules/seo"
import SeoModuleService from "../../modules/seo/service"
import { UpsertSeoMetadataInput } from "../../modules/seo/types"

export type UpsertProductSeoStepInput = {
  productId: string
  data: UpsertSeoMetadataInput
}

export const upsertProductSeoStep = createStep(
  "upsert-product-seo",
  async (input: UpsertProductSeoStepInput, { container }) => {
    const seoService: SeoModuleService = container.resolve(SEO_MODULE)

    const previousSeo = await seoService.retrieveForEntity(
      "product",
      input.productId
    )

    const seo = await seoService.upsertForEntity(
      "product",
      input.productId,
      input.data
    )

    return new StepResponse(seo, {
      productId: input.productId,
      previousData: previousSeo,
    })
  },
  async (rollbackData, { container }) => {
    if (!rollbackData) return
    const seoService: SeoModuleService = container.resolve(SEO_MODULE)

    if (rollbackData.previousData) {
      await seoService.upsertForEntity(
        "product",
        rollbackData.productId,
        rollbackData.previousData
      )
    } else {
      await seoService.deleteForEntity("product", rollbackData.productId)
    }
  }
)
