import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { SEO_MODULE } from "../../../../../modules/seo"
import SeoModuleService from "../../../../../modules/seo/service"
import { UpsertSeoMetadataInput } from "../../../../../modules/seo/types"
import { upsertProductSeoWorkflow } from "../../../../../workflows/upsert-product-seo"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  if (!id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product ID is required."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  // Query product entity with relations
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "subtitle",
      "description",
      "handle",
      "thumbnail",
      "status",
      "metadata",
      "images.id",
      "images.url",
      "brand.id",
      "brand.name",
      "brand.handle",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.barcode",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.inventory_quantity",
    ],
    filters: { id },
  })

  const product = products?.[0]
  if (!product) {
    return res.status(404).json({
      message: `Product with ID '${id}' was not found.`,
    })
  }

  const storefrontUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"
  const countryCode = process.env.MERCHANT_COUNTRY || "zw"

  const seo = await seoService.retrieveForEntity("product", id)
  const defaults = await seoService.getDefaults("product", product, {
    storefrontUrl,
    countryCode,
  })

  const analysis = await seoService.analyze({
    product,
    seo,
    storefrontUrl,
    countryCode,
  })

  return res.status(200).json({
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
    },
    seo,
    defaults,
    analysis,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  if (!id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product ID is required."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)

  // Verify product exists
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "subtitle",
      "description",
      "handle",
      "thumbnail",
      "status",
      "metadata",
      "images.id",
      "images.url",
      "brand.id",
      "brand.name",
      "brand.handle",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.barcode",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.inventory_quantity",
    ],
    filters: { id },
  })

  const product = products?.[0]
  if (!product) {
    return res.status(404).json({
      message: `Product with ID '${id}' was not found.`,
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

  // Execute workflow
  const { result: updatedSeo } = await upsertProductSeoWorkflow(req.scope).run({
    input: {
      productId: id,
      data: cleanData,
    },
  })

  const storefrontUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"
  const countryCode = process.env.MERCHANT_COUNTRY || "zw"

  const analysis = await seoService.analyze({
    product,
    seo: updatedSeo,
    storefrontUrl,
    countryCode,
  })

  return res.status(200).json({
    success: true,
    seo: updatedSeo,
    analysis,
  })
}
