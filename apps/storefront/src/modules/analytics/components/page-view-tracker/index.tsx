"use client"

import { useEffect, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { pageview, GA_TRACKING_ID } from "@lib/analytics/gtag"

function PageViewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!GA_TRACKING_ID || !pathname) return

    const search = searchParams?.toString()
    const fullUrl = search ? `${pathname}?${search}` : pathname

    // Prevent duplicate consecutive events for the same URL
    if (lastTrackedUrlRef.current === fullUrl) {
      return
    }

    lastTrackedUrlRef.current = fullUrl
    pageview(fullUrl, typeof document !== "undefined" ? document.title : undefined)
  }, [pathname, searchParams])

  return null
}

export default function PageViewTracker() {
  if (!process.env.NEXT_PUBLIC_GA_ID) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  )
}

