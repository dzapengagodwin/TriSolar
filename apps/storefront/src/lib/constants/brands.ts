export type StoreBrand = {
  id: string
  name: string
  handle: string
  logo?: string | null
  image?: string | null
  description?: string | null
  website?: string | null
  products_count?: number
  total_products?: number
  product_ids?: string[]
  products?: unknown[]
  metadata?: Record<string, unknown> | null
}

export const STATIC_BRANDS: StoreBrand[] = [
  {
    id: "brand_apple",
    name: "Apple",
    handle: "apple",
    logo: "/top-brands/apple.png",
    description: "MacBook, iMac, iPad, and genuine Apple accessories.",
    website: "https://www.apple.com",
  },
  {
    id: "brand_hp",
    name: "HP",
    handle: "hp",
    logo: "/top-brands/hp.png",
    description: "High-performance HP Spectre, Omen, Envy, and Pavilion laptops.",
    website: "https://www.hp.com",
  },
  {
    id: "brand_dell",
    name: "Dell",
    handle: "dell",
    logo: "/top-brands/dell.png",
    description: "Dell XPS, Inspiron, Latitude, and Alienware computing power.",
    website: "https://www.dell.com",
  },
  {
    id: "brand_lenovo",
    name: "Lenovo",
    handle: "lenovo",
    logo: "/top-brands/lenovo.png",
    description: "ThinkPad, Legion, and IdeaPad devices engineered for endurance.",
    website: "https://www.lenovo.com",
  },
  {
    id: "brand_asus",
    name: "ASUS",
    handle: "asus",
    logo: "/brands/asus.svg",
    description: "ROG Strix, TUF Gaming, and ZenBook cutting-edge laptops.",
    website: "https://www.asus.com",
  },
  {
    id: "brand_amd",
    name: "AMD",
    handle: "amd",
    logo: "/brands/amd.svg",
    description: "Ryzen processors, Radeon graphics, and powerful computing hardware.",
    website: "https://www.amd.com",
  },
]
