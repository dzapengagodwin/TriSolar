import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params

  if (!handle) {
    return res.status(400).json({ message: "Brand handle is required." })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  // Resolve brand by handle to get its ID
  const { data: brands } = await query.graph({
    entity: "brand",
    fields: ["id", "name", "handle"],
    filters: { handle, is_active: true },
  })

  const brand = brands?.[0]
  if (!brand) {
    return res.status(404).json({ message: `Brand with handle '${handle}' not found.` })
  }

  const seo = await seoService.retrieveForEntity("brand", brand.id)

  return res.status(200).json({ seo })
}

