import { MedusaService } from "@medusajs/framework/utils"
import { ErpnextSettings } from "./models/erpnext-settings"
import { ErpnextSyncLog } from "./models/erpnext-sync-log"
import { ErpnextSyncItemLog } from "./models/erpnext-sync-item-log"

class ErpnextModuleService extends MedusaService({
  ErpnextSettings,
  ErpnextSyncLog,
  ErpnextSyncItemLog,
}) {
  // Convenience aliases for singular naming conventions
  async createErpnextSyncLog(data: any, sharedContext?: any) {
    return (this as any).createErpnextSyncLogs(data, sharedContext)
  }

  async updateErpnextSyncLog(data: any, sharedContext?: any) {
    return (this as any).updateErpnextSyncLogs(data, sharedContext)
  }

  async createErpnextSyncItemLog(data: any, sharedContext?: any) {
    return (this as any).createErpnextSyncItemLogs(data, sharedContext)
  }

  async updateErpnextSyncItemLog(data: any, sharedContext?: any) {
    return (this as any).updateErpnextSyncItemLogs(data, sharedContext)
  }
}

export default ErpnextModuleService


