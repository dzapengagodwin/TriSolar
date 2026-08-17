"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BarsThree, ChevronDown } from "@medusajs/icons"

type CategoryDropdownProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

// Subcategories fallback map if categories don't have children in DB yet
const FALLBACK_SUBCATEGORIES: Record<string, string[]> = {
  laptops: ["Gaming Laptops", "Office Laptops", "MacBooks & iPads", "Refurbished Tech"],
  desktops: ["Custom Gaming Towers", "All-in-One PCs", "Mini PCs", "Workstation PCs"],
  printers: ["Laser Printers", "Inkjet Printers", "3D Printers", "Toner & Cartridges"],
  accessories: ["Keyboards & Mice", "USB Cables & Hubs", "Laptop Backpacks", "External SSDs"],
  audio: ["Wireless Headphones", "Gaming Headsets", "Bluetooth Speakers", "Studio Mics"],
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
        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative z-50 shadow-sm ${
          isOpen
            ? "bg-[#FF9F0D] text-white"
            : "bg-[#FF9F0D] text-white hover:bg-[#E58B00] rounded-b-xl"
        }`}
        aria-expanded={isOpen}
      >
        <BarsThree className="w-4 h-4 text-white" />
        <span>All Categories</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Multi-Tier Mega Menu Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 w-[920px] bg-white border border-gray-100 rounded-b-3xl rounded-tr-3xl shadow-2xl z-50 grid grid-cols-[220px_300px_1fr] min-h-[460px] overflow-hidden animate-fade-in"
          style={{ transformOrigin: "top left" }}
        >
          {/* Column 1: Custom Tools & Links */}
          <div className="bg-gray-50/70 border-r border-gray-100 p-5 flex flex-col justify-between text-xs text-gray-700">
            <div className="space-y-6">
              {/* Quick Links Group */}
              <div className="space-y-2.5">
                <LocalizedClientLink
                  href="/store"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-bold text-gray-800 hover:text-black transition-colors"
                >
                  <svg className="w-4 h-4 text-[#FF9F0D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Smart Tech Deals</span>
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/store"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-bold text-gray-800 hover:text-black transition-colors"
                >
                  <svg className="w-4 h-4 text-[#FF9F0D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Clearance Sales</span>
                </LocalizedClientLink>
              </div>

              {/* Trending Section */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Trending</h4>
                <ul className="space-y-1.5 font-bold text-gray-600">
                  <li>
                    <LocalizedClientLink href="/store?q=gaming" onClick={() => setIsOpen(false)} className="hover:text-black transition-colors">
                      Gaming Zone
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/store" onClick={() => setIsOpen(false)} className="hover:text-black transition-colors flex items-center gap-1.5">
                      <span>Today&apos;s Deal</span>
                      <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90">Hot</span>
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>

              {/* Shopping Tools Section */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Shopping Tools</h4>
                <ul className="space-y-2 font-bold text-gray-600">
                  <li>
                    <LocalizedClientLink href="/store" onClick={() => setIsOpen(false)} className="hover:text-black transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Custom PC Builders</span>
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/account" onClick={() => setIsOpen(false)} className="hover:text-black transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Track Order</span>
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Support Info */}
            <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Laptop Zone Support
            </div>
          </div>

          {/* Column 2: Main Categories (Hover to reveal column 3) */}
          <div className="border-r border-gray-100 py-4 max-h-[500px] overflow-y-auto">
            <div className="px-4 pb-2 border-b border-gray-50 mb-2">
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">All Products</h4>
            </div>
            {displayCategories.length > 0 ? (
              <ul className="space-y-0.5 px-2">
                {displayCategories.map((cat) => {
                  const isActive = activeCategoryId === cat.id
                  return (
                    <li key={cat.id}>
                      <button
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-left uppercase tracking-wider cursor-pointer ${
                          isActive
                            ? "bg-gray-100 text-[#FF9F0D]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-black"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-colors ${
                            isActive ? "text-[#FF9F0D]" : "text-gray-300"
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
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{activeCategory.name}</h3>
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
                        className="text-xs font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-wider block"
                      >
                        {child.name}
                      </LocalizedClientLink>
                    ))
                  ) : (
                    /* Fallback subcategories list if DB has no children */
                    (FALLBACK_SUBCATEGORIES[activeCategory.handle ? activeCategory.handle.toLowerCase() : ""] || []).map((subName, idx) => (
                      <LocalizedClientLink
                        key={idx}
                        href={`/store?q=${encodeURIComponent(subName)}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-gray-500 hover:text-[#FF9F0D] transition-colors uppercase tracking-wider block"
                      >
                        {subName}
                      </LocalizedClientLink>
                    ))
                  )}
                </div>

                {/* Shop All link */}
                <div className="pt-4 border-t border-gray-50">
                  <LocalizedClientLink
                    href={`/categories/${activeCategory.handle}`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF9F0D] hover:text-[#E58B00] uppercase tracking-wider"
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
