import { NextResponse } from "next/server"
import { escapeXml } from "./image"

export type SitemapEntry = {
  url: string
  lastModified?: string | Date | null
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}

export type SitemapIndexEntry = {
  loc: string
  lastmod?: string | Date | null
}

/**
 * Builds standard XML for a single sitemap URL set
 */
export function buildUrlSetXml(entries: SitemapEntry[]): string {
  const urlsXml = entries
    .map((entry) => {
      const loc = `    <loc>${escapeXml(entry.url)}</loc>`
      const lastmod = entry.lastModified
        ? `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
        : ""
      const changefreq = entry.changeFrequency
        ? `    <changefreq>${entry.changeFrequency}</changefreq>`
        : ""
      const priority =
        typeof entry.priority === "number"
          ? `    <priority>${entry.priority.toFixed(1)}</priority>`
          : ""

      const elements = [loc, lastmod, changefreq, priority].filter(Boolean).join("\n")

      return `  <url>\n${elements}\n  </url>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`
}

/**
 * Builds standard XML for a master sitemap index
 */
export function buildSitemapIndexXml(sitemaps: SitemapIndexEntry[]): string {
  const sitemapsXml = sitemaps
    .map((sitemap) => {
      const loc = `    <loc>${escapeXml(sitemap.loc)}</loc>`
      const lastmod = sitemap.lastmod
        ? `    <lastmod>${new Date(sitemap.lastmod).toISOString()}</lastmod>`
        : ""

      const elements = [loc, lastmod].filter(Boolean).join("\n")

      return `  <sitemap>\n${elements}\n  </sitemap>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXml}
</sitemapindex>`
}

/**
 * Standard XML HTTP response with SEO cache headers
 */
export function xmlResponse(xmlString: string): NextResponse {
  return new NextResponse(xmlString, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

