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
  const [spacerHeight, setSpacerHeight] = useState<number | undefined>(undefined)
  const navRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const isSearchVisibleRef = useRef(true)

  useEffect(() => {
    isSearchVisibleRef.current = isSearchVisible
  }, [isSearchVisible])

  // Measure initial full navbar height only on mount and window resize
  useEffect(() => {
    const updateSpacerHeight = () => {
      if (navRef.current) {
        const fullHeight = navRef.current.offsetHeight
        if (fullHeight > 0) {
          setSpacerHeight(fullHeight)
        }
      }
    }

    updateSpacerHeight()
    window.addEventListener("resize", updateSpacerHeight, { passive: true })
    return () => window.removeEventListener("resize", updateSpacerHeight)
  }, [])

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      const scrollDelta = currentScrollY - lastScrollY.current

      // Desktop: always visible
      if (!isMobile) {
        if (!isSearchVisibleRef.current) {
          setIsSearchVisible(true)
        }
        lastScrollY.current = currentScrollY
        return
      }

      // Top of page: always visible
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
        {announcement}
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
        {desktopNavigation}
      </div>

      {/* Stable spacer to prevent layout shifts without continuous ResizeObserver loops */}
      <div
        aria-hidden="true"
        className="h-[110px] small:h-[104px]"
        style={{ height: spacerHeight || undefined }}
      />
    </>
  )
}
