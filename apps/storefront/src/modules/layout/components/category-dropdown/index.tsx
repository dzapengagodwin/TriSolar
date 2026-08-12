"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BarsThree, ChevronDown } from "@medusajs/icons"

type CategoryDropdownProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

// Sample subcategories fallback map if categories don't have children in DB yet
const FALLBACK_SUBCATEGORIES: Record<string, string[]> = {
  furniture: [
    "Executive Chairs",
    "Executive Desks",
    "Filing Cabinets",
    "Standard Chairs",
    "Standard Desks",
    "White Boards",
  ],
  electronics: [
    "Laptops & Computers",
    "Smartphones & Tablets",
    "Audio & Headphones",
    "TV & Home Theatre",
    "Cameras & Accessories",
  ],
  fashion: [
    "Men's Clothing",
    "Women's Clothing",
    "Footwear & Sneakers",
    "Bags & Backpacks",
    "Watches & Accessories",
  ],
  merch: ["Hoodies & Sweatshirts", "T-Shirts & Tops", "Caps & Accessories"],
  pants: ["Jeans", "Trousers", "Shorts", "Joggers"],
  shirts: ["Casual Shirts", "Formal Shirts", "Polo Shirts"],
  sweatshirts: ["Hoodies", "Crewnecks", "Zip-Up Sweatshirts"],
  laptops: ["Gaming Laptops", "Ultrabooks", "MacBooks", "Workstations"],
}

export default function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleCategoryAccordion = (catId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))
  }

  // Get root categories (or fallback to all)
  const rootCategories = categories?.filter(
    (c) => !c.parent_category_id && !c.parent_category
  )
  const displayCategories =
    rootCategories && rootCategories.length > 0 ? rootCategories : categories || []

  return (
    <div ref={dropdownRef} className="relative">
      {/* Browse Categories Pill Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full flex items-center gap-2 cursor-pointer transition-colors text-xs font-bold shadow-sm"
        aria-expanded={isOpen}
      >
        <BarsThree className="w-4 h-4 text-white" />
        <span>Browse Categories</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Style Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in max-h-[480px] overflow-y-auto">
          {displayCategories && displayCategories.length > 0 ? (
            displayCategories.map((cat) => {
              const handleKey = cat.handle ? cat.handle.toLowerCase() : ""
              const children = cat.category_children || []

              // Get subcategories (from Medusa DB or fallback map)
              const fallbackSubs = FALLBACK_SUBCATEGORIES[handleKey] || []
              const hasSubcategories = children.length > 0 || fallbackSubs.length > 0
              const isExpanded = !!expandedCategories[cat.id]

              return (
                <div key={cat.id} className="border-b border-gray-50 last:border-0">
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <LocalizedClientLink
                      href={`/categories/${cat.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-bold text-gray-900 hover:text-black flex-1 truncate"
                    >
                      {cat.name}
                    </LocalizedClientLink>

                    {/* Accordion Caret Button */}
                    {hasSubcategories && (
                      <button
                        onClick={(e) => toggleCategoryAccordion(cat.id, e)}
                        className="p-1 text-gray-500 hover:text-black rounded hover:bg-gray-200/60 transition-colors"
                        aria-label={`Toggle subcategories for ${cat.name}`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-black" : "text-gray-500"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Inline Accordion Subcategories List */}
                  {hasSubcategories && isExpanded && (
                    <div className="bg-gray-50/80 border-t border-gray-100 py-1.5 px-4 space-y-1">
                      {children.length > 0
                        ? children.map((child) => (
                            <LocalizedClientLink
                              key={child.id}
                              href={`/categories/${child.handle}`}
                              onClick={() => setIsOpen(false)}
                              className="block py-1.5 pl-3 text-xs font-medium text-gray-600 hover:text-black hover:font-semibold transition-colors"
                            >
                              {child.name}
                            </LocalizedClientLink>
                          ))
                        : fallbackSubs.map((subName, idx) => {
                            return (
                              <LocalizedClientLink
                                key={idx}
                                href={`/store?q=${encodeURIComponent(subName)}`}
                                onClick={() => setIsOpen(false)}
                                className="block py-1.5 pl-3 text-xs font-medium text-gray-600 hover:text-black hover:font-semibold transition-colors"
                              >
                                {subName}
                              </LocalizedClientLink>
                            )
                          })}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-4 py-3 text-xs text-gray-500 text-center">
              No categories available
            </div>
          )}
        </div>
      )}
    </div>
  )
}
