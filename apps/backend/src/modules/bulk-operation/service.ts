import { MedusaService } from "@medusajs/framework/utils"
import BulkOperation from "./models/bulk-operation"
import BulkOperationItem from "./models/bulk-operation-item"

class BulkOperationModuleService extends MedusaService({
  BulkOperation,
  BulkOperationItem,
}) {}

export default BulkOperationModuleService
