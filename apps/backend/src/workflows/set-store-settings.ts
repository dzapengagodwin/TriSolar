import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STORE_SETTINGS_MODULE } from "../modules/store-settings"
import StoreSettingsModuleService from "../modules/store-settings/service"

export type SetStoreSettingsInput = {
  order_notification_emails?: string | null
  is_active?: boolean
}

type SetStoreSettingsCompensation = {
  id?: string
  isNew?: boolean
  prevData?: Record<string, unknown>
}

export const setStoreSettingsStep = createStep(
  "set-store-settings",
  async (input: SetStoreSettingsInput, { container }) => {
    const storeSettingsService: StoreSettingsModuleService =
      container.resolve(STORE_SETTINGS_MODULE)

    const existingList = await storeSettingsService.listStoreSettings(
      {},
      { take: 1, order: { created_at: "DESC" } }
    )

    const existing = existingList && existingList.length > 0 ? existingList[0] : null

    let result: any
    const compensation: SetStoreSettingsCompensation = {}

    if (existing) {
      compensation.id = existing.id
      compensation.prevData = { ...existing }
      result = await storeSettingsService.updateStoreSettings({
        id: existing.id,
        order_notification_emails:
          input.order_notification_emails !== undefined
            ? input.order_notification_emails
            : existing.order_notification_emails,
        is_active: input.is_active ?? existing.is_active,
      })
    } else {
      result = await storeSettingsService.createStoreSettings({
        order_notification_emails: input.order_notification_emails ?? null,
        is_active: input.is_active ?? true,
      })
      compensation.id = result.id
      compensation.isNew = true
    }

    return new StepResponse(result, compensation)
  },
  async (compensation: SetStoreSettingsCompensation, { container }) => {
    if (!compensation) return
    const storeSettingsService: StoreSettingsModuleService =
      container.resolve(STORE_SETTINGS_MODULE)

    if (compensation.isNew && compensation.id) {
      await storeSettingsService.deleteStoreSettings([compensation.id])
    } else if (compensation.prevData && compensation.id) {
      await storeSettingsService.updateStoreSettings({
        id: compensation.id,
        ...compensation.prevData,
      })
    }
  }
)

export const setStoreSettingsWorkflow = createWorkflow(
  "set-store-settings",
  (input: SetStoreSettingsInput) => {
    const settings = setStoreSettingsStep(input)
    return new WorkflowResponse(settings)
  }
)

