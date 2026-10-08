import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../../modules/seo"
import SeoModuleService from "../../../../modules/seo/service"
import { STATIC_PAGES, getPageEntityCandidates } from "./page-registry"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  const pages = await Promise.all(
    Object.entries(STATIC_PAGES).map(async ([handle, def]) => {
      const candidates = getPageEntityCandidates(handle)
      let seo = null
      for (const candidateId of candidates) {
        const record = await seoService.retrieveForEntity("page", candidateId)
        if (record) {
          seo = record
          break
        }
      }

      return {
        handle,
        title: def.title,
        description: def.description,
        path: def.path,
        has_seo: !!seo,
        meta_title: seo?.meta_title || null,
        meta_description: seo?.meta_description || null,
      }
    })
  )

  return res.status(200).json({ pages })
}
