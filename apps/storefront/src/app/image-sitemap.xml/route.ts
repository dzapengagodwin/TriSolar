import { NextResponse } from "next/server"
import { listProducts } from "@lib/data/products"
import { getProductCanonicalUrl } from "@lib/seo/canonical"
import { DEFAULT_COUNTRY_CODE } from "@lib/seo/constants"
import { escapeXml, getProductImageAlt } from "@lib/seo/image"

export const dynamic = "force-dynamic"
export const revalidate = 3600

/**
 * Dedicated Google Image Sitemap Route (/image-sitemap.xml)
 * Implements the official Google Image Sitemap namespace standard:
 * xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
 */
export async function GET() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const now = new Date().toISOString()
  const pageSize = 100
  let offset = 0
  let hasMore = true

  const allProducts: Array<{
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    images?: Array<{ url?: string }> | null
    updated_at?: string | Date | null
    brand?: { name?: string } | null
    metadata?: Record<string, unknown> | null
  }> = []

  // Scalable pagination loop to retrieve all published catalog products
  while (hasMore) {
    try {
      const { response } = await listProducts({
        countryCode,
        queryParams: {
          limit: pageSize,
          offset,
          fields: "id,title,handle,thumbnail,images,updated_at,status,metadata",
        },
      })

      const products = response?.products || []
      if (products.length === 0) {
        hasMore = false
        break
      }

      for (const prod of products) {
        // Exclude draft, archived, or noindex products
        if (
          prod.handle &&
          (prod as any).status !== "draft" &&
          (prod as any).status !== "archived" &&
          prod.metadata?.noindex !== true &&
          prod.metadata?.seo_index !== false
        ) {
          allProducts.push(prod as any)
        }
      }

      offset += pageSize
      if (products.length < pageSize) {
        hasMore = false
      }
    } catch (err) {
      console.error("Error fetching products for image sitemap:", err)
      hasMore = false
    }
  }

  // Construct Google Image Sitemap XML
  const xmlEntries: string[] = []

  for (const prod of allProducts) {
    const canonicalUrl = getProductCanonicalUrl(prod.handle, countryCode)
    const lastMod = prod.updated_at
      ? new Date(prod.updated_at).toISOString()
      : now
    const brandName =
      prod.brand?.name ||
      (prod.metadata?.brand as string) ||
      (prod.metadata?.make as string) ||
      null

    // Collect and de-duplicate valid image URLs
    const distinctImageUrls: string[] = []
    if (prod.thumbnail && prod.thumbnail.startsWith("http")) {
      distinctImageUrls.push(prod.thumbnail)
    }
    if (prod.images && prod.images.length > 0) {
      for (const img of prod.images) {
        if (img.url && img.url.startsWith("http") && !distinctImageUrls.includes(img.url)) {
          distinctImageUrls.push(img.url)
        }
      }
    }

    if (distinctImageUrls.length === 0) {
      continue
    }

    const imageElements = distinctImageUrls
      .map((imgUrl, idx) => {
        const altText = getProductImageAlt({
          title: prod.title,
          brand: brandName,
          index: idx,
          totalImages: distinctImageUrls.length,
        })

        return `    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(altText)}</image:title>
      <image:caption>${escapeXml(prod.title)}</image:caption>
    </image:image>`
      })
      .join("\n")

    xmlEntries.push(`  <url>
    <loc>${escapeXml(canonicalUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
${imageElements}
  </url>`)
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries.join("\n")}
</urlset>`

  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
