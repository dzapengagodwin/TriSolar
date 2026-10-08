import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"
import { UpsertSeoMetadataInput } from "../../../../../modules/seo/types"
import { upsertEntitySeoWorkflow } from "../../../../../workflows/upsert-entity-seo"
import { STATIC_PAGES, getPageEntityCandidates } from "../page-registry"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { handle } = req.params

  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Page handle is required."
    )
  }

  const pageDef = STATIC_PAGES[handle]
  if (!pageDef) {
    return res.status(404).json({
      message: `Page with handle '${handle}' is not registered. Available pages: ${Object.keys(STATIC_PAGES).join(", ")}`,
    })
  }

  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
  const storefrontUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"

  // Search candidate entity IDs in priority order (e.g. "home", then "page_home", "page_laptops-...")
  const candidates = getPageEntityCandidates(handle)
  let seo = null
  for (const candidateId of candidates) {
    const record = await seoService.retrieveForEntity("page", candidateId)
    if (record) {
      seo = record
      break
    }
  }

  const defaults = await seoService.getDefaults("page", {
    name: pageDef.title,
    handle,
    path: pageDef.path,
  }, { storefrontUrl })

  return res.status(200).json({
    page: {
      handle,
      title: pageDef.title,
      description: pageDef.description,
      path: pageDef.path,
    },
    seo,
    defaults,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { handle } = req.params

  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Page handle is required."
    )
  }

  const pageDef = STATIC_PAGES[handle]
  if (!pageDef) {
    return res.status(404).json({
      message: `Page with handle '${handle}' is not registered. Available pages: ${Object.keys(STATIC_PAGES).join(", ")}`,
    })
  }

  const body = req.body as Partial<UpsertSeoMetadataInput>

  const cleanData: UpsertSeoMetadataInput = {
    meta_title:
      typeof body.meta_title === "string" ? body.meta_title.trim() : null,
    meta_description:
      typeof body.meta_description === "string"
        ? body.meta_description.trim()
        : null,
    focus_keyphrase:
      typeof body.focus_keyphrase === "string"
        ? body.focus_keyphrase.trim()
        : null,
    canonical_url:
      typeof body.canonical_url === "string" ? body.canonical_url.trim() : null,
    og_title:
      typeof body.og_title === "string" ? body.og_title.trim() : null,
    og_description:
      typeof body.og_description === "string"
        ? body.og_description.trim()
        : null,
    og_image:
      typeof body.og_image === "string" ? body.og_image.trim() : null,
    robots_index:
      typeof body.robots_index === "boolean" ? body.robots_index : true,
    robots_follow:
      typeof body.robots_follow === "boolean" ? body.robots_follow : true,
    metadata: body.metadata || null,
  }

  const { result: updatedSeo } = await upsertEntitySeoWorkflow(req.scope).run({
    input: {
      entityType: "page",
      entityId: handle,
      data: cleanData,
    },
  })

  return res.status(200).json({
    success: true,
    seo: updatedSeo,
  })
}
