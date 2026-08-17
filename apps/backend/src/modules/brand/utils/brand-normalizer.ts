export type NormalizedBrand = {
  name: string
  handle: string
}

// Canonical dictionary of major computer, laptop, electronics & tech hardware brands
const KNOWN_BRANDS: Record<string, { name: string; handle: string; aliases: string[] }> = {
  lenovo: {
    name: "Lenovo",
    handle: "lenovo",
    aliases: [
      "lenovo",
      "lenovo group",
      "lenovo computers",
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
      "galaxy book",
      "galaxy tab",
      "galaxy",
    ],
  },
  microsoft: {
    name: "Microsoft",
    handle: "microsoft",
    aliases: ["microsoft", "surface", "surface pro", "surface laptop", "xbox"],
  },
  toshiba: {
    name: "Toshiba",
    handle: "toshiba",
    aliases: ["toshiba", "dynabook", "portege", "satellite"],
  },
  huawei: {
    name: "Huawei",
    handle: "huawei",
    aliases: ["huawei", "matebook", "honor"],
  },
  sony: {
    name: "Sony",
    handle: "sony",
    aliases: ["sony", "vaio", "playstation"],
  },
  lg: {
    name: "LG",
    handle: "lg",
    aliases: ["lg", "lg electronics", "gram"],
  },
  logitech: {
    name: "Logitech",
    handle: "logitech",
    aliases: ["logitech", "logi", "astro gaming"],
  },
  canon: {
    name: "Canon",
    handle: "canon",
    aliases: ["canon", "pixma", "imageclass"],
  },
  epson: {
    name: "Epson",
    handle: "epson",
    aliases: ["epson", "ecotank", "workforce"],
  },
  razer: {
    name: "Razer",
    handle: "razer",
    aliases: ["razer", "razer blade"],
  },
  corsair: {
    name: "Corsair",
    handle: "corsair",
    aliases: ["corsair", "elgato"],
  },
  kingston: {
    name: "Kingston",
    handle: "kingston",
    aliases: ["kingston", "fury", "hyperx"],
  },
  seagate: {
    name: "Seagate",
    handle: "seagate",
    aliases: ["seagate", "barracuda", "ironwolf", "firecuda", "lacie"],
  },
  western_digital: {
    name: "Western Digital",
    handle: "western-digital",
    aliases: ["western digital", "wd", "sandisk", "wd black", "wd blue"],
  },
  intel: {
    name: "Intel",
    handle: "intel",
    aliases: ["intel", "intel core", "core ultra", "xeon"],
  },
  amd: {
    name: "AMD",
    handle: "amd",
    aliases: ["amd", "ryzen", "radeon"],
  },
  nvidia: {
    name: "NVIDIA",
    handle: "nvidia",
    aliases: ["nvidia", "geforce", "rtx", "gtx", "quadro"],
  },
  tp_link: {
    name: "TP-Link",
    handle: "tp-link",
    aliases: ["tp-link", "tplink", "deco", "archer", "omada"],
  },
  dlink: {
    name: "D-Link",
    handle: "d-link",
    aliases: ["d-link", "dlink"],
  },
}

/**
 * Cleans a raw brand string by stripping corporate suffixes, trademarks, and symbols.
 */
export function sanitizeBrandString(raw: string): string {
  if (!raw) return ""

  return raw
    .replace(/[™®©]/g, "")
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
 */
export function extractBrandFromProduct(params: {
  title: string
  attributes?: { name: string; options: string[] }[]
  categories?: { name: string; slug: string }[]
  tags?: { name: string; slug: string }[]
}): NormalizedBrand | null {
  const { title, attributes = [], categories = [], tags = [] } = params

  // 1. Check WooCommerce Attributes (highest priority: Brand, Make, Manufacturer)
  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase().trim()
    if (
      attrName === "brand" ||
      attrName === "brands" ||
      attrName === "manufacturer" ||
      attrName === "make"
    ) {
      for (const opt of attr.options || []) {
        const normalized = normalizeBrand(opt)
        if (normalized) return normalized
      }
    }
  }

  // 2. Check title prefix or token match with known brands
  const titleTokens = title.split(/[\s|/\\-]+/).filter(Boolean)
  for (const token of titleTokens) {
    const tokenNormalized = normalizeBrand(token)
    if (tokenNormalized && KNOWN_BRANDS[tokenNormalized.handle]) {
      return tokenNormalized
    }
  }

  // Check full title for known brands
  const titleLower = title.toLowerCase()
  for (const [, brandInfo] of Object.entries(KNOWN_BRANDS)) {
    for (const alias of brandInfo.aliases) {
      const aliasRegex = new RegExp(`\\b${alias}\\b`, "i")
      if (aliasRegex.test(titleLower)) {
        return { name: brandInfo.name, handle: brandInfo.handle }
      }
    }
  }

  // 3. Check categories for known brands
  for (const cat of categories) {
    const normalized = normalizeBrand(cat.name)
    if (normalized && KNOWN_BRANDS[normalized.handle]) {
      return normalized
    }
  }

  // 4. Check tags for known brands
  for (const tag of tags) {
    const normalized = normalizeBrand(tag.name)
    if (normalized && KNOWN_BRANDS[normalized.handle]) {
      return normalized
    }
  }

  return null
}
