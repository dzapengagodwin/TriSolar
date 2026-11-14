import { getCategoryPublicPath } from "@lib/seo/canonical"

export type MegaMenuBrand = {
  name: string
  href: string
  logo: string
}

export type MegaMenuItem = {
  label: string
  href: string
  badge?: string
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
  badge?: string
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
// Centralized Brand Registry (Networking & High-Tech Brands)
// ---------------------------------------------------------------------------
export const MEGA_MENU_BRANDS: Record<string, MegaMenuBrand> = {
  cisco: { name: "Cisco", href: "/brands/cisco", logo: "/brands/intel.svg" },
  ubiquiti: { name: "Ubiquiti", href: "/brands/ubiquiti", logo: "/brands/asus.svg" },
  mikrotik: { name: "MikroTik", href: "/brands/mikrotik", logo: "/brands/msi.svg" },
  lenovo: { name: "Lenovo", href: "/brands/lenovo", logo: "/brands/lenovo.svg" },
  dell: { name: "Dell", href: "/brands/dell", logo: "/brands/dell.svg" },
  hp: { name: "HP", href: "/brands/hp", logo: "/brands/hp.svg" },
  apple: { name: "Apple", href: "/brands/apple", logo: "/brands/apple.svg" },
  asus: { name: "ASUS", href: "/brands/asus", logo: "/brands/asus.svg" },
  msi: { name: "MSI", href: "/brands/msi", logo: "/brands/msi.svg" },
  intel: { name: "Intel", href: "/brands/intel", logo: "/brands/intel.svg" },
  amd: { name: "AMD", href: "/brands/amd", logo: "/brands/amd.svg" },
  synology: { name: "Synology", href: "/brands/synology", logo: "/brands/samsung.svg" },
  corsair: { name: "Corsair", href: "/brands/corsair", logo: "/brands/corsair.svg" },
  razer: { name: "Razer", href: "/brands/razer", logo: "/brands/razer.svg" },
  acer: { name: "Acer", href: "/brands/acer", logo: "/brands/acer.svg" },
  sony: { name: "Sony", href: "/brands/sony", logo: "/brands/sony.svg" },
}

// ---------------------------------------------------------------------------
// Departments Mega Menu Configuration
// ---------------------------------------------------------------------------
export const MEGA_MENUS: MegaMenuConfig[] = [
  // 1. NETWORKING
  {
    id: "networking",
    label: "Networking",
    directLinks: [
      { label: "Switches", href: "/products/networking" },
      { label: "Routers", href: "/products/networking" },
      { label: "WiFi 7 APs", href: "/products/networking" },
      { label: "Racks & Cables", href: "/products/networking" },
    ],
    sections: [
      {
        title: "Managed & PoE Switches",
        viewAllHref: "/products/networking",
        items: [
          { label: "Gigabit Managed Switches", href: "/products/networking" },
          { label: "PoE+ & PoE++ (up to 90W)", href: "/products/networking" },
          { label: "10G / 25G SFP28 Aggregation", href: "/products/networking" },
          { label: "Layer 3 Enterprise Switches", href: "/products/networking" },
          { label: "Industrial DIN-Rail Switches", href: "/products/networking" },
        ],
      },
      {
        title: "Routers & Security Gateways",
        viewAllHref: "/products/networking",
        items: [
          { label: "Multi-WAN Security Routers", href: "/products/networking" },
          { label: "Next-Gen Firewalls (NGFW)", href: "/products/networking" },
          { label: "Enterprise VPN & SD-WAN", href: "/products/networking" },
          { label: "Core Edge Gateways", href: "/products/networking" },
          { label: "Failover 5G/LTE Gateways", href: "/products/networking" },
        ],
      },
      {
        title: "Wireless & Access Points",
        viewAllHref: "/products/networking",
        items: [
          { label: "WiFi 7 Tri-Band APs", href: "/products/networking" },
          { label: "WiFi 6E High-Density APs", href: "/products/networking" },
          { label: "Outdoor Long-Range APs", href: "/products/networking" },
          { label: "Point-to-Point Wireless Bridges", href: "/products/networking" },
          { label: "Hardware & Cloud Controllers", href: "/products/networking" },
        ],
      },
      {
        title: "Racks, Fiber & Cabling",
        viewAllHref: "/products/networking",
        items: [
          { label: "19\" Server Racks & Cabinets (12U-42U)", href: "/products/networking" },
          { label: "Cat6A / Cat7 Shielded Patch Leads", href: "/products/networking" },
          { label: "10G/40G SFP+ DAC & Fiber Transceivers", href: "/products/networking" },
          { label: "High-Density Patch Panels & Keystone", href: "/products/networking" },
          { label: "Managed Rackmount PDUs & UPS", href: "/products/networking" },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.ubiquiti,
      MEGA_MENU_BRANDS.cisco,
      MEGA_MENU_BRANDS.mikrotik,
      MEGA_MENU_BRANDS.synology,
      MEGA_MENU_BRANDS.dell,
      MEGA_MENU_BRANDS.hp,
    ],
    promo: {
      eyebrow: "Next-Gen Infrastructure",
      title: ["Enterprise", "Networking"],
      description: "Deploy ultra-low latency 10GbE switches, WiFi 7 APs and multi-gig security gateways.",
      href: "/products/networking",
      cta: "Explore Networking",
      image: "/top-categories/networking.webp",
      badge: "WiFi 7 Ready",
    },
  },

  // 2. LAPTOPS
  {
    id: "laptops",
    label: "Laptops",
    directLinks: [
      { label: "Business Laptops", href: getCategoryPublicPath("business-laptops") },
      { label: "Workstations", href: getCategoryPublicPath("laptops") },
      { label: "MacBooks", href: getCategoryPublicPath("apple-laptops") },
      { label: "Gaming Rigs", href: getCategoryPublicPath("gaming-laptops") },
    ],
    sections: [
      {
        title: "Enterprise & Business Laptops",
        viewAllHref: getCategoryPublicPath("business-laptops"),
        items: [
          { label: "Lenovo ThinkPad (X1, T, E Series)", href: getCategoryPublicPath("business-laptops") },
          { label: "Dell Latitude & XPS Executive", href: getCategoryPublicPath("business-laptops") },
          { label: "HP EliteBook & ProBook", href: getCategoryPublicPath("business-laptops") },
          { label: "MIL-STD 810H Rugged Laptops", href: getCategoryPublicPath("business-laptops") },
          { label: "Intel Core Ultra AI-Powered Laptops", href: getCategoryPublicPath("business-laptops") },
        ],
      },
      {
        title: "Mobile Workstations & Creator",
        viewAllHref: getCategoryPublicPath("laptops"),
        items: [
          { label: "Dell Precision Mobile Workstations", href: getCategoryPublicPath("laptops") },
          { label: "Lenovo ThinkPad P-Series Workstations", href: getCategoryPublicPath("laptops") },
          { label: "HP ZBook Fury & Studio", href: getCategoryPublicPath("laptops") },
          { label: "Apple MacBook Pro (M3 / M4 Pro/Max)", href: getCategoryPublicPath("apple-laptops") },
          { label: "NVIDIA RTX Ada Professional Rigs", href: getCategoryPublicPath("laptops") },
        ],
      },
      {
        title: "High-Performance & Gaming",
        viewAllHref: getCategoryPublicPath("gaming-laptops"),
        items: [
          { label: "ASUS ROG Zephyrus & Strix", href: getCategoryPublicPath("gaming-laptops") },
          { label: "Lenovo Legion Pro Series", href: getCategoryPublicPath("gaming-laptops") },
          { label: "HP Omen & Victus Gaming", href: getCategoryPublicPath("gaming-laptops") },
          { label: "MSI Stealth, Titan & Raider", href: getCategoryPublicPath("gaming-laptops") },
          { label: "OLED 240Hz High Refresh Displays", href: getCategoryPublicPath("gaming-laptops") },
        ],
      },
      {
        title: "Workstation Docks & Peripherals",
        viewAllHref: getCategoryPublicPath("computer-accessories"),
        items: [
          { label: "Thunderbolt 4 / USB4 Quad-Display Docks", href: getCategoryPublicPath("docking-stations") },
          { label: "Ultra-Wide & 4K Color-Accurate Monitors", href: getCategoryPublicPath("monitors") },
          { label: "Ergonomic Mechanical Keyboards & Mice", href: getCategoryPublicPath("keyboard_-mouse") },
          { label: "Fast NVMe External Backup Drives", href: getCategoryPublicPath("external-hard-drives") },
          { label: "Heavy-Duty Ballistic Laptop Bags", href: getCategoryPublicPath("laptop-bags") },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.lenovo,
      MEGA_MENU_BRANDS.dell,
      MEGA_MENU_BRANDS.apple,
      MEGA_MENU_BRANDS.hp,
      MEGA_MENU_BRANDS.asus,
      MEGA_MENU_BRANDS.msi,
    ],
    promo: {
      eyebrow: "Engineering & Executive Grade",
      title: ["Pro Workstations", "& Ultrabooks"],
      description: "Equip your engineers, developers, and executives with high-reliability computing power.",
      href: getCategoryPublicPath("laptops"),
      cta: "Shop Laptops",
      image: "/top-categories/laptops.webp",
      badge: "AI Ready",
    },
  },

  // 3. SERVERS & STORAGE
  {
    id: "servers-solutions",
    label: "Servers",
    directLinks: [
      { label: "Rack Servers", href: getCategoryPublicPath("server-computers") },
      { label: "Enterprise NAS", href: getCategoryPublicPath("drives-storage") },
      { label: "IT Solutions", href: "/it-solutions" },
      { label: "Request Quote", href: "/it-solutions#request-quote" },
    ],
    sections: [
      {
        title: "Enterprise Servers",
        viewAllHref: getCategoryPublicPath("server-computers"),
        items: [
          { label: "1U & 2U High-Density Rack Servers", href: getCategoryPublicPath("server-computers") },
          { label: "Dual Intel Xeon & AMD EPYC Systems", href: getCategoryPublicPath("server-computers") },
          { label: "Tower Servers for Small Offices", href: getCategoryPublicPath("server-computers") },
          { label: "Hot-Swap Power & Redundant PSUs", href: getCategoryPublicPath("server-computers") },
          { label: "ECC Registered Server Memory", href: getCategoryPublicPath("memory-ram") },
        ],
      },
      {
        title: "Storage & Backup (NAS/SAN)",
        viewAllHref: getCategoryPublicPath("drives-storage"),
        items: [
          { label: "Synology RackStation & DiskStation", href: getCategoryPublicPath("drives-storage") },
          { label: "QNAP Enterprise NAS & Storage Arrays", href: getCategoryPublicPath("drives-storage") },
          { label: "Enterprise NVMe U.2/U.3 Solid State", href: getCategoryPublicPath("internal-solid-state-drives") },
          { label: "High-Capacity 24TB Datacenter HDDs", href: getCategoryPublicPath("external-hard-drives") },
          { label: "RAID Controllers & Storage Expansions", href: getCategoryPublicPath("drives-storage") },
        ],
      },
      {
        title: "IT Engineering & Deployment",
        viewAllHref: "/it-solutions",
        items: [
          { label: "Structured Cabling & Fiber Splicing", href: "/it-solutions" },
          { label: "Wireless RF Site Surveys & Optimization", href: "/it-solutions" },
          { label: "Server Room Setup & Rack Commissioning", href: "/it-solutions" },
          { label: "Enterprise Firewall & VLAN Security", href: "/it-solutions" },
          { label: "Corporate Hardware Leasing & Fleet", href: "/it-solutions" },
        ],
      },
      {
        title: "Corporate & B2B Procurement",
        viewAllHref: "/it-solutions#request-quote",
        items: [
          { label: "Volume Discount Pricing (RFQ)", href: "/it-solutions#request-quote" },
          { label: "Bill of Materials (BOM) Quoting", href: "/it-solutions#request-quote" },
          { label: "Corporate Credit Account Facilities", href: "/contact-us" },
          { label: "Dedicated B2B IT Account Manager", href: "/contact-us" },
          { label: "Next-Business-Day Hardware RMA", href: "/warranty" },
        ],
      },
    ],
    brands: [
      MEGA_MENU_BRANDS.dell,
      MEGA_MENU_BRANDS.hp,
      MEGA_MENU_BRANDS.intel,
      MEGA_MENU_BRANDS.amd,
      MEGA_MENU_BRANDS.synology,
      MEGA_MENU_BRANDS.cisco,
    ],
    promo: {
      eyebrow: "Turnkey Turnkey Infrastructure",
      title: ["Enterprise IT", "Engineering"],
      description: "From single rack installs to campus-wide networks, our certified engineers deliver turnkey solutions.",
      href: "/it-solutions",
      cta: "Explore Solutions",
      image: "/top-categories/software.webp",
      badge: "ISO Certified",
    },
  },
]
