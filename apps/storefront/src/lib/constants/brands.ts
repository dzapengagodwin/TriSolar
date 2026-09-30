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
    id: "brand_brother",
    name: "Brother",
    handle: "brother",
    logo: "/top-brands/brother.webp",
    description: "Brother printers, scanners, and office equipment for home and business.",
    website: "https://www.brother.com",
  },
  {
    id: "brand_hp",
    name: "HP",
    handle: "hp",
    logo: "/top-brands/hp.webp",
    description: "High-performance HP Spectre, Omen, Envy, and Pavilion laptops.",
    website: "https://www.hp.com",
  },
  {
    id: "brand_dell",
    name: "Dell",
    handle: "dell",
    logo: "/top-brands/dell.webp",
    description: "Dell XPS, Inspiron, Latitude, and Alienware computing power.",
    website: "https://www.dell.com",
  },
  {
    id: "brand_lenovo",
    name: "Lenovo",
    handle: "lenovo",
    logo: "/top-brands/lenovo.webp",
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
    id: "brand_canon",
    name: "Canon",
    handle: "canon",
    logo: "/top-brands/canon.webp",
    description: "Canon printers, cameras, and office equipment for home and business.",
    website: "https://www.canon.com",
  },
]
