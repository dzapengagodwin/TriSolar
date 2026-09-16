"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

const MOBILE_BREAKPOINT = 1024
const SCROLL_MIN_THRESHOLD = 70
const DIRECTION_THRESHOLD = 10

type StickyNavProps = {
  announcement: ReactNode
  topRow: ReactNode
  mobileSearch: ReactNode
  desktopNavigation: ReactNode
}

export default function StickyNav({
  announcement,
  topRow,
  mobileSearch,
  desktopNavigation,
}: StickyNavProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(true)
  const [isDesktopScrolled, setIsDesktopScrolled] = useState(false)
  const [spacerHeight, setSpacerHeight] = useState<number | undefined>(undefined)
  const navRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const isSearchVisibleRef = useRef(true)
  const isDesktopScrolledRef = useRef(false)

  useEffect(() => {
    isSearchVisibleRef.current = isSearchVisible
  }, [isSearchVisible])

  useEffect(() => {
    isDesktopScrolledRef.current = isDesktopScrolled
  }, [isDesktopScrolled])

  // Measure initial full navbar height only on mount and window resize
  useEffect(() => {
    const updateSpacerHeight = () => {
      if (navRef.current) {
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile) {
          const mobileHeight = navRef.current.offsetHeight
          if (mobileHeight > 0) {
            setSpacerHeight(mobileHeight)
          }
        } else {
          // On desktop, only update spacer height when at the top to preserve full uncollapsed height
          if (window.scrollY <= SCROLL_MIN_THRESHOLD) {
            const fullHeight = navRef.current.offsetHeight
            if (fullHeight > 0) {
              setSpacerHeight(fullHeight)
            }
          }
        }
      }
    }

    updateSpacerHeight()
    window.addEventListener("resize", updateSpacerHeight, { passive: true })
    return () => window.removeEventListener("resize", updateSpacerHeight)
  }, [])

  useEffect(() => {
    lastScrollY.current = window.scrollY

    // Check initial scroll position on mount
    if (window.scrollY > SCROLL_MIN_THRESHOLD) {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setIsDesktopScrolled(true)
      } else {
        setIsSearchVisible(false)
      }
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      const scrollDelta = currentScrollY - lastScrollY.current

      // Desktop: hide announcement and Row 3 when scrolled past threshold
      if (!isMobile) {
        const shouldCollapse = currentScrollY > SCROLL_MIN_THRESHOLD
        if (shouldCollapse !== isDesktopScrolledRef.current) {
          setIsDesktopScrolled(shouldCollapse)
        }
        lastScrollY.current = currentScrollY
        return
      }

      // Mobile: Top of page: always visible
      if (currentScrollY <= SCROLL_MIN_THRESHOLD) {
        if (!isSearchVisibleRef.current) {
          setIsSearchVisible(true)
        }
      } else if (scrollDelta > DIRECTION_THRESHOLD) {
        // Scrolling DOWN
        if (isSearchVisibleRef.current) {
          setIsSearchVisible(false)
        }
      } else if (scrollDelta < -DIRECTION_THRESHOLD) {
        // Scrolling UP
        if (!isSearchVisibleRef.current) {
          setIsSearchVisible(true)
        }
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <div ref={navRef} className="fixed top-0 inset-x-0 z-50 bg-white shadow-2xs">
        {/* Row 1: Announcement (Desktop: collapses on scroll) */}
        <div
          className={`hidden small:block transition-[max-height,opacity] duration-300 ease-in-out ${
            isDesktopScrolled
              ? "max-h-0 opacity-0 overflow-hidden pointer-events-none"
              : "max-h-12 opacity-100 overflow-hidden"
          }`}
          aria-hidden={isDesktopScrolled}
        >
          {announcement}
        </div>

        {/* Row 2: Main Search & Icons Header (Always sticky) */}
        <div>
          {topRow}
          <div
            className={`small:hidden transition-[max-height,opacity,margin] duration-300 ease-in-out overflow-hidden ${
              isSearchVisible
                ? "max-h-24 opacity-100 my-1.5"
                : "max-h-0 opacity-0 my-0 pointer-events-none"
            }`}
            aria-hidden={!isSearchVisible}
          >
            {mobileSearch}
          </div>
        </div>

        {/* Row 3: Sub-Navigation Bar with Category Dropdown and Mega Menu (Desktop: collapses on scroll) */}
        <div
          className={`hidden small:block transition-[max-height,opacity] duration-300 ease-in-out ${
            isDesktopScrolled
              ? "max-h-0 opacity-0 overflow-hidden pointer-events-none"
              : "max-h-16 opacity-100 overflow-visible"
          }`}
          aria-hidden={isDesktopScrolled}
        >
          {desktopNavigation}
        </div>
      </div>

      {/* Stable spacer to prevent layout shifts without continuous ResizeObserver loops */}
      <div
        aria-hidden="true"
        className="h-[110px] small:h-[138px]"
        style={{ height: spacerHeight || undefined }}
      />
    </>
  )
}
