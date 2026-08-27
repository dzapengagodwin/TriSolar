import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { upsertProductSeoStep } from "./steps/upsert-product-seo"
import { UpsertSeoMetadataInput } from "../modules/seo/types"

export type UpsertProductSeoWorkflowInput = {
  productId: string
  data: UpsertSeoMetadataInput
}

export const upsertProductSeoWorkflow = createWorkflow(
  "upsert-product-seo",
  (input: UpsertProductSeoWorkflowInput) => {
    const seo = upsertProductSeoStep(input)
    return new WorkflowResponse(seo)
  }
)
