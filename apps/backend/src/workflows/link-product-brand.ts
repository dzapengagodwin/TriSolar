import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"

export type LinkProductBrandInput = {
  productId: string
  brandId?: string | null
}

export const linkProductBrandStep = createStep(
  "link-product-brand",
  async (input: LinkProductBrandInput, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Fetch current brand linked to this product
    let prevBrandId: string | null = null
    try {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "brand.id"],
        filters: { id: input.productId },
      })
      prevBrandId = (products?.[0] as any)?.brand?.id || null
    } catch {
      // ignore
    }

    // If it is already assigned to the requested brand, no-op
    if (prevBrandId && prevBrandId === input.brandId) {
      return new StepResponse(
        { productId: input.productId, brandId: input.brandId },
        { productId: input.productId, prevBrandId }
      )
    }

    // 2. Dismiss existing brand link if one exists
    if (prevBrandId) {
      try {
        await link.dismiss([
          {
            [Modules.PRODUCT]: {
              product_id: input.productId,
            },
            [BRAND_MODULE]: {
              brand_id: prevBrandId,
            },
          },
        ])
      } catch (dismissErr) {
        console.warn("Could not dismiss previous link:", dismissErr)
      }
    }

    // 3. Create new link if brandId is provided
    if (input.brandId && input.brandId.trim() !== "") {
      await link.create([
        {
          [Modules.PRODUCT]: {
            product_id: input.productId,
          },
          [BRAND_MODULE]: {
            brand_id: input.brandId.trim(),
          },
        },
      ])
    }

    return new StepResponse(
      { productId: input.productId, brandId: input.brandId || null },
      { productId: input.productId, prevBrandId }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData?.productId) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    try {
      // Dismiss any current link
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "brand.id"],
        filters: { id: compensationData.productId },
      })
      const currentBrandId = (products?.[0] as any)?.brand?.id
      if (currentBrandId) {
        await link.dismiss([
          {
            [Modules.PRODUCT]: {
              product_id: compensationData.productId,
            },
            [BRAND_MODULE]: {
              brand_id: currentBrandId,
            },
          },
        ])
      }

      // Restore previous link
      if (compensationData.prevBrandId) {
        await link.create([
          {
            [Modules.PRODUCT]: {
              product_id: compensationData.productId,
            },
            [BRAND_MODULE]: {
              brand_id: compensationData.prevBrandId,
            },
          },
        ])
      }
    } catch {
      // ignore
    }
  }
)

export const linkProductBrandWorkflow = createWorkflow(
  "link-product-brand",
  (input: LinkProductBrandInput) => {
    const result = linkProductBrandStep(input)
    return new WorkflowResponse(result)
  }
)
