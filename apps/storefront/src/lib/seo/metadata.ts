import { Metadata } from "next"
import {
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  SITE_TITLE_TEMPLATE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_LOCALE,
  STORE_URL,
} from "./constants"

export type BaseMetadataOptions = {
  title?: string
  description?: string
  canonicalUrl?: string
  imageUrl?: string | null
  noIndex?: boolean
  type?: "website" | "article"
}

/**
 * Builds standard, Google-compliant Next.js Metadata with OpenGraph, Twitter Cards, and canonical links
 */
export function buildBaseMetadata(options: BaseMetadataOptions = {}): Metadata {
  const title = options.title || SITE_DEFAULT_TITLE
  const description = options.description || DEFAULT_SITE_DESCRIPTION
  const isNoIndex = !!options.noIndex
  const canonical = options.canonicalUrl

  const imageList = options.imageUrl
    ? [
        {
          url: options.imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : []

  return {
    metadataBase: new URL(STORE_URL),
    title: options.title
      ? {
          default: title,
          template: SITE_TITLE_TEMPLATE,
        }
      : SITE_DEFAULT_TITLE,
    description,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    robots: {
      index: !isNoIndex,
      follow: !isNoIndex,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical || STORE_URL,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: options.type || "website",
      images: imageList,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageList.map((img) => img.url),
    },
  }
}

/**
 * Helper to generate strict noindex metadata for internal/utility routes (search, filters, cart, account, checkout)
 */
export function createNoIndexMetadata(title: string, description?: string): Metadata {
  return buildBaseMetadata({
    title,
    description: description || DEFAULT_SITE_DESCRIPTION,
    noIndex: true,
  })
}
