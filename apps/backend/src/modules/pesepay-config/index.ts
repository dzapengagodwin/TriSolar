import { Module } from "@medusajs/framework/utils"
import PesepayConfigModuleService from "./service"

export const PESEPAY_CONFIG_MODULE = "pesepayConfig"

export default Module(PESEPAY_CONFIG_MODULE, {
  service: PesepayConfigModuleService,
})
