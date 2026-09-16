"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { updateConsent } from "@lib/analytics/gtag"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if consent has already been given or declined
    const consent = localStorage.getItem("cookie-consent-accepted")
    if (consent === null) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-accepted", "true")
    updateConsent("granted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent-accepted", "false")
    updateConsent("denied")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94a7.5 7.5 0 1 1-8.453 8.453c0-.55.398-1.02.94-1.11.895-.149 1.56-.92 1.56-1.843 0-.923-.665-1.694-1.56-1.843a1.125 1.125 0 0 1-.94-1.11 7.5 7.5 0 0 1 8.453-8.453c.55 0 1.02.398 1.11.94.149.895.92 1.56 1.843 1.56.923 0 1.694-.665 1.843-1.56.09-.542.56-.94 1.11-.94a7.5 7.5 0 0 1 .987 14.935M8.25 9.75h.008v.008H8.25V9.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-4.5 3h.008v.008H8.25v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm6.75-4.5h.008v.008h-.008v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Cookie Settings
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          We use cookies to enhance your shopping experience, analyze site usage, and serve personalized offers. Learn more in our{" "}
          <LocalizedClientLink href="/cookies" className="underline hover:text-gray-900 font-semibold">
            Cookie Policy
          </LocalizedClientLink>
          . By clicking &quot;Accept&quot;, you consent to our use of cookies.
        </p>
      </div>

      <div className="flex gap-2 text-xs font-bold">
        <button
          onClick={handleAccept}
          className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-xl transition-colors shadow-sm"
        >
          Accept All
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
