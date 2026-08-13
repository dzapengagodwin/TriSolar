import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PesepayProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [PesepayProviderService],
})
