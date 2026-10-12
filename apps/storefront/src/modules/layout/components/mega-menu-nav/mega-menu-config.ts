import { getCategoryPublicPath } from "@lib/seo/canonical"
export type MegaMenuBrand = {
  name: string
  href: string
  logo: string
}

export type MegaMenuItem = {
  label: string
  href: string
}

export type MegaMenuSection = {
  title: string
  items: MegaMenuItem[]
  viewAllHref?: string
}

export type MegaMenuPromo = {
  eyebrow: string
  title: string[]
  description: string
  href: string
  cta: string
  image: string
  gradient?: string
  darkText?: boolean
}

export type MegaMenuConfig = {
  id: string
  label: string
  directLinks?: MegaMenuItem[]
  sections: MegaMenuSection[]
  brands: MegaMenuBrand[]
  promo: MegaMenuPromo
}

// ---------------------------------------------------------------------------
// Centralized Brand Registry
// ---------------------------------------------------------------------------
export const MEGA_MENU_BRANDS: Record<string, MegaMenuBrand> = {
  asus: { name: "ASUS", href: "/brand/asus", logo: "/brands/asus.svg" },
  msi: { name: "MSI", href: "/brand/msi", logo: "/brands/msi.svg" },
  intel: { name: "Intel", href: "/brand/intel", logo: "/brands/intel.svg" },
  amd: { name: "AMD", href: "/brand/amd", logo: "/brands/amd.svg" },
  razer: { name: "Razer", href: "/brand/razer", logo: "/brands/razer.svg" },
  corsair: { name: "Corsair", href: "/brand/corsair", logo: "/brands/corsair.svg" },
  benq: { name: "BenQ", href: "/brand/benq", logo: "/brands/benq.svg" },
  hp: { name: "HP", href: "/brand/hp", logo: "/top-brands/hp.webp" },
  lenovo: { name: "Lenovo", href: "/brand/lenovo", logo: "/top-brands/lenovo.webp" },
  canon: { name: "Canon", href: "/brand/canon", logo: "/top-brands/canon.webp" },
  brother: { name: "Brother", href: "/brand/brother", logo: "/top-brands/brother.webp" },
  epson: { name: "Epson", href: "/brand/epson", logo: "/brands/epson.svg" },
  dell: { name: "Dell", href: "/brand/dell", logo: "/top-brands/dell.webp" },
  acer: { name: "Acer", href: "/brand/acer", logo: "/brands/acer.svg" },
  samsung: { name: "Samsung", href: "/brand/samsung", logo: "/brands/samsung.svg" },
  apple: { name: "Apple", href: "/brand/apple", logo: "/top-brands/apple.webp" },
  xiaomi: { name: "Xiaomi", href: "/brand/xiaomi", logo: "/brands/xiaomi.svg" },
  huawei: { name: "Huawei", href: "/brand/huawei", logo: "/brands/huawei.svg" },
  sony: { name: "Sony", href: "/brand/sony", logo: "/brands/sony.svg" },
  jbl: { name: "JBL", href: "/brand/jbl", logo: "/brands/jbl.svg" },
}

// ---------------------------------------------------------------------------
// Departments Mega Menu Configuration
// ---------------------------------------------------------------------------
export const MEGA_MENUS: MegaMenuConfig[] = [
  // 1. EXPLORE
  {
    id: "computers",
    label: "Explore",
    directLinks: [
      { label: "Laptops", href: getCategoryPublicPath("laptops") },
      { label: "Desktops", href: "/products/desktops" },
      { label: "Printers", href: "/products/printers_for_sale" },
      { label: "Phones & Tablets", href: "/products/cellphones-and-tablets/tablets" },
      { label: "Mobile Phones", href: "/products/cellphones-and-tablets/mobile-phones-zimbabwe" },
      { label: "Monitors", href: "/products/monitors" },
      { label: "Software", href: "/products/software" },
      { label: "Brands", href: "/brands" },
    ],
    sections: [
      {
        title: "Computer Components",
        viewAllHref: getCategoryPublicPath("pc-components"),
        items: [
          { label: "PC Components", href: getCategoryPublicPath("pc-components") },
          { label: "Internal SSDs", href: getCategoryPublicPath("internal-solid-state-drives") },
          { label: "Memory (RAM)", href: getCategoryPublicPath("memory-ram") },
          { label: "External Hard Drives", href: getCategoryPublicPath("external-hard-drives") },
          { label: "Drives & Storage", href: getCategoryPublicPath("drives-storage") },
        ],
      },
      {
        title: "Computer Accessories",
        viewAllHref: getCategoryPublicPath("computer-accessories"),
        items: [
          { label: "Keyboards & Mice", href: getCategoryPublicPath("keyboard_-mouse") },
          { label: "Webcams", href: getCategoryPublicPath("webcams") },
          { label: "Laptop Bags", href: getCategoryPublicPath("laptop-bags") },
          { label: "Docking Stations", href: getCategoryPublicPath("docking-stations") },
          { label: "Headphones & Mics", href: getCategoryPublicPath("headphones_mics") },
        ],
      },
      {
        title: "Desktops & Monitors",
        viewAllHref: getCategoryPublicPath("desktops"),
        items: [
          { label: "Desktop PCs", href: getCategoryPublicPath("desktop-pcs") },
          { label: "All in One PCs", href: getCategoryPublicPath("all-in-one-pc") },
          { label: "Mini PCs", href: getCategoryPublicPath("mini-pcs") },
          { label: "Monitors", href: getCategoryPublicPath("monitors") },
          { label: "Server Computers", href: getCategoryPublicPath("server-computers") },
        ],
      },
      {
        title: "Laptops & Portables",
        viewAllHref: getCategoryPublicPath("laptops"),
        items: [
          { label: "All Laptops", href: getCategoryPublicPath("laptops") },
          { label: "Gaming Laptops", href: getCategoryPublicPath("gaming-laptops") },
          { label: "Business Laptops", href: getCategoryPublicPath("business-laptops") },
          { label: "Apple MacBooks", href: getCategoryPublicPath("apple-laptops") },
          { label: "2-in-1 Touchscreen", href: getCategoryPublicPath("2-in-1-touch-screen") },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.asus,
      MEGA_MENU_BRANDS.msi,
      MEGA_MENU_BRANDS.intel,
      MEGA_MENU_BRANDS.amd,
      MEGA_MENU_BRANDS.razer,
      MEGA_MENU_BRANDS.corsair,
      MEGA_MENU_BRANDS.benq,
      MEGA_MENU_BRANDS.hp,
      MEGA_MENU_BRANDS.lenovo,
    ],
    promo: {
      eyebrow: "Special Offer",
      title: ["Computing", "Essentials"],
      description: "Upgrade your setup with top tier performance laptops and hardware.",
      href: getCategoryPublicPath("laptops"),
      cta: "Shop Catalog",
      image: "/hero-laptops.webp",
    },
  },
]

