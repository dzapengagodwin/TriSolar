import { MedusaService } from "@medusajs/framework/utils"
import { StoreSettings } from "./models/store-settings"

class StoreSettingsModuleService extends MedusaService({
  StoreSettings,
}) {}

export default StoreSettingsModuleService

