import { MedusaService } from "@medusajs/framework/utils"
import { PesepayConfig } from "./models/pesepay-config"

class PesepayConfigModuleService extends MedusaService({
  PesepayConfig,
}) {}

export default PesepayConfigModuleService
