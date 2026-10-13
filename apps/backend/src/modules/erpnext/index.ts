import { Module } from "@medusajs/framework/utils"
import ErpnextModuleService from "./service"

export const ERPNEXT_MODULE = "erpnext"

export default Module(ERPNEXT_MODULE, {
  service: ErpnextModuleService,
})

