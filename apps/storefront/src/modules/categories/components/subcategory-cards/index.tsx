"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type SubcategoryCardsProps = {
  category: HttpTypes.StoreProductCategory
}

const SUBCATEGORY_CARDS_MAP: Record<
  string,
  { name: string; handle: string; icon?: string; count?: number }[]
> = {
  laptops: [
    {
      name: "Gaming Laptops",
      handle: "gaming-laptops",
      icon: "/gaming/gaming-laptops-card.png",
      count: 28,
    },
    {
      name: "Business & Office",
      handle: "office-laptops",
      icon: "/top-categories/laptops.png",
      count: 21,
    },
    {
      name: "MacBooks & Apple",
      handle: "macbooks",
      icon: "/top-brands/apple.png",
      count: 7,
    },
    {
      name: "Ultrabooks & 2-in-1",
      handle: "ultrabooks",
      icon: "/top-categories/laptops.png",
      count: 5,
    },
  ],
  monitors: [
    {
      name: "Gaming Monitors",
      handle: "gaming-monitors",
      icon: "/gaming/gaming-monitors-card.png",
      count: 2,
    },
    {
      name: "4K & Office Displays",
      handle: "office-monitors",
      icon: "/top-categories/monitors.png",
      count: 1,
    },
  ],
  "keyboard_-mouse": [
    {
      name: "Mechanical Keyboards",
      handle: "mechanical-keyboards",
      icon: "/top-categories/keyboards.png",
      count: 1,
    },
    {
      name: "Gaming Mice",
      handle: "gaming-mice",
      icon: "/top-categories/computer-mouse.png",
      count: 1,
    },
  ],
  "computer-accessories": [
    {
      name: "Laptop Bags & Sleeves",
      handle: "laptop-bags",
      icon: "/gaming/gaming-accessories-card.png",
      count: 1,
    },
    {
      name: "USB Hubs & Docks",
      handle: "usb-hubs",
      icon: "/top-categories/computer-mouse.png",
      count: 1,
    },
  ],
  headphones_mics: [
    {
      name: "Noise-Cancelling",
      handle: "noise-cancelling-headphones",
      icon: "/top-categories/headphones.png",
      count: 1,
    },
    {
      name: "Gaming Headsets",
      handle: "gaming-headsets",
      icon: "/top-categories/headphones.png",
      count: 1,
    },
  ],
  "smart-watches": [
    {
      name: "Fitness Trackers",
      handle: "fitness-trackers",
      icon: "/top-categories/smartwatches.png",
      count: 1,
    },
    {
      name: "GPS Smartwatches",
      handle: "gps-smartwatches",
      icon: "/top-categories/smartwatches.png",
      count: 1,
    },
  ],
}

export default function SubcategoryCards({ category }: SubcategoryCardsProps) {
  // If this is a subcategory, don't show the root category card grid
  if (category.parent_category_id || category.parent_category) {
    return null
  }

  const handleKey = category.handle?.toLowerCase() || ""
  const subcategories = SUBCATEGORY_CARDS_MAP[handleKey] || []

  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        {subcategories.map((sub, idx) => {
          return (
            <LocalizedClientLink
              key={idx}
              href={`/categories/${sub.handle}`}
              className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-black rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-all duration-200 shadow-2xs hover:shadow-sm"
            >
              {sub.icon && (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gray-50 rounded-lg p-1 flex items-center justify-center">
                  <Image
                    src={sub.icon}
                    alt={sub.name}
                    fill
                    sizes="48px"
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-xs sm:text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
                  {sub.name}
                </span>
                {sub.count && (
                  <span className="block text-[11px] text-[#7b91a8] font-normal mt-0.5">
                    {sub.count} Products
                  </span>
                )}
              </div>
            </LocalizedClientLink>
          )
        })}
      </div>
    </div>
  )
}
