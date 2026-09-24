export type NormalizedBrand = {
  name: string
  handle: string
  logo?: string | null
}

// Canonical dictionary of major computer, laptop, electronics & tech hardware brands
const KNOWN_BRANDS: Record<string, { name: string; handle: string; aliases: string[]; productLines: string[] }> = {
  lenovo: {
    name: "Lenovo",
    handle: "lenovo",
    aliases: [
      "lenovo",
      "lenovo group",
      "lenovo computers",
    ],
    productLines: [
      "thinkpad",
      "ideapad",
      "legion",
      "yoga",
      "thinkbook",
    ],
  },
  hp: {
    name: "HP",
    handle: "hp",
    aliases: [
      "hp",
      "hewlett packard",
      "hewlett-packard",
      "hp inc",
      "hp enterprise",
    ],
    productLines: [
      "probook",
      "elitebook",
      "pavilion",
      "omen",
      "victus",
      "envy",
      "spectre",
      "zbook",
    ],
  },
  dell: {
    name: "Dell",
    handle: "dell",
    aliases: [
      "dell",
      "dell technologies",
      "dell inc",
    ],
    productLines: [
      "alienware",
      "latitude",
      "xps",
      "inspiron",
      "vostro",
      "precision",
      "optiplex",
    ],
  },
  apple: {
    name: "Apple",
    handle: "apple",
    aliases: [
      "apple",
      "apple inc",
    ],
    productLines: [
      "macbook",
      "macbook air",
      "macbook pro",
      "imac",
      "mac mini",
      "mac studio",
      "mac pro",
      "ipad",
      "iphone",
    ],
  },
  asus: {
    name: "Asus",
    handle: "asus",
    aliases: [
      "asus",
      "asustek",
    ],
    productLines: [
      "rog",
      "republic of gamers",
      "tuf gaming",
      "zenbook",
      "vivobook",
      "expertbook",
    ],
  },
  acer: {
    name: "Acer",
    handle: "acer",
    aliases: [
      "acer",
      "acer inc",
    ],
    productLines: [
      "predator",
      "nitro",
      "aspire",
      "swift",
      "spin",
      "travelmate",
      "enduro",
    ],
  },
  msi: {
    name: "MSI",
    handle: "msi",
    aliases: [
      "msi",
      "micro-star",
      "micro star",
      "micro-star international",
    ],
    productLines: [
      "modern",
      "stealth",
      "katana",
      "raider",
      "cyborg",
    ],
  },
  samsung: {
    name: "Samsung",
    handle: "samsung",
    aliases: [
      "samsung",
      "samsung electronics",
    ],
    productLines: [
      "galaxy book",
      "galaxy tab",
      "galaxy",
    ],
  },
  microsoft: {
    name: "Microsoft",
    handle: "microsoft",
    aliases: ["microsoft"],
    productLines: [
      "surface",
      "surface pro",
      "surface laptop",
      "xbox",
    ],
  },
  toshiba: {
    name: "Toshiba",
    handle: "toshiba",
    aliases: ["toshiba"],
    productLines: [
      "dynabook",
      "portege",
      "satellite",
    ],
  },
  huawei: {
    name: "Huawei",
    handle: "huawei",
    aliases: ["huawei"],
    productLines: [
      "matebook",
      "honor",
    ],
  },
  sony: {
    name: "Sony",
    handle: "sony",
    aliases: ["sony"],
    productLines: [
      "vaio",
      "playstation",
    ],
  },
  lg: {
    name: "LG",
    handle: "lg",
    aliases: [
      "lg",
      "lg electronics",
    ],
    productLines: ["gram"],
  },
  logitech: {
    name: "Logitech",
    handle: "logitech",
    aliases: [
      "logitech",
      "logi",
    ],
    productLines: ["astro gaming"],
  },
  canon: {
    name: "Canon",
    handle: "canon",
    aliases: ["canon"],
    productLines: [
      "pixma",
      "imageclass",
    ],
  },
  epson: {
    name: "Epson",
    handle: "epson",
    aliases: ["epson"],
    productLines: [
      "ecotank",
      "workforce",
    ],
  },
  razer: {
    name: "Razer",
    handle: "razer",
    aliases: ["razer"],
    productLines: ["razer blade"],
  },
  corsair: {
    name: "Corsair",
    handle: "corsair",
    aliases: ["corsair"],
    productLines: ["elgato"],
  },
  kingston: {
    name: "Kingston",
    handle: "kingston",
    aliases: ["kingston"],
    productLines: [
      "fury",
      "hyperx",
    ],
  },
  seagate: {
    name: "Seagate",
    handle: "seagate",
    aliases: ["seagate"],
    productLines: [
      "barracuda",
      "ironwolf",
      "firecuda",
      "lacie",
    ],
  },
  western_digital: {
    name: "Western Digital",
    handle: "western-digital",
    aliases: [
      "western digital",
      "wd",
    ],
    productLines: [
      "sandisk",
      "wd black",
      "wd blue",
    ],
  },
  intel: {
    name: "Intel",
    handle: "intel",
    aliases: ["intel"],
    productLines: [
      "intel core",
      "core ultra",
      "xeon",
    ],
  },
  amd: {
    name: "AMD",
    handle: "amd",
    aliases: ["amd"],
    productLines: [
      "ryzen",
      "radeon",
    ],
  },
  nvidia: {
    name: "NVIDIA",
    handle: "nvidia",
    aliases: ["nvidia"],
    productLines: [
      "geforce",
      "rtx",
      "gtx",
      "quadro",
    ],
  },
  tp_link: {
    name: "TP-Link",
    handle: "tp-link",
    aliases: [
      "tp-link",
      "tplink",
    ],
    productLines: [
      "deco",
      "archer",
      "omada",
    ],
  },
  dlink: {
    name: "D-Link",
    handle: "d-link",
    aliases: [
      "d-link",
      "dlink",
    ],
    productLines: [],
  },
}

