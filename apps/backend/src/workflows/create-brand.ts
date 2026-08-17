import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"
import { slugifyBrand } from "../modules/brand/utils/brand-normalizer"

export type CreateBrandInput = {
  name: string
  handle?: string
  logo?: string
  description?: string
  website?: string
  is_active?: boolean
  metadata?: Record<string, unknown>
}

export const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)

    const handle = input.handle || slugifyBrand(input.name)

    const brand = await brandModuleService.createBrands({
      ...input,
      handle,
    })

    return new StepResponse(brand, brand.id)
  },
  async (brandId: string, { container }) => {
    if (!brandId) return
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)
    await brandModuleService.deleteBrands([brandId])
  }
)

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  (input: CreateBrandInput) => {
    const brand = createBrandStep(input)
    return new WorkflowResponse(brand)
  }
)
