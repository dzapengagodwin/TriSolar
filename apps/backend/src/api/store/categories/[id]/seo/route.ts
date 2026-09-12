import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: "Category ID is required." })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  // Verify category exists
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "description"],
    filters: { id },
  })

  const category = categories?.[0]
  if (!category) {
    return res.status(404).json({ message: `Category with ID '${id}' not found.` })
  }

  const seo = await seoService.retrieveForEntity("category", id)

  return res.status(200).json({ seo })
}

