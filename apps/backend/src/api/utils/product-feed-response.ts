import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { generateProductFeedWorkflow } from "../../workflows/generate-product-feed"
import { ProductFeedConfig } from "../../workflows/steps/types"

function getSingleQueryValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function getStorefrontUrl(): string {
  const configuredUrl = process.env.STOREFRONT_URL || "https://laptopzone.co.zw"
  const url = new URL(configuredUrl)

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "STOREFRONT_URL must be a valid http(s) origin or base path"
    )
  }

  return url.toString().replace(/\/+$/, "")
}

export async function serveProductFeed(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const countryCode = (
    getSingleQueryValue(req.query.country_code) ||
    getSingleQueryValue(req.query.country) ||
    process.env.MERCHANT_COUNTRY ||
    "ZW"
  ).toUpperCase()
  const currencyCode = (
    getSingleQueryValue(req.query.currency_code) ||
    getSingleQueryValue(req.query.currency) ||
    process.env.MERCHANT_CURRENCY ||
    "USD"
  ).toUpperCase()

  if (!/^[A-Z]{2}$/.test(countryCode) || !/^[A-Z]{3}$/.test(currencyCode)) {
    res.status(400).json({ message: "Invalid country or currency code" })
    return
  }

  const format = getSingleQueryValue(req.query.format)?.toLowerCase()
  if (format && format !== "xml" && format !== "json") {
    res.status(400).json({ message: "Unsupported product feed format" })
    return
  }

  try {
    const config: ProductFeedConfig = {
      country_code: countryCode,
      currency_code: currencyCode,
      storefront_url: getStorefrontUrl(),
      feed_title: "Laptopzone - Google Merchant Product Feed",
      feed_description: "Official Google Merchant Center Product Feed for Laptopzone",
    }
    const { result } = await generateProductFeedWorkflow(req.scope).run({ input: config })

    if (format === "json") {
      res.setHeader("Cache-Control", "no-store")
      res.json({
        success: true,
        itemCount: result.itemCount,
        country: countryCode,
        currency: currencyCode,
        storefront_url: config.storefront_url,
        diagnostics: result.diagnostics,
      })
      return
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600")
    res.status(200).send(result.xml)
  } catch (error) {
    logger.error("Failed to generate Google product feed", error)
    res.status(500).json({ message: "Unable to generate product feed" })
  }
}
