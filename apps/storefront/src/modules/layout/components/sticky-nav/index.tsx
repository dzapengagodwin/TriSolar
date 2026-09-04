"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

const MOBILE_BREAKPOINT = 1024
const SCROLL_THRESHOLD = 64
const DIRECTION_THRESHOLD = 8

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
  const [navHeight, setNavHeight] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    if (!navRef.current) {
      return
    }

    const updateNavHeight = () => {
      setNavHeight(navRef.current?.offsetHeight ?? 0)
    }

    updateNavHeight()
    const resizeObserver = new ResizeObserver(updateNavHeight)

    resizeObserver.observe(navRef.current)

    const handleScroll = () => {
      if (ticking.current) {
        return
      }

      ticking.current = true
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT
        const scrollDelta = currentScrollY - lastScrollY.current

        if (!isMobile || currentScrollY <= SCROLL_THRESHOLD) {
          setIsSearchVisible(true)
        } else if (scrollDelta > DIRECTION_THRESHOLD) {
          setIsSearchVisible(false)
        } else if (scrollDelta < -DIRECTION_THRESHOLD) {
          setIsSearchVisible(true)
        }

        lastScrollY.current = currentScrollY
        ticking.current = false
      })
    }

    lastScrollY.current = window.scrollY
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={navRef}
        className="fixed top-0 inset-x-0 z-50 bg-white"
      >
      {announcement}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        {topRow}
        <div
          className={`small:hidden overflow-visible transition-[max-height,opacity,transform,margin] duration-300 ease-out ${
            isSearchVisible
              ? "max-h-24 opacity-100 translate-y-0 mt-2.5"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none mt-0"
          }`}
          aria-hidden={!isSearchVisible}
        >
          {mobileSearch}
        </div>
      </header>
      {desktopNavigation}
      </div>
      <div
        aria-hidden="true"
        className="h-[110px] small:h-[104px]"
        style={{ height: navHeight || undefined }}
      />
    </>
  )
}
