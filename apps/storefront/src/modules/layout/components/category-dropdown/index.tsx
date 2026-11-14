"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BarsThree, ChevronDown } from "@medusajs/icons"
import { getCategoryPublicPath } from "@lib/seo/canonical"

type CategoryDropdownProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

export default function CategoryDropdown({ categories = [] }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const rootCategories = categories.filter(
    (c) => !c.parent_category_id && !c.parent_category
  )
  const displayCategories = rootCategories.length > 0 ? rootCategories : categories

  useEffect(() => {
    if (isOpen && displayCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(displayCategories[0].id)
    }
  }, [isOpen, displayCategories, activeCategoryId])

  const activeCategory = displayCategories.find((c) => c.id === activeCategoryId)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer relative z-50 tracking-wider uppercase ${
          isOpen
            ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
            : "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
        }`}
        aria-expanded={isOpen}
      >
        <BarsThree className="w-4 h-4 text-white" />
        <span>Categories</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-2 left-0 w-[640px] bg-white border border-slate-200 shadow-2xl rounded-xl z-50 grid grid-cols-[240px_1fr] min-h-[360px] overflow-hidden animate-fade-in text-slate-900"
          style={{ transformOrigin: "top left" }}
        >
          {/* Column 1: Main Category List */}
          <div className="border-r border-slate-100 py-3 bg-slate-50/50 max-h-[460px] overflow-y-auto">
            <div className="px-3 pb-2 border-b border-slate-200/60 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Departments
              </span>
            </div>
            <ul className="space-y-0.5 px-2">
              {displayCategories.map((cat) => {
                const isActive = activeCategoryId === cat.id
                return (
                  <li key={cat.id}>
                    <button
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-slate-300 ml-1 text-xs">&rsaquo;</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Column 2: Subcategories & Direct Action */}
          <div className="p-5 bg-white max-h-[460px] overflow-y-auto flex flex-col justify-between">
            {activeCategory ? (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{activeCategory.name}</span>
                  <LocalizedClientLink
                    href={getCategoryPublicPath(activeCategory.handle)}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All &rarr;
                  </LocalizedClientLink>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {activeCategory.category_children && activeCategory.category_children.length > 0 ? (
                    activeCategory.category_children.map((child) => (
                      <LocalizedClientLink
                        key={child.id}
                        href={getCategoryPublicPath(child.handle)}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all py-1 px-1.5 rounded hover:bg-blue-50/50 block"
                      >
                        {child.name}
                      </LocalizedClientLink>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-4 italic">
                      Explore all products in this category directly.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10">
                Hover a category to explore.
              </div>
            )}

            <div className="pt-3 border-t border-slate-100">
              <LocalizedClientLink
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Browse Full Catalog &rarr;
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
