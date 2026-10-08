import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ProductFeedConfig, ProductFeedItem } from "./types"

/**
 * Wraps text in CDATA to safely escape XML special characters
 */
function cdata(text?: string | null): string {
  if (!text) return ""
  // Split CDATA sections without changing the source text.
  const sanitized = text.replace(/\]\]>/g, "]]]]><![CDATA[>")
  return `<![CDATA[${sanitized}]]>`
}

/**
 * Escapes plain XML text
 */
function escapeXml(unsafe?: string | null): string {
  if (!unsafe) return ""
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export type BuildFeedXmlInput = {
  items: ProductFeedItem[]
  config: ProductFeedConfig
}

/**
 * Generates valid RSS 2.0 XML string conforming to Google Merchant Center specification
 */
export function generateGoogleProductFeedXml(
  items: ProductFeedItem[],
  config: ProductFeedConfig
): string {
  const feedTitle = config.feed_title || "Laptopzone - Google Merchant Product Feed"
  const feedDescription =
    config.feed_description ||
    "Official Google Merchant Center Product Feed for Laptopzone"
  const feedLink = config.storefront_url

  const xmlItems = items.map((item) => {
    const lines: string[] = []
    lines.push("    <item>")
    lines.push(`      <g:id>${escapeXml(item.id)}</g:id>`)
    lines.push(`      <g:title>${cdata(item.title)}</g:title>`)
    lines.push(`      <g:description>${cdata(item.description)}</g:description>`)
    lines.push(`      <g:link>${escapeXml(item.link)}</g:link>`)
    lines.push(`      <g:image_link>${escapeXml(item.image_link)}</g:image_link>`)

    if (item.additional_image_link && item.additional_image_link.length > 0) {
      for (const imgUrl of item.additional_image_link) {
        lines.push(`      <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>`)
      }
    }

    lines.push(`      <g:availability>${item.availability}</g:availability>`)
    if (item.availability_date) {
      lines.push(`      <g:availability_date>${escapeXml(item.availability_date)}</g:availability_date>`)
    }
    lines.push(`      <g:price>${escapeXml(item.price)}</g:price>`)

    if (item.sale_price) {
      lines.push(`      <g:sale_price>${escapeXml(item.sale_price)}</g:sale_price>`)
    }

    if (item.item_group_id) {
      lines.push(`      <g:item_group_id>${escapeXml(item.item_group_id)}</g:item_group_id>`)
    }

    lines.push(`      <g:condition>${item.condition}</g:condition>`)

    if (item.brand) {
      lines.push(`      <g:brand>${cdata(item.brand)}</g:brand>`)
    }

    if (item.gtin) {
      lines.push(`      <g:gtin>${escapeXml(String(item.gtin))}</g:gtin>`)
    }

    if (item.mpn) {
      lines.push(`      <g:mpn>${escapeXml(String(item.mpn))}</g:mpn>`)
    }

    lines.push(`      <g:identifier_exists>${item.identifier_exists}</g:identifier_exists>`)

    if (item.google_product_category) {
      lines.push(
        `      <g:google_product_category>${cdata(
          item.google_product_category
        )}</g:google_product_category>`
      )
    }

    if (item.custom_label_0) {
      lines.push(`      <g:custom_label_0>${cdata(item.custom_label_0)}</g:custom_label_0>`)
    }

    if (item.custom_label_1) {
      lines.push(`      <g:custom_label_1>${cdata(item.custom_label_1)}</g:custom_label_1>`)
    }

    if (item.custom_label_2) {
      lines.push(`      <g:custom_label_2>${cdata(item.custom_label_2)}</g:custom_label_2>`)
    }

    lines.push("    </item>")
    return lines.join("\n")
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${cdata(feedTitle)}</title>
    <link>${escapeXml(feedLink)}</link>
    <description>${cdata(feedDescription)}</description>
${xmlItems.join("\n")}
  </channel>
</rss>`
}

export const buildProductFeedXmlStep = createStep(
  "build-product-feed-xml",
  async (input: BuildFeedXmlInput) => {
    const xml = generateGoogleProductFeedXml(input.items, input.config)
    return new StepResponse({
      xml,
      itemCount: input.items.length,
    })
  }
)
