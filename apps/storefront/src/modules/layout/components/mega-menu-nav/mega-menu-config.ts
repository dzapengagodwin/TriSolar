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
  sections: MegaMenuSection[]
  brands: MegaMenuBrand[]
  promo: MegaMenuPromo
}

// ---------------------------------------------------------------------------
// Centralized Brand Registry
// ---------------------------------------------------------------------------
export const MEGA_MENU_BRANDS: Record<string, MegaMenuBrand> = {
  asus: { name: "ASUS", href: "/brands/asus", logo: "/brands/asus.svg" },
  msi: { name: "MSI", href: "/brands/msi", logo: "/brands/msi.svg" },
  intel: { name: "Intel", href: "/brands/intel", logo: "/brands/intel.svg" },
  amd: { name: "AMD", href: "/brands/amd", logo: "/brands/amd.svg" },
  razer: { name: "Razer", href: "/brands/razer", logo: "/brands/razer.svg" },
  corsair: { name: "Corsair", href: "/brands/corsair", logo: "/brands/corsair.svg" },
  benq: { name: "BenQ", href: "/brands/benq", logo: "/brands/benq.svg" },
  hp: { name: "HP", href: "/brands/hp", logo: "/top-brands/hp.webp" },
  lenovo: { name: "Lenovo", href: "/brands/lenovo", logo: "/top-brands/lenovo.webp" },
  canon: { name: "Canon", href: "/brands/canon", logo: "/top-brands/canon.webp" },
  brother: { name: "Brother", href: "/brands/brother", logo: "/top-brands/brother.webp" },
  epson: { name: "Epson", href: "/brands/epson", logo: "/brands/epson.svg" },
  dell: { name: "Dell", href: "/brands/dell", logo: "/top-brands/dell.webp" },
  acer: { name: "Acer", href: "/brands/acer", logo: "/brands/acer.svg" },
  samsung: { name: "Samsung", href: "/brands/samsung", logo: "/brands/samsung.svg" },
  apple: { name: "Apple", href: "/brands/apple", logo: "/top-brands/apple.webp" },
  xiaomi: { name: "Xiaomi", href: "/brands/xiaomi", logo: "/brands/xiaomi.svg" },
  huawei: { name: "Huawei", href: "/brands/huawei", logo: "/brands/huawei.svg" },
  sony: { name: "Sony", href: "/brands/sony", logo: "/brands/sony.svg" },
  jbl: { name: "JBL", href: "/brands/jbl", logo: "/brands/jbl.svg" },
}

// ---------------------------------------------------------------------------
// Departments Mega Menu Configuration
// ---------------------------------------------------------------------------
export const MEGA_MENUS: MegaMenuConfig[] = [
  // 1. COMPUTERS & LAPTOPS
  {
    id: "computers",
    label: "Computers & Laptops",
    sections: [
      {
        title: "Computer Components",
        viewAllHref: "/categories/pc-components",
        items: [
          { label: "PC Components", href: "/categories/pc-components" },
          { label: "Internal SSDs", href: "/categories/internal-solid-state-drives" },
          { label: "Memory (RAM)", href: "/categories/memory-ram" },
          { label: "External Hard Drives", href: "/categories/external-hard-drives" },
          { label: "Drives & Storage", href: "/categories/drives-storage" },
        ],
      },
      {
        title: "Computer Accessories",
        viewAllHref: "/categories/computer-accessories",
        items: [
          { label: "Keyboards & Mice", href: "/categories/keyboard_-mouse" },
          { label: "Webcams", href: "/categories/webcams" },
          { label: "Laptop Bags", href: "/categories/laptop-bags" },
          { label: "Docking Stations", href: "/categories/docking-stations" },
          { label: "Headphones & Mics", href: "/categories/headphones_mics" },
        ],
      },
      {
        title: "Desktops & Monitors",
        viewAllHref: "/categories/desktops",
        items: [
          { label: "Desktop PCs", href: "/categories/desktop-pcs" },
          { label: "All in One PCs", href: "/categories/all-in-one-pc" },
          { label: "Mini PCs", href: "/categories/mini-pcs" },
          { label: "Monitors", href: "/categories/monitors" },
          { label: "Server Computers", href: "/categories/server-computers" },
        ],
      },
      {
        title: "Laptops & Portables",
        viewAllHref: "/categories/laptops",
        items: [
          { label: "All Laptops", href: "/categories/laptops" },
          { label: "Gaming Laptops", href: "/categories/gaming-laptops" },
          { label: "Business Laptops", href: "/categories/business-laptops" },
          { label: "Apple MacBooks", href: "/categories/apple-laptops" },
          { label: "2-in-1 Touchscreen", href: "/categories/2-in-1-touch-screen" },
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
      href: "/categories/laptops",
      cta: "Shop Catalog",
      image: "/hero-laptops.webp",
    },
  },
]

