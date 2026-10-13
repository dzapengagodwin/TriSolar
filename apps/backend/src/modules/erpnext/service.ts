import { MedusaService } from "@medusajs/framework/utils"
import { ErpnextSettings } from "./models/erpnext-settings"
import { ErpnextSyncLog } from "./models/erpnext-sync-log"
import { ErpnextSyncItemLog } from "./models/erpnext-sync-item-log"

class ErpnextModuleService extends MedusaService({
  ErpnextSettings,
  ErpnextSyncLog,
  ErpnextSyncItemLog,
}) {}

export default ErpnextModuleService

