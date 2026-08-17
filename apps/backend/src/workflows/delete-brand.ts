import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export type DeleteBrandInput = {
  id: string
}

export const deleteBrandStep = createStep(
  "delete-brand",
  async (input: DeleteBrandInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)

    const prevBrand = await brandModuleService.retrieveBrand(input.id)

    await brandModuleService.deleteBrands([input.id])

    return new StepResponse({ id: input.id }, prevBrand)
  },
  async (prevBrand, { container }) => {
    if (!prevBrand) return
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)
    const { id, name, handle, logo, description, website, is_active, metadata } =
      prevBrand as any
    await brandModuleService.createBrands({
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

export const deleteBrandWorkflow = createWorkflow(
  "delete-brand",
  (input: DeleteBrandInput) => {
    const result = deleteBrandStep(input)
    return new WorkflowResponse(result)
  }
)