/**
 * Cleans a raw brand string by stripping corporate suffixes, trademarks, and symbols.
 */
export function sanitizeBrandString(raw: string): string {
  if (!raw) return ""

  return raw
    .replace(/[™®©]/g, "")
    .replace(/\((r|tm|c)\)/gi, "")
    .replace(/\b(inc|incorporated|corp|corporation|llc|ltd|co|technologies|technology|computers|electronics|systems|group)\b/gi, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Creates a URL-friendly handle from a name.
 */
export function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Looks up a brand in the KNOWN_BRANDS dictionary by handle, canonical name,
 * strong aliases, and optionally weak productLines.
 */
export function findKnownBrand(
  rawInput?: string | null,
  includeProductLines = false
): NormalizedBrand | null {
  if (!rawInput) return null

  const cleaned = sanitizeBrandString(rawInput).toLowerCase()
  if (!cleaned) return null

  // 1. Direct match: handle, canonical name, or aliases
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    if (brandInfo.handle === cleaned || brandInfo.name.toLowerCase() === cleaned) {
      return { name: brandInfo.name, handle: brandInfo.handle }
    }
    for (const alias of brandInfo.aliases) {
      if (alias === cleaned) {
        return { name: brandInfo.name, handle: brandInfo.handle }
      }
    }
  }

  // 2. Direct match: product lines (if enabled)
  if (includeProductLines) {
    for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
      for (const pl of brandInfo.productLines) {
        if (pl === cleaned) {
          return { name: brandInfo.name, handle: brandInfo.handle }
        }
      }
    }
  }

  // 3. Substring/prefix match: aliases
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    for (const alias of brandInfo.aliases) {
      const regex = new RegExp(`^${alias}\\b|\\b${alias}$`, "i")
      if (regex.test(cleaned)) {
        return { name: brandInfo.name, handle: brandInfo.handle }
      }
    }
  }

  // 4. Substring/prefix match: product lines (if enabled)
  if (includeProductLines) {
    for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
      for (const pl of brandInfo.productLines) {
        const regex = new RegExp(`^${pl}\\b|\\b${pl}$`, "i")
        if (regex.test(cleaned)) {
          return { name: brandInfo.name, handle: brandInfo.handle }
        }
      }
    }
  }

  return null
}

