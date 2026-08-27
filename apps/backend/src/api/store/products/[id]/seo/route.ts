import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: "Product ID or handle is required." })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  let productId = id

  // If not a standard product ID (doesn't start with prod_), look up product by handle
  if (!id.startsWith("prod_")) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: id },
    })

    if (products && products.length > 0) {
      productId = products[0].id
    }
  }

  const seo = await seoService.retrieveForEntity("product", productId)

  return res.status(200).json({
    seo: seo || null,
  })
}
