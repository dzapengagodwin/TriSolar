import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"
import { UpsertSeoMetadataInput } from "../../../../../modules/seo/types"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { handle } = req.params

  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Brand handle is required."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: ["id", "name", "handle", "description", "logo"],
    filters: { handle },
  })

  const brand = brands?.[0]
  if (!brand) {
    return res.status(404).json({
      message: `Brand with handle '${handle}' was not found.`,
    })
  }

  const storefrontUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"
  const countryCode = process.env.MERCHANT_COUNTRY || "zw"

  const seo = await seoService.retrieveForEntity("brand", brand.id)
  const defaults = await seoService.getDefaults("brand", brand, {
    storefrontUrl,
    countryCode,
  })

  return res.status(200).json({
    brand: {
      id: brand.id,
      name: brand.name,
      handle: brand.handle,
      logo: brand.logo,
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
      "Brand handle is required."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: ["id", "name", "handle", "description", "logo"],
    filters: { handle },
  })

  const brand = brands?.[0]
  if (!brand) {
    return res.status(404).json({
      message: `Brand with handle '${handle}' was not found.`,
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

  const updatedSeo = await seoService.upsertForEntity("brand", brand.id, cleanData)

  return res.status(200).json({
    success: true,
    seo: updatedSeo,
  })
}

