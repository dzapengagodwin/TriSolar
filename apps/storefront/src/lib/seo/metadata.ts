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
  /** Override <title> tag separately from OG title. Falls back to `title` if omitted. */
  metaTitle?: string
  /** Override <meta name="description"> separately from OG description. Falls back to `description` if omitted. */
  metaDescription?: string
  canonicalUrl?: string
  imageUrl?: string | null
  noIndex?: boolean
  noFollow?: boolean
  /** Fine-grained robots control — overrides noIndex/noFollow when provided. */
  robots?: { index: boolean; follow: boolean }
  type?: "website" | "article"
  /** When true, prevents parent layout template from appending " | Laptopzone" */
  absoluteTitle?: boolean
}

/**
 * Builds standard, Google-compliant Next.js Metadata with OpenGraph, Twitter Cards, and canonical links
 */
export function buildBaseMetadata(options: BaseMetadataOptions = {}): Metadata {
  // OG title/description: what the caller passes as title/description
  const ogTitle = options.title || SITE_DEFAULT_TITLE
  const ogDescription = options.description || DEFAULT_SITE_DESCRIPTION

  // Page <title> / <meta name="description">: prefer metaTitle/metaDescription overrides
  const pageTitle = options.metaTitle || ogTitle
  const pageDescription = options.metaDescription || ogDescription

  // Robots: fine-grained object takes precedence over noIndex/noFollow flags
  const shouldIndex = options.robots ? options.robots.index : !options.noIndex
  const shouldFollow = options.robots ? options.robots.follow : !options.noFollow && !options.noIndex

  const canonical = options.canonicalUrl

  const imageList = options.imageUrl
    ? [
        {
          url: options.imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ]
    : []

  return {
    metadataBase: new URL(STORE_URL),
    title: options.absoluteTitle && pageTitle
      ? {
          absolute: pageTitle,
        }
      : pageTitle
      ? {
          default: pageTitle,
          template: SITE_TITLE_TEMPLATE,
        }
      : SITE_DEFAULT_TITLE,
    description: pageDescription,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
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
      title: ogTitle,
      description: ogDescription,
      url: canonical || STORE_URL,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: options.type || "website",
      images: imageList,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
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
