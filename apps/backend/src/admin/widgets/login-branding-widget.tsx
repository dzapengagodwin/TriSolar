import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Heading, Text } from "@medusajs/ui"
import { useState, useEffect, useRef } from "react"

type PublicBranding = {
  logo_url: string | null
  app_name: string
  welcome_title: string
  welcome_subtitle: string
}

const LoginBrandingWidget = () => {
  const [branding, setBranding] = useState<PublicBranding | null>(null)
  const [imgError, setImgError] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setImgError(false)
  }, [branding?.logo_url])

  useEffect(() => {
    let isMounted = true

    const fetchBranding = async () => {
      try {
        const res = await fetch("/admin/branding/public", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data) {
            setBranding(data)
            if (data.app_name) {
              document.title = `${data.app_name} | Sign In`
            }
          }
        }
      } catch (err) {
        console.error("Failed to load login branding:", err)
      }
    }

    fetchBranding()
    return () => {
      isMounted = false
    }
  }, [])

  // Safely hide default Medusa avatar and heading if custom branding is present
  const hasCustomBranding = Boolean(
    branding && (branding.logo_url || branding.welcome_title !== "Welcome to Medusa")
  )

  useEffect(() => {
    if (!hasCustomBranding) return

    const hideDefaultElements = () => {
      const container = widgetRef.current?.closest(".max-w-\\[280px\\]")
      if (!container) return

      // Find default AvatarBox
      const avatar = container.querySelector(
        ".bg-ui-button-neutral, [class*='h-[50px]']"
      ) as HTMLElement | null
      if (avatar) {
        avatar.style.display = "none"
      }

      // Find default heading container
      const headingContainer = container.querySelector(
        "div.mb-4.flex.flex-col.items-center"
      ) as HTMLElement | null
      if (headingContainer) {
        headingContainer.style.display = "none"
      }
    }

    hideDefaultElements()
    const timer = setTimeout(hideDefaultElements, 50)
    return () => clearTimeout(timer)
  }, [hasCustomBranding])

  if (!hasCustomBranding || !branding) {
    return <div ref={widgetRef} className="hidden" />
  }

  return (
    <div ref={widgetRef} className="flex w-full flex-col items-center">
      {/* Scoped CSS safeguard to prevent any flash of default avatar/heading */}
      <style>{`
        .max-w-\\[280px\\] > .bg-ui-button-neutral,
        .max-w-\\[280px\\] > .relative.mb-4,
        .max-w-\\[280px\\] > div.mb-4.flex.flex-col.items-center {
          display: none !important;
        }
      `}</style>

      {/* Custom Brand Logo */}
      {branding.logo_url && !imgError ? (
        <div className="mb-4 flex items-center justify-center max-h-20 w-full px-2">
          <img
            src={branding.logo_url}
            alt={branding.app_name || "Store Logo"}
            className="max-h-16 max-w-[240px] object-contain rounded-md"
            loading="eager"
            decoding="async"
            onError={(e) => {
              console.error("Failed to render branding logo:", branding.logo_url, e)
              setImgError(true)
            }}
          />
        </div>
      ) : (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ui-bg-base border border-ui-border-base shadow-sm font-semibold text-lg text-ui-fg-base">
          {(branding.app_name || "LZ").slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Custom Welcome Title & Subtitle */}
      <div className="mb-4 flex flex-col items-center text-center">
        <Heading className="text-center font-semibold text-lg text-ui-fg-base">
          {branding.welcome_title}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle text-center mt-1">
          {branding.welcome_subtitle}
        </Text>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBrandingWidget
