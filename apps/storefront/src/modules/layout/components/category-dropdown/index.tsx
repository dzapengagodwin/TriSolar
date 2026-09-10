"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BarsThree, ChevronDown } from "@medusajs/icons"

type CategoryDropdownProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

export default function CategoryDropdown({ categories = [] }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter out subcategories to get root level categories only
  const rootCategories = categories.filter(
    (c) => !c.parent_category_id && !c.parent_category
  )
  const displayCategories = rootCategories.length > 0 ? rootCategories : categories

  // Set first category active by default when opening
  useEffect(() => {
    if (isOpen && displayCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(displayCategories[0].id)
    }
  }, [isOpen, displayCategories, activeCategoryId])

  const activeCategory = displayCategories.find((c) => c.id === activeCategoryId)

  return (
    <div ref={dropdownRef} className="relative">
      {/* Category Toggle Button (Orange with Hamburger icon) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer relative z-50 shadow-sm ${
          isOpen
            ? "bg-black text-white"
            : "bg-black text-white hover:bg-gray rounded-b-xl"
        }`}
        aria-expanded={isOpen}
      >
        <BarsThree className="w-4 h-4 text-white" />
        <span>ALL CATEGORIES</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Multi-Tier Mega Menu Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full mt-1 left-0 w-[920px] bg-white border border-gray-100 shadow-2xl z-50 grid grid-cols-[220px_300px_1fr] min-h-[460px] overflow-hidden animate-fade-in"
          style={{ transformOrigin: "top left" }}
        >
       
          {/* Column 2: Main Categories (Hover to reveal column 3) */}
          <div className="border-r border-gray-100 py-4 max-h-[500px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            <div className="px-4 pb-2 border-b border-gray-50 mb-2">
              <h4 className="text-[11px] font-bold text-gray-400">All Products</h4>
            </div>
            {displayCategories.length > 0 ? (
              <ul className="space-y-0.5 px-2">
                {displayCategories.map((cat) => {
                  const isActive = activeCategoryId === cat.id
                  return (
                    <li key={cat.id}>
                      <button
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-gray-100 text-primary"
                            : "text-gray-700 hover:bg-gray-50 hover:text-black"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-colors ${
                            isActive ? "text-primary" : "text-gray-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                No categories found.
              </div>
            )}
          </div>

          {/* Column 3: Subcategories (Children of the active category) */}
          <div className="p-6 bg-white max-h-[500px] overflow-y-auto">
            {activeCategory ? (
              <div className="space-y-6">
                {/* Active Category Header */}
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">{activeCategory.name}</h3>
                </div>

                {/* Subcategories list */}
                <div className="grid grid-cols-1 gap-y-3">
                  {/* Real subcategories from DB if any */}
                  {activeCategory.category_children && activeCategory.category_children.length > 0 ? (
                    activeCategory.category_children.map((child) => (
                      <LocalizedClientLink
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-medium text-gray-600 hover:text-black transition-colors block"
                      >
                        {child.name}
                      </LocalizedClientLink>
                    ))
                  ) : (
                    <div className="text-xs font-medium text-gray-400">
                      No subcategories available.
                    </div>
                  )}
                </div>

                {/* Shop All link */}
                <div className="pt-4 border-t border-gray-50">
                  <LocalizedClientLink
                    href={`/categories/${activeCategory.handle}`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    <span>Shop all {activeCategory.name}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </LocalizedClientLink>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-12">
                Hover a category to view subcategories.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
