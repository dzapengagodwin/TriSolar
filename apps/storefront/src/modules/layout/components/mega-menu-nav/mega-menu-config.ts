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
  hp: { name: "HP", href: "/brands/hp", logo: "/top-brands/hp.png" },
  lenovo: { name: "Lenovo", href: "/brands/lenovo", logo: "/top-brands/lenovo.png" },
  canon: { name: "Canon", href: "/brands/canon", logo: "/top-brands/canon.png" },
  brother: { name: "Brother", href: "/brands/brother", logo: "/top-brands/brother.png" },
  epson: { name: "Epson", href: "/brands/epson", logo: "/brands/epson.svg" },
  dell: { name: "Dell", href: "/brands/dell", logo: "/top-brands/dell.png" },
  acer: { name: "Acer", href: "/brands/acer", logo: "/brands/acer.svg" },
  samsung: { name: "Samsung", href: "/brands/samsung", logo: "/brands/samsung.svg" },
  apple: { name: "Apple", href: "/brands/apple", logo: "/top-brands/apple.png" },
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
      image: "/hero-laptops.png",
    },
  },

  // 2. OFFICE & BUSINESS
  {
    id: "office",
    label: "Office & Networking",
    sections: [
      {
        title: "Printing & Scanners",
        viewAllHref: "/categories/printers_for_sale",
        items: [
          { label: "All Printers", href: "/categories/printers_for_sale" },
          { label: "Laser Printers", href: "/categories/laser-printers-zimbabwe" },
          { label: "Inkjet & Tank Printers", href: "/categories/inkjet-printers" },
          { label: "Dot Matrix Printers", href: "/categories/dot-matrix-printers" },
          { label: "Label Printers", href: "/categories/label-printers" },
        ],
      },
      {
        title: "Inks & Consumables",
        viewAllHref: "/categories/toners",
        items: [
          { label: "Laser Toners", href: "/categories/toners" },
          { label: "Ink Cartridges", href: "/categories/cartridges" },
          { label: "Original Inks", href: "/categories/original-ink" },
          { label: "Office Stationery", href: "/categories/stationery" },
        ],
      },
      {
        title: "Networking",
        viewAllHref: "/categories/networking",
        items: [
          { label: "All Networking", href: "/categories/networking" },
          { label: "Modems & Routers", href: "/categories/modems-routers" },
          { label: "Network Switches", href: "/categories/switches" },
          { label: "Access Points & Extenders", href: "/categories/wifi-access-points-extenders" },
          { label: "Server Computers", href: "/categories/server-computers" },
        ],
      },
      {
        title: "Power & Software",
        viewAllHref: "/categories/power-solutions",
        items: [
          { label: "Power Solutions", href: "/categories/power-solutions" },
          { label: "UPS Battery Backup", href: "/categories/ups-uninterrupted-power-supply-backup" },
          { label: "Office Software", href: "/categories/software" },
          { label: "Antivirus & Security", href: "/categories/anti-virus" },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.hp,
      MEGA_MENU_BRANDS.canon,
      MEGA_MENU_BRANDS.brother,
      MEGA_MENU_BRANDS.epson,
      MEGA_MENU_BRANDS.asus,
      MEGA_MENU_BRANDS.dell,
      MEGA_MENU_BRANDS.lenovo,
      MEGA_MENU_BRANDS.acer,
      MEGA_MENU_BRANDS.samsung,
    ],
    promo: {
      eyebrow: "Office Deals",
      title: ["Printers", "& Scanners"],
      description: "High speed, wireless, and heavy duty printers engineered for business.",
      href: "/categories/printers_for_sale",
      cta: "Explore Printers",
      image: "/printer.png",
    },
  },

  // 3. MOBILES & TABLETS
  {
    id: "mobiles",
    label: "Mobiles & Tablets",
    sections: [
      {
        title: "Smartphones",
        viewAllHref: "/categories/mobile-phones-zimbabwe",
        items: [
          { label: "All Mobile Phones", href: "/categories/mobile-phones-zimbabwe" },
          { label: "Apple iPhone", href: "/brands/apple" },
          { label: "Samsung Galaxy", href: "/brands/samsung" },
          { label: "Xiaomi", href: "/brands/xiaomi" },
          { label: "Huawei", href: "/brands/huawei" },
        ],
      },
      {
        title: "Tablets & iPads",
        viewAllHref: "/categories/tablets",
        items: [
          { label: "All Tablets", href: "/categories/tablets" },
          { label: "Apple iPads", href: "/brands/apple" },
          { label: "Samsung Tabs", href: "/brands/samsung" },
          { label: "Cellphones & Tablets", href: "/categories/cellphones-and-tablets" },
        ],
      },
      {
        title: "Wearables",
        viewAllHref: "/categories/smart-watches",
        items: [
          { label: "Smartwatches", href: "/categories/smart-watches" },
          { label: "Apple Watches", href: "/brands/apple" },
          { label: "Samsung Watches", href: "/brands/samsung" },
          { label: "Fitness Trackers", href: "/categories/smart-watches" },
        ],
      },
      {
        title: "Mobile Accessories",
        viewAllHref: "/categories/mobile-accessories",
        items: [
          { label: "All Mobile Accessories", href: "/categories/mobile-accessories" },
          { label: "Headphones & Mics", href: "/categories/headphones_mics" },
          { label: "Power & Cables", href: "/categories/mobile-accessories" },
          { label: "Cases & Covers", href: "/categories/mobile-accessories" },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.apple,
      MEGA_MENU_BRANDS.samsung,
      MEGA_MENU_BRANDS.xiaomi,
      MEGA_MENU_BRANDS.huawei,
      MEGA_MENU_BRANDS.sony,
      MEGA_MENU_BRANDS.jbl,
      MEGA_MENU_BRANDS.lenovo,
      MEGA_MENU_BRANDS.asus,
      MEGA_MENU_BRANDS.hp,
    ],
    promo: {
      eyebrow: "Latest Flagships",
      title: ["Brand New", "Mobiles &", "Tablets"],
      description: "Authentic devices with 100% manufacturer warranty and guaranteed support.",
      href: "/categories/mobile-phones-zimbabwe",
      cta: "Shop Devices",
      image: "/hero-phone.png",
    },
  },

  // 4. ELECTRONICS & ENTERTAINMENT
  {
    id: "electronics",
    label: "Electronics",
    sections: [
      {
        title: "TV & Video",
        viewAllHref: "/categories/tv-audio",
        items: [
          { label: "Smart TVs & Audio", href: "/categories/tv-audio" },
          { label: "Home Audio & Soundbars", href: "/categories/tv-audio" },
          { label: "Streaming Devices", href: "/categories/tv-audio" },
          { label: "Projectors", href: "/categories/tv-audio" },
        ],
      },
      {
        title: "Gaming & Consoles",
        viewAllHref: "/categories/gaming",
        items: [
          { label: "Gaming Central", href: "/categories/gaming" },
          { label: "Consoles & Accessories", href: "/categories/gaming-consoles" },
          { label: "Gaming Laptops", href: "/categories/gaming-laptops" },
          { label: "Headphones & Audio", href: "/categories/headphones_mics" },
        ],
      },
      {
        title: "Cameras & Imaging",
        viewAllHref: "/categories/cameras-photography",
        items: [
          { label: "Cameras & Photography", href: "/categories/cameras-photography" },
          { label: "Digital Cameras", href: "/categories/digital-cameras" },
          { label: "Camera Lenses", href: "/categories/camera-lenses" },
          { label: "Webcams", href: "/categories/webcams" },
        ],
      },
      {
        title: "Audio & Security",
        viewAllHref: "/categories/video-surveillance",
        items: [
          { label: "Video Surveillance", href: "/categories/video-surveillance" },
          { label: "CCTV Cameras", href: "/categories/video-surveillance" },
          { label: "Headphones & Mics", href: "/categories/headphones_mics" },
          { label: "Smart Home Security", href: "/categories/video-surveillance" },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.sony,
      MEGA_MENU_BRANDS.jbl,
      MEGA_MENU_BRANDS.samsung,
      MEGA_MENU_BRANDS.apple,
      MEGA_MENU_BRANDS.benq,
      MEGA_MENU_BRANDS.dell,
      MEGA_MENU_BRANDS.hp,
      MEGA_MENU_BRANDS.asus,
      MEGA_MENU_BRANDS.xiaomi,
    ],
    promo: {
      eyebrow: "Smart Entertainment",
      title: ["Bigger", "Brighter", "Audio"],
      description: "Crystal clear 4K displays, home theater soundbars, and gaming gear.",
      href: "/categories/tv-audio",
      cta: "Shop Electronics",
      image: "/hero-monitor.png",
    },
  },
]
