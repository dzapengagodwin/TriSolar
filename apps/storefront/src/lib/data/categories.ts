import { HttpTypes } from "@medusajs/types"

export const STATIC_CATEGORIES: HttpTypes.StoreProductCategory[] = [
  {
    id: "pcat_01M07CFV5PGYF341ZA9N3CDWFD",
    name: "Laptops & Notebooks",
    handle: "laptops",
    description: "High-performance laptops, ultrabooks, and mobile workstations.",
    is_active: true,
    is_internal: false,
    rank: 0,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T08:12:58.476Z",
    updated_at: "2026-08-18T12:04:49.718Z",
    metadata: {
      image: "/top-categories/laptops.png",
    },
  },
  {
    id: "pcat_01M07CFV6KMVM6NRX96F6D0JV8",
    name: "Monitors & Displays",
    handle: "monitors",
    description: "Ultra-wide, 4K, and high refresh-rate monitors.",
    is_active: true,
    is_internal: false,
    rank: 1,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T08:12:58.476Z",
    updated_at: "2026-08-18T12:04:49.716Z",
    metadata: {
      image: "/top-categories/monitors.png",
    },
  },
  {
    id: "pcat_01M07CFV5KBN6T6P44FK1CEVY6",
    name: "Keyboards & Typing",
    handle: "keyboard_-mouse",
    description: "Mechanical and ergonomic keyboards.",
    is_active: true,
    is_internal: false,
    rank: 2,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T08:12:58.476Z",
    updated_at: "2026-08-18T12:04:49.718Z",
    metadata: {
      image: "/top-categories/keyboards.png",
    },
  },
  {
    id: "pcat_01M07TRXN4V3RE8R54Z0MSFZMH",
    name: "Computer Mice & Accessories",
    handle: "computer-accessories",
    description: "Precision wireless and ergonomic gaming and office mice.",
    is_active: true,
    is_internal: false,
    rank: 3,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T12:22:35.953Z",
    updated_at: "2026-08-18T12:04:49.716Z",
    metadata: {
      image: "/top-categories/computer-mouse.png",
    },
  },
  {
    id: "pcat_01M07CFV5D2EVX2QEA9M2S4CHZ",
    name: "Headphones & Audio",
    handle: "headphones_mics",
    description: "Noise-cancelling headsets, audio gear, and studio monitors.",
    is_active: true,
    is_internal: false,
    rank: 4,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T08:12:58.476Z",
    updated_at: "2026-08-18T12:04:49.718Z",
    metadata: {
      image: "/top-categories/headphones.png",
    },
  },
  {
    id: "pcat_01M07CFV6RKMJJFQFY6E6SP2MM",
    name: "Smart Watches & Wearables",
    handle: "smart-watches",
    description: "Fitness trackers, smartwatches, and connected wearable tech.",
    is_active: true,
    is_internal: false,
    rank: 5,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    created_at: "2026-08-17T08:12:58.476Z",
    updated_at: "2026-08-18T12:04:49.718Z",
    metadata: {
      image: "/top-categories/smartwatches.png",
    },
  },
]

export const listCategories = async (
  _query?: Record<string, unknown>
): Promise<HttpTypes.StoreProductCategory[]> => {
  return STATIC_CATEGORIES
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory | null> => {
  const handle = categoryHandle.join("/").toLowerCase()
  const found = STATIC_CATEGORIES.find(
    (c) =>
      c.handle.toLowerCase() === handle ||
      c.handle.toLowerCase() === handle.replace(/_/g, "-") ||
      c.id.toLowerCase() === handle
  )
  return found || null
}
