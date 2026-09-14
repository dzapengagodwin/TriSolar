import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertEntitySeoStep,
  UpsertEntitySeoStepInput,
} from "./steps/upsert-entity-seo"

export type UpsertEntitySeoWorkflowInput = UpsertEntitySeoStepInput

export const upsertEntitySeoWorkflow = createWorkflow(
  "upsert-entity-seo",
  (input: UpsertEntitySeoWorkflowInput) => {
    const seo = upsertEntitySeoStep(input)
    return new WorkflowResponse(seo)
  }
)

