"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { MEGA_MENUS } from "./mega-menu-config"
import MegaMenuPromo from "./mega-menu-promo"

export default function MegaMenuNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuPanelId = "mega-menu-panel"

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(
    (id: string) => {
      clearCloseTimeout()
      setActiveMenu(id)
    },
    [clearCloseTimeout]
  )

  const handleMouseLeave = useCallback(() => {
    clearCloseTimeout()
    // 150ms buffer gives user time to move across nav items / into dropdown without flickering
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }, [clearCloseTimeout])

  const closeMenu = useCallback(() => {
    clearCloseTimeout()
    setActiveMenu(null)
  }, [clearCloseTimeout])

  // Close on click outside and on Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
      clearCloseTimeout()
    }
  }, [closeMenu, clearCloseTimeout])

  const handleFocusOut = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      closeMenu()
    }
  }

  const activeConfig = MEGA_MENUS.find((m) => m.id === activeMenu)

  return (
    <nav
      ref={navRef}
      aria-label="Department navigation"
      onMouseLeave={handleMouseLeave}
      onMouseEnter={clearCloseTimeout}
      onBlur={handleFocusOut}
      className="flex items-center gap-0.5 font-bold text-xs"
    >
      {/* Dynamic Department Tabs */}
      {MEGA_MENUS.map((menu) => {
        const isOpen = activeMenu === menu.id

        return (
          <button
            key={menu.id}
            type="button"
            onMouseEnter={() => handleMouseEnter(menu.id)}
            onClick={() => {
              clearCloseTimeout()
              setActiveMenu(isOpen ? null : menu.id)
            }}
            aria-expanded={isOpen}
            aria-controls={menuPanelId}
            className="px-3.5 py-2 text-white transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1 font-black cursor-pointer hover:bg-gray-800"
          >
            <span>{menu.label}</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        )
      })}

      {/* Hot Deals Link */}
      <LocalizedClientLink
        href="/store"
        onClick={closeMenu}
        className="flex items-center gap-1.5 text-primary hover:text-primary-hover hover:bg-gray-800 px-3.5 py-2 transition-colors uppercase tracking-wider text-[11px] font-black ml-1"
      >
        <span>Hot Deals</span>
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 22c4 0 7-2.8 7-6.5 0-2.8-1.7-5-4.2-6.5.3 2.1-1 3.5-2.3 4.2.2-3.4-1.5-6.5-4.5-9.2.2 3.2-1.6 5.4-2.6 7.2C4.5 12.7 5 15 5 15.5 5 19.2 8 22 12 22Z"
          />
        </svg>
      </LocalizedClientLink>

      {/* Unified Data-Driven Mega Dropdown Panel */}
      {activeConfig && (
        <div
          id={menuPanelId}
          onMouseEnter={clearCloseTimeout}
          className="absolute top-full left-0 right-0 w-full bg-white border border-gray-200 shadow-2xl z-50 p-6 overflow-hidden animate-fade-in text-gray-900"
          style={{ transformOrigin: "top left" }}
        >
          {/* 4 Category Columns + 1 Promo Card (Total 12 cols) */}
          <div className="grid grid-cols-12 gap-6 pb-6 border-b border-gray-100">
            {activeConfig.sections.map((section, idx) => (
              <div
                key={idx}
                className="col-span-12 sm:col-span-6 lg:col-span-2 space-y-3"
              >
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-xs font-medium text-gray-600">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <LocalizedClientLink
                        href={item.href}
                        onClick={closeMenu}
                        className="hover:text-primary transition-colors block"
                      >
                        {item.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  {section.viewAllHref && (
                    <li className="pt-1">
                      <LocalizedClientLink
                        href={section.viewAllHref}
                        onClick={closeMenu}
                        className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors block"
                      >
                        View All &rarr;
                      </LocalizedClientLink>
                    </li>
                  )}
                </ul>
              </div>
            ))}

            {/* Reusable Promotional Merchandising Banner */}
            <MegaMenuPromo promo={activeConfig.promo} onClose={closeMenu} />
          </div>

          {/* Department Brand Carousel / Row */}
          <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between gap-3 overflow-x-auto">
            {activeConfig.brands.map((brand) => (
              <LocalizedClientLink
                key={brand.name}
                href={brand.href}
                onClick={closeMenu}
                title={brand.name}
                className="group relative flex items-center justify-center p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 shrink-0"
              >
                <div className="relative w-16 h-7 sm:w-20 sm:h-8 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="80px"
                    className="object-contain object-center opacity-100 group-hover:scale-110 transition-all duration-200"
                  />
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
