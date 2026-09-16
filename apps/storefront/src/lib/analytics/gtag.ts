import { GA4ConsentMode, GA4EcommerceParameters } from "./types"

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Sends a page_view event to Google Analytics 4.
 */
export const pageview = (url: string, title?: string) => {
  if (typeof window === "undefined" || !GA_TRACKING_ID || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", "page_view", {
    page_location: url,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
  })
}

/**
 * Sends a generic or custom event to Google Analytics 4.
 */
export const event = (
  action: string,
  params?: GA4EcommerceParameters | Record<string, unknown>
) => {
  if (typeof window === "undefined" || !GA_TRACKING_ID || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", action, params)
}

/**
 * Updates Google Consent Mode v2 status based on user cookie preferences.
 */
export const updateConsent = (status: GA4ConsentMode) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return
  }

  window.gtag("consent", "update", {
    analytics_storage: status,
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
  })
}

/**
 * Reads existing cookie consent preference from localStorage.
 */
export const getStoredConsent = (): GA4ConsentMode | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const consent = localStorage.getItem("cookie-consent-accepted")
    if (consent === "true") return "granted"
    if (consent === "false") return "denied"
    return null
  } catch {
    return null
  }
}