/**
 * Normalizes an extracted raw brand name into a canonical Brand structure.
 */
export function normalizeBrand(rawInput?: string | null): NormalizedBrand | null {
  if (!rawInput) return null

  const cleaned = sanitizeBrandString(rawInput).toLowerCase()
  if (!cleaned) return null

  // 1. Direct match in dictionary or aliases
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    if (brandInfo.handle === cleaned || brandInfo.name.toLowerCase() === cleaned) {
      return { name: brandInfo.name, handle: brandInfo.handle }
    }
    for (const alias of brandInfo.aliases) {
      if (alias === cleaned) {
        return { name: brandInfo.name, handle: brandInfo.handle }
      }
    }
  }

  // 2. Substring/prefix match against known brands
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    for (const alias of brandInfo.aliases) {
      const regex = new RegExp(`^${alias}\\b|\\b${alias}$`, "i")
      if (regex.test(cleaned)) {
        return { name: brandInfo.name, handle: brandInfo.handle }
      }
    }
  }

  // 3. Fallback: Title case cleaned string
  const capitalized = cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const handle = slugifyBrand(cleaned)

  if (!handle) return null

  return {
    name: capitalized,
    handle,
  }
}

/**
 * Extracts a brand from a product's title, attributes, categories, and tags.
 * Pass `logo` (e.g. the product thumbnail URL) to attach an image to the brand.
 */
export function extractBrandFromProduct(params: {
  title: string
  attributes?: { name: string; options: string[] }[]
  categories?: { name: string; slug: string }[]
  tags?: { name: string; slug: string }[]
  logo?: string | null
}): NormalizedBrand | null {
  const { title, attributes = [], categories = [], tags = [], logo } = params

  // 1. Check WooCommerce Attributes (highest priority: Brand, Make, Manufacturer)
  // Both aliases AND productLines are checked since the brand attribute is authoritative
  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase().trim()
    if (
      attrName === "brand" ||
      attrName === "brands" ||
      attrName === "manufacturer" ||
      attrName === "make"
    ) {
      for (const opt of attr.options || []) {
        const matched = findKnownBrand(opt, true)
        if (matched) return { ...matched, logo: logo || null }

        const normalized = normalizeBrand(opt)
        if (normalized) return { ...normalized, logo: logo || null }
      }
    }
  }

  // 2. Check title matching: Check aliases first across tokens
  const titleTokens = title.split(/[\s|/\\-]+/).filter(Boolean)
  for (const token of titleTokens) {
    const tokenNormalized = normalizeBrand(token)
    if (tokenNormalized && KNOWN_BRANDS[tokenNormalized.handle]) {
      return { ...tokenNormalized, logo: logo || null }
    }
  }

  // Only check productLines if the product line name is the FIRST word/token in the title
  if (titleTokens.length > 0) {
    const firstToken = sanitizeBrandString(titleTokens[0]).toLowerCase()
    const titleTrimmed = title.trim().toLowerCase().replace(/^[^a-z0-9]+/i, "")
    for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
      for (const pl of brandInfo.productLines) {
        if (pl === firstToken || new RegExp(`^${pl}\\b`, "i").test(titleTrimmed)) {
          return { name: brandInfo.name, handle: brandInfo.handle, logo: logo || null }
        }
      }
    }
  }

  // 3. Full title scan for known brands (ONLY aliases, NOT productLines)
  const titleLower = title.toLowerCase()
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    for (const alias of brandInfo.aliases) {
      const aliasRegex = new RegExp(`\\b${alias}\\b`, "i")
      if (aliasRegex.test(titleLower)) {
        return { name: brandInfo.name, handle: brandInfo.handle, logo: logo || null }
      }
    }
  }

  // 4. Check categories for known brands (both aliases AND productLines)
  for (const cat of categories) {
    const matched = findKnownBrand(cat.name, true)
    if (matched) {
      return { ...matched, logo: logo || null }
    }
  }

  // 5. Check tags for known brands (both aliases AND productLines)
  for (const tag of tags) {
    const matched = findKnownBrand(tag.name, true)
    if (matched) {
      return { ...matched, logo: logo || null }
    }
  }

  return null
}
