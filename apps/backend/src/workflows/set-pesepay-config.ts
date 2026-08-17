import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PESEPAY_CONFIG_MODULE } from "../modules/pesepay-config"
import PesepayConfigModuleService from "../modules/pesepay-config/service"

export type SetPesepayConfigInput = {
  integration_key?: string
  encryption_key?: string
  environment?: string
  callback_url?: string
  webhook_secret?: string
  is_active?: boolean
}

type SetPesepayCompensation = {
  id?: string
  isNew?: boolean
  prevData?: any
}

export const setPesepayConfigStep = createStep(
  "set-pesepay-config",
  async (input: SetPesepayConfigInput, { container }) => {
    const pesepayConfigService: PesepayConfigModuleService =
      container.resolve(PESEPAY_CONFIG_MODULE)

    const existingConfigs = await pesepayConfigService.listPesepayConfigs(
      { is_active: true },
      { take: 1, order: { created_at: "DESC" } }
    )

    const existing =
      existingConfigs && existingConfigs.length > 0 ? existingConfigs[0] : null

    let result: any
    const compensation: SetPesepayCompensation = {}

    if (existing) {
      compensation.id = existing.id
      compensation.prevData = { ...existing }
      result = await pesepayConfigService.updatePesepayConfigs({
        id: existing.id,
        integration_key: input.integration_key ?? existing.integration_key,
        encryption_key: input.encryption_key ?? existing.encryption_key,
        environment: input.environment ?? existing.environment,
        callback_url: input.callback_url ?? existing.callback_url,
        webhook_secret: input.webhook_secret ?? existing.webhook_secret,
        is_active: input.is_active ?? existing.is_active,
      })
    } else {
      result = await pesepayConfigService.createPesepayConfigs({
        integration_key: input.integration_key ?? "",
        encryption_key: input.encryption_key ?? "",
        environment: input.environment ?? "sandbox",
        callback_url:
          input.callback_url ?? "http://localhost:8000/zw/payment-callback",
        webhook_secret: input.webhook_secret,
        is_active: input.is_active ?? true,
      })
      compensation.id = result.id
      compensation.isNew = true
    }

    return new StepResponse(result, compensation)
  },
  async (compensation: SetPesepayCompensation, { container }) => {
    if (!compensation) return
    const pesepayConfigService: PesepayConfigModuleService =
      container.resolve(PESEPAY_CONFIG_MODULE)

    if (compensation.isNew && compensation.id) {
      await pesepayConfigService.deletePesepayConfigs([compensation.id])
    } else if (compensation.prevData) {
      await pesepayConfigService.updatePesepayConfigs(compensation.prevData)
    }
  }
)

export const setPesepayConfigWorkflow = createWorkflow(
  "set-pesepay-config",
  (input: SetPesepayConfigInput) => {
    const config = setPesepayConfigStep(input)
    return new WorkflowResponse(config)
  }
)
