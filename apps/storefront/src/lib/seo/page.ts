import { Metadata } from "next"
import { getCanonicalUrl } from "./canonical"
import { STORE_URL, DEFAULT_LOCALE, SITE_NAME } from "./constants"
import { SeoMetadataDTO } from "@lib/data/seo"

export type StaticPageInput = {
  title?: string
  description?: string | null
  path: string
}

/**
 * Generates exact Next.js Metadata strictly reflecting what is configured in Medusa.
 * Does NOT inject generic boilerplate text or fabricated fallback descriptions.
 */
export function generatePageMetadata(
  page: StaticPageInput,
  countryCode: string = "zw",
  seo?: SeoMetadataDTO | null
): Metadata {
  // Use strictly what was saved in the database
  const title = seo?.meta_title || page.title || ""
  const description = seo?.meta_description || page.description || undefined
  const canonical = seo?.canonical_url || getCanonicalUrl(page.path, countryCode)
  const ogTitle = seo?.og_title || title
  const ogDescription = seo?.og_description || description
  const ogImage = seo?.og_image
    ? [
        {
          url: seo.og_image,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ]
    : []

  const shouldIndex = seo ? seo.robots_index : true
  const shouldFollow = seo ? seo.robots_follow : true

  return {
    metadataBase: new URL(STORE_URL),
    // Using { absolute: ... } prevents Next.js from appending layout templates like `%s | Laptopzone`
    title: title ? { absolute: title } : undefined,
    description: description || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: "website",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      images: ogImage.map((img) => img.url),
    },
  }
}
