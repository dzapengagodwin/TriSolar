import type { YoastHeadJson, YoastSeoRecord } from "./yoast-seo-client"
import type { UpsertSeoMetadataInput } from "../../seo/types"

const SITE_NAME = "Laptopzone"

// -------------------------------------------------------------------
// Yoast snippet variable token resolver
// Yoast stores titles like "%%title%% %%sep%% %%sitename%%"
// We substitute them with real values before saving.
// -------------------------------------------------------------------
const YOAST_TOKEN_REGEX = /%%([a-z0-9_]+)%%/gi

function resolveYoastTokens(
  raw: string | undefined | null,
  context: { title?: string; category?: string; year?: string }
): string | null {
  if (!raw) return null

  const result = raw.replace(YOAST_TOKEN_REGEX, (_match, token: string) => {
    switch (token.toLowerCase()) {
      case "title":
        return context.title || ""
      case "sitename":
      case "site_name":
        return SITE_NAME
      case "sep":
      case "separator":
        return "|"
      case "category":
      case "primary_category":
        return context.category || ""
      case "currentyear":
      case "current_year":
        return context.year || new Date().getFullYear().toString()
      case "excerpt":
      case "excerpt_only":
        return ""
      case "page":
      case "pagenumber":
        return ""
      default:
        return ""
    }
  })

  // Normalize whitespace artifacts left by empty token substitutions
  return result
    .replace(/\s*\|\s*\|/g, " |")
    .replace(/^\s*\|\s*/g, "")
    .replace(/\s*\|\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim() || null
}

// -------------------------------------------------------------------
// Determine robots_index and robots_follow from Yoast robots object
// -------------------------------------------------------------------
function resolveRobots(
  yoast: YoastHeadJson
): { robots_index: boolean; robots_follow: boolean } {
  const robots = yoast.robots
  return {
    robots_index: robots?.index !== "noindex",
    robots_follow: robots?.follow !== "nofollow",
  }
}

// -------------------------------------------------------------------
// Main transformer: YoastSeoRecord → UpsertSeoMetadataInput
// -------------------------------------------------------------------
export function transformYoastRecord(record: YoastSeoRecord): UpsertSeoMetadataInput {
  const { yoast, entityTitle, entityType } = record

  const context: { title: string; category?: string; year: string } = {
    title: entityTitle,
    year: new Date().getFullYear().toString(),
  }

  // Use entity title for %%primary_category%% on products if available
  if (entityType === "category") {
    context.category = entityTitle
  }

  const { robots_index, robots_follow } = resolveRobots(yoast)

  // Meta title: prefer Yoast SEO title, fall back to OG title
  const metaTitleRaw = yoast.title || yoast.og_title
  const metaTitle = resolveYoastTokens(metaTitleRaw, context)

  // Meta description
  const metaDesc = resolveYoastTokens(yoast.description, context)

  // OG title (can differ from meta title)
  const ogTitle = resolveYoastTokens(yoast.og_title || yoast.title, context)

  // OG description
  const ogDesc = resolveYoastTokens(yoast.og_description || yoast.description, context)

  // OG Image — use first image from yoast_head_json og_image array
  const ogImage =
    Array.isArray(yoast.og_image) && yoast.og_image.length > 0
      ? yoast.og_image[0].url || null
      : null

  // Canonical URL — strip query strings and trailing slashes
  let canonicalUrl: string | null = yoast.canonical || null
  if (canonicalUrl) {
    try {
      const parsed = new URL(canonicalUrl)
      canonicalUrl = parsed.origin + parsed.pathname.replace(/\/+$/, "")
    } catch {
      canonicalUrl = null
    }
  }

  return {
    meta_title: metaTitle,
    meta_description: metaDesc,
    og_title: ogTitle,
    og_description: ogDesc,
    og_image: ogImage,
    canonical_url: canonicalUrl,
    robots_index,
    robots_follow,
    // focus_keyphrase: not available in yoast_head_json (only in WP post meta)
    // Store Yoast source info in metadata for audit trail
    metadata: {
      yoast_imported: true,
      yoast_wp_id: record.wpId,
      yoast_imported_at: new Date().toISOString(),
    },
  }
}

// -------------------------------------------------------------------
// Preview helper: returns a human-readable summary of what would be
// imported for each record without writing to the database.
// -------------------------------------------------------------------
export interface YoastPreviewRow {
  wpId: number
  wpSlug: string
  entityType: string
  entityTitle: string
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  canonicalUrl: string | null
  willMatch: boolean
}

export function buildPreviewRow(
  record: YoastSeoRecord,
  medusaId: string | null
): YoastPreviewRow {
  const transformed = transformYoastRecord(record)
  return {
    wpId: record.wpId,
    wpSlug: record.entitySlug,
    entityType: record.entityType,
    entityTitle: record.entityTitle,
    metaTitle: transformed.meta_title ?? null,
    metaDescription: transformed.meta_description ?? null,
    ogImage: transformed.og_image ?? null,
    robotsIndex: transformed.robots_index ?? true,
    robotsFollow: transformed.robots_follow ?? true,
    canonicalUrl: transformed.canonical_url ?? null,
    willMatch: medusaId !== null,
  }
}
