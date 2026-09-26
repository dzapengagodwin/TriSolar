import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generateProductFeedWorkflow } from "../../../workflows/generate-product-feed"
import { ProductFeedConfig } from "../../../workflows/steps/types"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const country =
    (req.query.country as string) ||
    (req.query.country_code as string) ||
    process.env.MERCHANT_COUNTRY ||
    "ZW"

  const currency =
    (req.query.currency as string) ||
    (req.query.currency_code as string) ||
    process.env.MERCHANT_CURRENCY ||
    "USD"

  const salesChannelId =
    (req.query.sales_channel_id as string) ||
    process.env.MERCHANT_SALES_CHANNEL_ID ||
    undefined

  const storefrontUrl =
    (req.query.storefront_url as string) ||
    process.env.STOREFRONT_URL ||
    "https://laptopzone.co.zw"

  const format = (req.query.format as string)?.toLowerCase()

  const config: ProductFeedConfig = {
    country_code: country,
    currency_code: currency,
    storefront_url: storefrontUrl,
    sales_channel_id: salesChannelId,
    feed_title: "Laptopzone - Google Merchant Center Product Feed",
    feed_description:
      "Official live product catalog feed for Laptopzone electronics and laptops",
    default_category: "Electronics > Computers > Laptops",
  }

  try {
    const { result } = await generateProductFeedWorkflow(req.scope).run({
      input: config,
    })

    if (format === "json") {
      return res.status(200).json({
        success: true,
        itemCount: result.itemCount,
        country,
        currency,
        storefront_url: storefrontUrl,
        diagnostics: result.diagnostics,
      })
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600")
    return res.status(200).send(result.xml)
  } catch (error: any) {
    console.error("Failed to generate Google product feed:", error)
    return res.status(500).json({
      message: "Failed to generate Google product feed",
      error: error.message || error,
    })
  }
}
