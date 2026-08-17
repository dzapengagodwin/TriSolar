import BulkOperationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BULK_OPERATION_MODULE = "bulk_operation"

export default Module(BULK_OPERATION_MODULE, {
  service: BulkOperationModuleService,
})
