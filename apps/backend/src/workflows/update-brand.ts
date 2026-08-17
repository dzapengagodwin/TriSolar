import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export type UpdateBrandInput = {
  id: string
  name?: string
  handle?: string
  logo?: string
  description?: string
  website?: string
  is_active?: boolean
  metadata?: Record<string, unknown>
}

export const updateBrandStep = createStep(
  "update-brand",
  async (input: UpdateBrandInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)

    const prevBrand = await brandModuleService.retrieveBrand(input.id)

    const updated = await brandModuleService.updateBrands(input)

    return new StepResponse(updated, prevBrand)
  },
  async (prevBrand, { container }) => {
    if (!prevBrand) return
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)
    const { id, name, handle, logo, description, website, is_active, metadata } =
      prevBrand as any
    await brandModuleService.updateBrands({
      id,
      name,
      handle,
      logo,
      description,
      website,
      is_active,
      metadata,
    })
  }
)

export const updateBrandWorkflow = createWorkflow(
  "update-brand",
  (input: UpdateBrandInput) => {
    const brand = updateBrandStep(input)
    return new WorkflowResponse(brand)
  }
)
