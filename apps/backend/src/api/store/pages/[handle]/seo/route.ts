import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"
import { getPageEntityCandidates } from "../../../../admin/seo/pages/page-registry"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params

  if (!handle) {
    return res.status(400).json({ message: "Page handle is required." })
  }

  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  // Resolve candidate entity IDs in priority order (e.g. "home", then "page_home", "page_laptops-...")
  const candidates = getPageEntityCandidates(handle)
  let seo = null
  for (const candidateId of candidates) {
    const record = await seoService.retrieveForEntity("page", candidateId)
    if (record) {
      seo = record
      break
    }
  }

  return res.status(200).json({ seo })
}

