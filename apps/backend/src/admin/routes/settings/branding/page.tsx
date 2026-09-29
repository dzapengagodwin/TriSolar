import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Swatch, ArrowUpTray, Trash, ArrowPath } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Badge,
  toast,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useRef } from "react"

const BrandingSettingsPage = () => {
  const [logoUrl, setLogoUrl] = useState("")
  const [appName, setAppName] = useState("")
  const [welcomeTitle, setWelcomeTitle] = useState("")
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/admin/branding", {
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (res.ok) {
        const data = await res.json()
        const branding = data.branding || {}
        setLogoUrl(branding.logo_url || "")
        setAppName(branding.app_name || "LaptopZone")
        setWelcomeTitle(branding.welcome_title || `Welcome to ${branding.app_name || "LaptopZone"}`)
        setWelcomeSubtitle(branding.welcome_subtitle || "Sign in to access your admin dashboard")
      }
    } catch (err: any) {
      toast.error("Failed to load branding settings", {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  const saveBrandingData = async (overrides?: {
    logo_url?: string | null
    app_name?: string
    welcome_title?: string | null
    welcome_subtitle?: string | null
  }) => {
    setSaving(true)
    try {
      const payload = {
        logo_url: overrides && "logo_url" in overrides
          ? overrides.logo_url
          : (logoUrl.trim() || null),
        app_name: overrides && "app_name" in overrides
          ? overrides.app_name
          : (appName.trim() || "LaptopZone"),
        welcome_title: overrides && "welcome_title" in overrides
          ? overrides.welcome_title
          : (welcomeTitle.trim() || `Welcome to ${appName.trim() || "LaptopZone"}`),
        welcome_subtitle: overrides && "welcome_subtitle" in overrides
          ? overrides.welcome_subtitle
          : (welcomeSubtitle.trim() || "Sign in to access your admin dashboard"),
      }

      const res = await fetch("/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || "Failed to save branding")
      }

      const data = await res.json()
      if (data.branding) {
        setLogoUrl(data.branding.logo_url || "")
        setAppName(data.branding.app_name || "")
        setWelcomeTitle(data.branding.welcome_title || "")
        setWelcomeSubtitle(data.branding.welcome_subtitle || "")
      }

      toast.success("Branding Saved", {
        description: "Login page logo, welcome app name, and admin header updated.",
      })
      return data.branding
    } catch (err: any) {
      toast.error("Save Failed", { description: err.message })
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)

      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to upload image")
      }

      const data = await res.json()
      const uploadedUrl = data.files?.[0]?.url
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl)
        // Automatically persist the uploaded logo immediately
        await saveBrandingData({ logo_url: uploadedUrl })
      }
    } catch (err: any) {
      toast.error("Upload Failed", { description: err.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSave = async () => {
    await saveBrandingData()
  }

  const handleRemoveLogo = async () => {
    setLogoUrl("")
    await saveBrandingData({ logo_url: null })
  }

  const handleResetDefaults = () => {
    setLogoUrl("")
    setAppName("LaptopZone")
    setWelcomeTitle("Welcome to LaptopZone")
    setWelcomeSubtitle("Sign in to access your admin dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-ui-fg-subtle gap-2">
        <ArrowPath className="w-5 h-5 animate-spin" />
        Loading branding settings...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base">
              <Swatch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h1" className="text-xl font-semibold">
                  Admin Branding & Sign-in Customization
                </Heading>
                <Badge color="blue" size="small">
                  Customization
                </Badge>
              </div>
              <Text size="small" className="text-ui-fg-subtle mt-0.5">
                Configure your custom brand logo for the login page, welcome headline, and admin store name.
              </Text>
            </div>
          </div>

          <Button
            variant="primary"
            size="small"
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </Container>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-y-4">
          {/* 1. Logo Configuration Card */}
          <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-4">
            <div>
              <Heading level="h2" className="text-base font-semibold">
                Backend Sign-in Logo
              </Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Displays on the login page above the sign-in form. Supports PNG, JPG, WebP, or SVG.
              </Text>
            </div>

            {/* Logo Preview and Actions */}
            <div className="flex items-center gap-4 p-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg">
              <div className="w-20 h-20 bg-ui-bg-base border border-ui-border-base rounded-lg flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-xs text-ui-fg-muted font-medium">
                    Default Avatar
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                  >
                    <ArrowUpTray className="w-4 h-4 mr-1.5" />
                    Upload Image
                  </Button>
                  {logoUrl && (
                    <Button
                      variant="transparent"
                      size="small"
                      className="text-ui-fg-error hover:text-ui-fg-error-hover"
                      onClick={handleRemoveLogo}
                      disabled={saving}
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                <Text size="xsmall" className="text-ui-fg-muted">
                  Recommended size: 200x60px transparent PNG or SVG.
                </Text>
              </div>
            </div>

            {/* Direct URL input */}
            <div className="space-y-1.5">
              <Label size="small" className="font-medium text-ui-fg-base">
                Or Enter Logo Image URL
              </Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
          </Container>

          {/* 2. Welcome Messaging Card */}
          <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-4">
            <div>
              <Heading level="h2" className="text-base font-semibold">
                Welcome App Name & Headlines
              </Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Controls the welcome greetings on the sign-in screen and the admin header title.
              </Text>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label size="small" className="font-medium text-ui-fg-base">
                  Admin App / Store Name
                </Label>
                <Input
                  placeholder="e.g. LaptopZone"
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value)
                    if (welcomeTitle.startsWith("Welcome to")) {
                      setWelcomeTitle(`Welcome to ${e.target.value}`)
                    }
                  }}
                />
                <Text size="xsmall" className="text-ui-fg-muted">
                  Updates the store name shown in the top-left admin sidebar dropdown.
                </Text>
              </div>

              <div className="space-y-1.5">
                <Label size="small" className="font-medium text-ui-fg-base">
                  Sign-in Page Welcome Title
                </Label>
                <Input
                  placeholder="e.g. Welcome to LaptopZone"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                />
                <Text size="xsmall" className="text-ui-fg-muted">
                  Replaces the default "Welcome to Medusa" heading on the login screen.
                </Text>
              </div>

              <div className="space-y-1.5">
                <Label size="small" className="font-medium text-ui-fg-base">
                  Sign-in Page Subtitle / Hint
                </Label>
                <Input
                  placeholder="e.g. Sign in to access your admin dashboard"
                  value={welcomeSubtitle}
                  onChange={(e) => setWelcomeSubtitle(e.target.value)}
                />
                <Text size="xsmall" className="text-ui-fg-muted">
                  Replaces the default "Sign in to access the account area" subtext.
                </Text>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-ui-border-base">
              <Button
                variant="secondary"
                size="small"
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSave}
                isLoading={saving}
              >
                Save Changes
              </Button>
            </div>
          </Container>
        </div>

        {/* Right: Real-time Live Login Screen Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-y-4">
          <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <div>
                <Heading level="h2" className="text-base font-semibold">
                  Live Sign-in Preview
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Simulated preview of the login screen.
                </Text>
              </div>
              <Badge color="green" size="small">
                Live Preview
              </Badge>
            </div>

            {/* Simulated Login Modal Container */}
            <div className="p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl flex flex-col items-center shadow-xs">
              <div className="w-full max-w-[260px] flex flex-col items-center">
                {/* Custom Logo or Default Avatar */}
                {logoUrl ? (
                  <div className="mb-4 flex items-center justify-center max-h-16 w-full">
                    <img
                      src={logoUrl}
                      alt={appName || "Brand Logo"}
                      className="max-h-14 max-w-[200px] object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ui-bg-base border border-ui-border-base shadow-sm font-semibold text-lg text-ui-fg-base">
                    {(appName || "LZ").slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Welcome Heading */}
                <div className="mb-5 flex flex-col items-center text-center">
                  <h3 className="text-base font-semibold text-ui-fg-base leading-snug">
                    {welcomeTitle || `Welcome to ${appName || "LaptopZone"}`}
                  </h3>
                  <p className="text-xs text-ui-fg-subtle mt-1 leading-normal">
                    {welcomeSubtitle || "Sign in to access your admin dashboard"}
                  </p>
                </div>

                {/* Mocked Input Fields */}
                <div className="w-full flex flex-col gap-y-3 opacity-60 pointer-events-none">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-ui-fg-subtle">Email</span>
                    <div className="h-8 w-full bg-ui-bg-base border border-ui-border-base rounded-md px-2.5 flex items-center text-xs text-ui-fg-muted">
                      admin@laptopzone.co.zw
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-ui-fg-subtle">Password</span>
                    <div className="h-8 w-full bg-ui-bg-base border border-ui-border-base rounded-md px-2.5 flex items-center text-xs text-ui-fg-muted">
                      ••••••••••••
                    </div>
                  </div>
                  <div className="h-8 w-full bg-ui-bg-interactive rounded-md flex items-center justify-center text-xs font-medium text-white mt-1 shadow-xs">
                    Continue with Email
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base text-xs text-ui-fg-subtle">
              <span className="font-semibold text-ui-fg-base">Tip: </span>
              Changes take effect immediately on <code className="text-ui-fg-interactive font-mono">/app/login</code> and the admin sidebar dropdown once saved.
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Branding",
  icon: Swatch,
})

export default BrandingSettingsPage
