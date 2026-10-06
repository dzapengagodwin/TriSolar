import {
  ProductSeoAnalysisInput,
  SeoAnalysisResult,
  SeoCheck,
} from "../types"

/**
 * Strips HTML tags and collapses spaces
 */
function cleanText(raw?: string | null): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Normalizes string for keyphrase comparison
 */
function normalizeForSearch(text?: string | null): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Pure, framework-agnostic SEO Analyzer for Ecommerce Products
 */
export function analyzeProductSeo(
  input: ProductSeoAnalysisInput
): SeoAnalysisResult {
  const { product, seo, storefrontUrl = "https://laptopzone.co.zw" } = input

  const checks: SeoCheck[] = []

  const baseTitle = product.title || ""
  const effectiveTitle = seo?.meta_title || (baseTitle ? `${baseTitle} | Laptopzone` : "")

  const baseDescription = cleanText(product.description || product.subtitle)
  const effectiveDescription = cleanText(seo?.meta_description) || baseDescription

  const keyphrase = normalizeForSearch(seo?.focus_keyphrase)
  const slug = (product.handle || "").toLowerCase()

  const defaultCanonical = `${storefrontUrl.replace(/\/+$/, "")}/product/${slug}`
  const effectiveCanonical = defaultCanonical

  const images = (product.images || []).map((i) => i.url)
  if (product.thumbnail && !images.includes(product.thumbnail)) {
    images.unshift(product.thumbnail)
  }

  const brandName =
    (product.metadata?.brand as string) ||
    (product.metadata?.make as string) ||
    product.brand?.name

  const primaryVariant = product.variants?.[0]
  const sku = primaryVariant?.sku

  // ----------------------------------------------------
  // 1. CRITICAL CHECKS
  // ----------------------------------------------------

  // Check 1: Product Handle / Slug
  if (slug && slug.length >= 2 && !slug.includes(" ")) {
    checks.push({
      id: "handle_valid",
      title: "Indexable URL Slug",
      category: "critical",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Clean URL slug: /product/${slug}`,
    })
  } else {
    checks.push({
      id: "handle_valid",
      title: "Indexable URL Slug",
      category: "critical",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "Product is missing a valid URL handle or contains invalid characters.",
      recommendation: "Ensure product handle contains only lowercase letters, numbers, and hyphens.",
    })
  }

  // Check 2: Product Title Present
  if (baseTitle.trim().length > 0) {
    checks.push({
      id: "title_present",
      title: "Product Title",
      category: "critical",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Product title is defined: "${baseTitle}"`,
    })
  } else {
    checks.push({
      id: "title_present",
      title: "Product Title",
      category: "critical",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "Product title is missing.",
      recommendation: "Add an accurate, descriptive product title.",
    })
  }

  // Check 3: Product Description Present
  if (baseDescription.length >= 20) {
    checks.push({
      id: "description_present",
      title: "Product Description",
      category: "critical",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Product description present (${baseDescription.length} chars).`,
    })
  } else if (baseDescription.length > 0) {
    checks.push({
      id: "description_present",
      title: "Product Description",
      category: "critical",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: "Product description is very short.",
      recommendation: "Provide a detailed product description with at least 50+ words.",
    })
  } else {
    checks.push({
      id: "description_present",
      title: "Product Description",
      category: "critical",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "Product description is completely missing.",
      recommendation: "Add product specifications, features, and key benefits.",
    })
  }

  // Check 4: Product Image Present
  if (images.length >= 1) {
    checks.push({
      id: "image_present",
      title: "Product Image",
      category: "critical",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Primary image available (${images.length} images total).`,
    })
  } else {
    checks.push({
      id: "image_present",
      title: "Product Image",
      category: "critical",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "Product has no thumbnail or gallery images.",
      recommendation: "Upload at least one high-resolution product image.",
    })
  }

  // Check 5: Canonical URL Valid
  if (effectiveCanonical && effectiveCanonical.startsWith("http")) {
    checks.push({
      id: "canonical_valid",
      title: "Canonical URL",
      category: "critical",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: `Valid canonical URL defined: ${effectiveCanonical}`,
    })
  } else {
    checks.push({
      id: "canonical_valid",
      title: "Canonical URL",
      category: "critical",
      status: "fail",
      score: 0,
      maxScore: 5,
      message: "Canonical URL is missing or invalid.",
      recommendation: "Set a valid absolute HTTPS canonical URL.",
    })
  }

  // ----------------------------------------------------
  // 2. SEO QUALITY CHECKS
  // ----------------------------------------------------

  // Check 6: SEO Title Length (recommended 35–65 chars)
  const titleLen = effectiveTitle.length
  if (titleLen >= 35 && titleLen <= 65) {
    checks.push({
      id: "seo_title_length",
      title: "SEO Title Length",
      category: "quality",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Optimal SEO title length (${titleLen} characters).`,
    })
  } else if (titleLen > 0 && titleLen < 35) {
    checks.push({
      id: "seo_title_length",
      title: "SEO Title Length",
      category: "quality",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `SEO title is short (${titleLen} chars). Recommended: 40–60 characters.`,
      recommendation: "Add primary specifications (RAM, SSD, processor) or brand name to your SEO title.",
    })
  } else if (titleLen > 65) {
    checks.push({
      id: "seo_title_length",
      title: "SEO Title Length",
      category: "quality",
      status: "warn",
      score: 5,
      maxScore: 10,
      message: `SEO title may be truncated in Google search results (${titleLen} chars).`,
      recommendation: "Keep SEO title under 60–65 characters to prevent snippet truncation.",
    })
  } else {
    checks.push({
      id: "seo_title_length",
      title: "SEO Title Length",
      category: "quality",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "SEO title is empty.",
      recommendation: "Define a meta title for search engines.",
    })
  }

  // Check 7: Meta Description Length (recommended 120–160 chars)
  const descLen = effectiveDescription.length
  if (descLen >= 110 && descLen <= 165) {
    checks.push({
      id: "meta_description_length",
      title: "Meta Description Length",
      category: "quality",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: `Optimal meta description length (${descLen} characters).`,
    })
  } else if (descLen > 0 && descLen < 110) {
    checks.push({
      id: "meta_description_length",
      title: "Meta Description Length",
      category: "quality",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `Meta description is slightly short (${descLen} chars). Recommended: 120–160 chars.`,
      recommendation: "Expand the meta description with warranty, availability, or delivery details.",
    })
  } else if (descLen > 165) {
    checks.push({
      id: "meta_description_length",
      title: "Meta Description Length",
      category: "quality",
      status: "warn",
      score: 6,
      maxScore: 10,
      message: `Meta description exceeds standard search snippet limit (${descLen} chars).`,
      recommendation: "Trim meta description to under 160 characters.",
    })
  } else {
    checks.push({
      id: "meta_description_length",
      title: "Meta Description Length",
      category: "quality",
      status: "fail",
      score: 0,
      maxScore: 10,
      message: "Meta description is empty.",
      recommendation: "Add a compelling meta description highlighting product features and warranty.",
    })
  }

  // Check 8: Focus Keyphrase Defined
  if (keyphrase && keyphrase.length >= 3) {
    checks.push({
      id: "focus_keyphrase_defined",
      title: "Focus Keyphrase",
      category: "quality",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: `Focus keyphrase set: "${seo?.focus_keyphrase}"`,
    })

    // Check 9: Keyphrase in SEO Title
    const normTitle = normalizeForSearch(effectiveTitle)
    if (normTitle.includes(keyphrase)) {
      checks.push({
        id: "keyphrase_in_title",
        title: "Keyphrase in SEO Title",
        category: "quality",
        status: "pass",
        score: 10,
        maxScore: 10,
        message: "Focus keyphrase appears in SEO title.",
      })
    } else {
      checks.push({
        id: "keyphrase_in_title",
        title: "Keyphrase in SEO Title",
        category: "quality",
        status: "warn",
        score: 0,
        maxScore: 10,
        message: "Focus keyphrase was not found in SEO title.",
        recommendation: `Include "${seo?.focus_keyphrase}" near the beginning of the SEO title.`,
      })
    }

    // Check 10: Keyphrase in Meta Description
    const normDesc = normalizeForSearch(effectiveDescription)
    if (normDesc.includes(keyphrase)) {
      checks.push({
        id: "keyphrase_in_description",
        title: "Keyphrase in Meta Description",
        category: "quality",
        status: "pass",
        score: 5,
        maxScore: 5,
        message: "Focus keyphrase appears in meta description.",
      })
    } else {
      checks.push({
        id: "keyphrase_in_description",
        title: "Keyphrase in Meta Description",
        category: "quality",
        status: "warn",
        score: 0,
        maxScore: 5,
        message: "Focus keyphrase was not found in meta description.",
        recommendation: `Incorporate "${seo?.focus_keyphrase}" naturally in the meta description.`,
      })
    }

    // Check 11: Keyphrase in Slug
    const normSlug = slug.replace(/-/g, " ")
    const keyphraseWords = keyphrase.split(" ").filter((w) => w.length > 2)
    const hasKeyphraseInSlug =
      normSlug.includes(keyphrase) ||
      (keyphraseWords.length > 0 &&
        keyphraseWords.every((w) => normSlug.includes(w)))

    if (hasKeyphraseInSlug) {
      checks.push({
        id: "keyphrase_in_slug",
        title: "Keyphrase in URL Slug",
        category: "quality",
        status: "pass",
        score: 5,
        maxScore: 5,
        message: "Keyphrase matches product URL handle.",
      })
    } else {
      checks.push({
        id: "keyphrase_in_slug",
        title: "Keyphrase in URL Slug",
        category: "quality",
        status: "warn",
        score: 2,
        maxScore: 5,
        message: "Some keyphrase words are missing in the URL slug.",
        recommendation: "Ensure key product identifiers are represented in product handle.",
      })
    }
  } else {
    checks.push({
      id: "focus_keyphrase_defined",
      title: "Focus Keyphrase",
      category: "quality",
      status: "warn",
      score: 0,
      maxScore: 5,
      message: "No focus keyphrase configured.",
      recommendation: "Enter a target search keyphrase (e.g. 'Lenovo ThinkPad E14 Gen 6') to evaluate keyword alignment.",
    })
  }

  // ----------------------------------------------------
  // 3. ECOMMERCE CHECKS
  // ----------------------------------------------------

  // Check 12: Brand Defined
  if (brandName && brandName.trim()) {
    checks.push({
      id: "brand_defined",
      title: "Product Brand",
      category: "ecommerce",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: `Brand resolved: "${brandName}"`,
    })
  } else {
    checks.push({
      id: "brand_defined",
      title: "Product Brand",
      category: "ecommerce",
      status: "warn",
      score: 0,
      maxScore: 5,
      message: "Brand is not specified.",
      recommendation: "Assign a brand in the Brand widget to enable Google brand rich snippets.",
    })
  }

  // Check 13: Image Gallery
  if (images.length >= 2) {
    checks.push({
      id: "gallery_images",
      title: "Product Images Gallery",
      category: "ecommerce",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: `Rich image gallery (${images.length} images available).`,
    })
  } else if (images.length === 1) {
    checks.push({
      id: "gallery_images",
      title: "Product Images Gallery",
      category: "ecommerce",
      status: "warn",
      score: 2,
      maxScore: 5,
      message: "Only 1 image available.",
      recommendation: "Adding 2+ angles improves buyer trust and Google Image rankings.",
    })
  } else {
    checks.push({
      id: "gallery_images",
      title: "Product Images Gallery",
      category: "ecommerce",
      status: "fail",
      score: 0,
      maxScore: 5,
      message: "No gallery images found.",
      recommendation: "Upload product images.",
    })
  }

  // Check 14: SKU Defined
  if (sku && sku.trim()) {
    checks.push({
      id: "sku_defined",
      title: "Product SKU",
      category: "ecommerce",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: `Variant SKU set: "${sku}"`,
    })
  } else {
    checks.push({
      id: "sku_defined",
      title: "Product SKU",
      category: "ecommerce",
      status: "warn",
      score: 0,
      maxScore: 5,
      message: "Product variant has no SKU.",
      recommendation: "Assign SKUs to enable precise Google Shopping and Merchant Center matching.",
    })
  }

  // Check 15: Price & Currency
  const hasPrice =
    primaryVariant?.calculated_price ||
    (primaryVariant?.prices && primaryVariant.prices.length > 0)
  if (hasPrice) {
    checks.push({
      id: "price_defined",
      title: "Pricing & Currency",
      category: "ecommerce",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: "Variant price is configured.",
    })
  } else {
    checks.push({
      id: "price_defined",
      title: "Pricing & Currency",
      category: "ecommerce",
      status: "fail",
      score: 0,
      maxScore: 5,
      message: "No price configured on product variants.",
      recommendation: "Add prices to variants for Google Shopping & Schema offers.",
    })
  }

  // ----------------------------------------------------
  // 4. TECHNICAL CHECKS
  // ----------------------------------------------------

  // Check 16: Robots Configuration
  const isRobotsIndex = seo?.robots_index !== false
  const isRobotsFollow = seo?.robots_follow !== false

  if (isRobotsIndex && isRobotsFollow) {
    checks.push({
      id: "robots_configuration",
      title: "Robots Indexing Directive",
      category: "technical",
      status: "pass",
      score: 5,
      maxScore: 5,
      message: "Robots configured to index and follow (crawlable).",
    })
  } else if (!isRobotsIndex) {
    checks.push({
      id: "robots_configuration",
      title: "Robots Indexing Directive",
      category: "technical",
      status: "warn",
      score: 2,
      maxScore: 5,
      message: "Product is explicitly set to noindex (hidden from search engines).",
      recommendation: "Enable 'Index' checkbox if this product should appear in Google search results.",
    })
  } else {
    checks.push({
      id: "robots_configuration",
      title: "Robots Indexing Directive",
      category: "technical",
      status: "pass",
      score: 4,
      maxScore: 5,
      message: "Robots set to index (nofollow enabled).",
    })
  }

  // ----------------------------------------------------
  // Calculate Totals & Score
  // ----------------------------------------------------
  const totalEarned = checks.reduce((sum, c) => sum + c.score, 0)
  const totalMax = checks.reduce((sum, c) => sum + c.maxScore, 0)

  const normalizedScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0

  let status: "good" | "ok" | "poor" = "good"
  if (normalizedScore < 60) {
    status = "poor"
  } else if (normalizedScore < 80) {
    status = "ok"
  }

  const criticalCount = checks.filter((c) => c.status === "fail").length
  const warningCount = checks.filter((c) => c.status === "warn").length
  const passCount = checks.filter((c) => c.status === "pass").length

  return {
    score: normalizedScore,
    status,
    criticalCount,
    warningCount,
    passCount,
    checks,
  }
}
