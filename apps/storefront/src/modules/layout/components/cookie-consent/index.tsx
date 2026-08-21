"use client"

import { useState, useEffect } from "react"

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
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent-accepted", "false")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
          <span>🍪</span> Cookie Settings
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          We use cookies to enhance your shopping experience, analyze site usage, and serve personalized offers. By clicking &quot;Accept&quot;, you consent to our use of cookies.
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
