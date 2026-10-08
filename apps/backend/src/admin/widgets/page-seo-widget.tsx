// SEO widget for static pages (home, about, faq, etc.)
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Checkbox,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type PageSeoWidgetProps = {
  data: {
    id: string
    title?: string
    handle?: string
    // other page fields you might need
  }
}

type SeoState = {
  meta_title: string
  meta_description: string
  focus_keyphrase: string
  canonical_url: string
  og_title: string
  og_description: string
  og_image: string
  robots_index: boolean
  robots_follow: boolean
}

const PageSeoWidget = ({ data }: PageSeoWidgetProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [showAllChecks, setShowAllChecks] = useState(false)
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop")

  const [form, setForm] = useState<SeoState>({
    meta_title: "",
    meta_description: "",
    focus_keyphrase: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    robots_index: true,
    robots_follow: true,
  })

  const [defaults, setDefaults] = useState<Partial<SeoState>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // ---------------------------------------------------------------------------
  // Fetch SEO data for the page
  // ---------------------------------------------------------------------------
  const fetchSeoData = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/seo/pages/${data.handle || data.id}`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        const seo = json.seo || {}
        const def = json.defaults || {}
        setDefaults(def)
        setForm({
          meta_title: seo.meta_title ?? def.meta_title ?? "",
          meta_description: seo.meta_description ?? def.meta_description ?? "",
          focus_keyphrase: seo.focus_keyphrase ?? def.focus_keyphrase ?? "",
          canonical_url: seo.canonical_url ?? def.canonical_url ?? "",
          og_title: seo.og_title ?? def.og_title ?? "",
          og_description: seo.og_description ?? def.og_description ?? "",
          og_image: seo.og_image ?? def.og_image ?? "",
          robots_index: seo.robots_index !== undefined ? seo.robots_index : true,
          robots_follow: seo.robots_follow !== undefined ? seo.robots_follow : true,
        })
        setHasUnsavedChanges(false)
      } else {
        toast.error("Failed to load page SEO data")
      }
    } catch (err) {
      console.error("Error loading page SEO:", err)
      toast.error("Failed to load page SEO data")
    } finally {
      setLoading(false)
    }
  }, [data?.id])

  useEffect(() => {
    fetchSeoData()
  }, [fetchSeoData])

  const handleFieldChange = (field: keyof SeoState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleResetToDefaults = () => {
    setForm({
      meta_title: defaults.meta_title || data.title || "",
      meta_description: defaults.meta_description || "",
      focus_keyphrase: defaults.focus_keyphrase || data.title || "",
      canonical_url: defaults.canonical_url || "",
      og_title: defaults.og_title || defaults.meta_title || "",
      og_description: defaults.og_description || defaults.meta_description || "",
      og_image: defaults.og_image || "",
      robots_index: true,
      robots_follow: true,
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!data?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/seo/pages/${data.handle || data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Page SEO saved successfully")
        setHasUnsavedChanges(false)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || "Failed to save page SEO")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to save page SEO")
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Live preview helpers (similar to product widget)
  // ---------------------------------------------------------------------------
  const previewTitle = form.meta_title || defaults.meta_title || data.title || "Page Title"
  const previewSlug = data.handle || "page-slug"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    "Brief description of this page for search engines."

  const titleLength = form.meta_title.length
  const descLength = form.meta_description.length

  // Simple checklist – you can extend as needed
  const checks = useMemo(() => {
    const list: Array<{ id: string; title: string; status: string; message: string }> = []
    if (previewSlug && !previewSlug.includes(" ")) {
      list.push({ id: "slug", title: "Slug valid", status: "pass", message: "Slug looks good" })
    } else {
      list.push({ id: "slug", title: "Slug valid", status: "fail", message: "Slug missing or contains spaces" })
    }
    if (titleLength >= 30 && titleLength <= 60) {
      list.push({ id: "title_len", title: "Title length", status: "pass", message: `${titleLength} characters` })
    } else {
      list.push({ id: "title_len", title: "Title length", status: "warn", message: `${titleLength} characters` })
    }
    if (descLength >= 110 && descLength <= 160) {
      list.push({ id: "desc_len", title: "Description length", status: "pass", message: `${descLength} characters` })
    } else {
      list.push({ id: "desc_len", title: "Description length", status: "warn", message: `${descLength} characters` })
    }
    return list
  }, [previewSlug, titleLength, descLength])

  const score = Math.round(
    (checks.filter((c) => c.status === "pass").length / checks.length) * 100
  )
  const scoreColor = score >= 80 ? "green" : score >= 60 ? "orange" : "red"

  // ---------------------------------------------------------------------------
  // Render UI
  // ---------------------------------------------------------------------------
  return (
    <Container className="divide-y divide-ui-border-base p-0 overflow-hidden shadow-xs border border-ui-border-base rounded-xl bg-ui-bg-base mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-interactive flex items-center justify-center font-medium text-xs">
            SEO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2">Page SEO & Search Snippet</Heading>
              {hasUnsavedChanges && (
                <Badge color="orange" size="small">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <Text className="text-xs text-ui-fg-subtle mt-0.5">
              Manage meta tags, Open Graph data and indexing for this page.
            </Text>
          </div>
        </div>
        <Badge color={scoreColor} size="small">
          SEO Score: {score} / 100
        </Badge>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-ui-fg-muted">Loading page SEO…</div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Checklist */}
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-ui-fg-base">Readiness:</span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {checks.filter((c) => c.status === "pass").length} Passed
                </span>
                {checks.some((c) => c.status === "warn") && (
                  <span className="text-amber-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    {checks.filter((c) => c.status === "warn").length} Warnings
                  </span>
                )}
                {checks.some((c) => c.status === "fail") && (
                  <span className="text-rose-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {checks.filter((c) => c.status === "fail").length} Critical
                  </span>
                )}
              </div>
              <Button variant="transparent" size="small" onClick={() => setShowAllChecks(!showAllChecks)} className="text-xs text-ui-fg-interactive">
                {showAllChecks ? "Hide Checklist" : "View Checklist Details"}
              </Button>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-ui-bg-component rounded-full h-2 overflow-hidden">
              <div
                className={clx(
                  "h-2 transition-all duration-300 rounded-full",
                  score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${Math.max(5, score)}%` }}
              />
            </div>
            {/* Detailed list */}
            {showAllChecks && (
              <div className="pt-3 border-t border-ui-border-base space-y-2 max-h-64 overflow-y-auto pr-1">
                {checks.map((c) => (
                  <div
                    key={c.id}
                    className={clx(
                      "flex items-start justify-between p-2 rounded-lg text-xs",
                      c.status === "pass"
                        ? "bg-emerald-50/50 text-emerald-900"
                        : c.status === "warn"
                        ? "bg-amber-50/60 text-amber-900"
                        : "bg-rose-50/60 text-rose-900"
                    )}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-medium">
                        <span>{c.title}</span>
                      </div>
                      <p className="text-[11px] opacity-85">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google snippet preview */}
          <div className="border border-ui-border-base rounded-xl p-4 bg-ui-bg-base space-y-3">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-2">
              <Text size="xsmall" weight="plus" className="uppercase tracking-wider text-ui-fg-subtle">
                Google Search Snippet Preview
              </Text>
              <div className="flex items-center gap-1 bg-ui-bg-subtle p-0.5 rounded-lg border border-ui-border-base">
                <Button type="button" variant={previewTab === "desktop" ? "secondary" : "transparent"} size="small" onClick={() => setPreviewTab("desktop")} className="text-xs">
                  Desktop View
                </Button>
                <Button type="button" variant={previewTab === "mobile" ? "secondary" : "transparent"} size="small" onClick={() => setPreviewTab("mobile")} className="text-xs">
                  Mobile View
                </Button>
              </div>
            </div>
            <div className={clx("p-3 rounded-lg bg-ui-bg-subtle border border-ui-border-base font-sans", previewTab === "mobile" ? "max-w-xs" : "w-full")}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-ui-fg-interactive flex items-center justify-center text-[9px] text-white font-medium">
                  LZ
                </div>
                <div className="text-[11px] text-ui-fg-subtle leading-tight">
                  <span className="font-medium text-ui-fg-base">Laptopzone</span>
                  <span className="text-ui-fg-muted mx-1">›</span>
                  <span className="text-ui-fg-muted text-[10px]">pages › {previewSlug}</span>
                </div>
              </div>
              <div className="text-ui-fg-interactive hover:underline text-sm sm:text-base font-medium leading-snug cursor-pointer line-clamp-1">
                {previewTitle}
              </div>
              <div className="text-xs text-ui-fg-subtle mt-1 leading-relaxed line-clamp-2">{previewDesc}</div>
            </div>
          </div>

          {/* Input fields */}
          <div className="space-y-4">
            {/* Focus Keyphrase */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Focus Keyphrase</Label>
                <Text size="xsmall" className="text-ui-fg-muted">
                  Primary search term to rank for
                </Text>
              </div>
              <Input
                placeholder="e.g. Laptopzone About Page"
                value={form.focus_keyphrase}
                onChange={(e) => handleFieldChange("focus_keyphrase", e.target.value)}
              />
            </div>
            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">SEO Meta Title</Label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={clx("font-medium", titleLength >= 30 && titleLength <= 60 ? "text-emerald-600" : titleLength > 60 ? "text-amber-600" : "text-ui-fg-muted")}>
                    {titleLength} / 60 characters
                  </span>
                </div>
              </div>
              <Input
                placeholder="Custom title tag for Google"
                value={form.meta_title}
                onChange={(e) => handleFieldChange("meta_title", e.target.value)}
              />
            </div>
            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Meta Description</Label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={clx("font-medium", descLength >= 110 && descLength <= 160 ? "text-emerald-600" : descLength > 160 ? "text-amber-600" : "text-ui-fg-muted")}>
                    {descLength} / 160 characters
                  </span>
                </div>
              </div>
              <Textarea
                rows={3}
                placeholder="Brief summary for search results…"
                value={form.meta_description}
                onChange={(e) => handleFieldChange("meta_description", e.target.value)}
              />
            </div>
            {/* Canonical URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Canonical URL</Label>
                <Text size="xsmall" className="text-ui-fg-muted">
                  Optional override (default is auto)
                </Text>
              </div>
              <Input
                placeholder="https://laptopzone.co.zw/about"
                value={form.canonical_url}
                onChange={(e) => handleFieldChange("canonical_url", e.target.value)}
              />
            </div>
            {/* Robots configuration */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-ui-fg-base">
                <Checkbox checked={form.robots_index} onCheckedChange={(c) => handleFieldChange("robots_index", !!c)} />
                <span>Allow Search Engines to Index (Index)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-ui-fg-base">
                <Checkbox checked={form.robots_follow} onCheckedChange={(c) => handleFieldChange("robots_follow", !!c)} />
                <span>Follow Links on this Page (Follow)</span>
              </label>
            </div>
            {/* Social overrides */}
            <div className="pt-2">
              <Button variant="transparent" size="small" onClick={() => setShowSocial(!showSocial)} className="text-xs text-ui-fg-interactive flex items-center gap-1.5">
                <span>{showSocial ? "▲ Hide" : "▼ Show"} Social Media (OpenGraph / Facebook / Twitter) Overrides</span>
              </Button>
              {showSocial && (
                <div className="mt-3 p-4 bg-ui-bg-subtle rounded-xl border border-ui-border-base space-y-3">
                  <div className="space-y-1">
                    <Label size="small">OG Title</Label>
                    <Input placeholder="Title for social sharing" value={form.og_title} onChange={(e) => handleFieldChange("og_title", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label size="small">OG Description</Label>
                    <Textarea rows={2} placeholder="Description for social shares" value={form.og_description} onChange={(e) => handleFieldChange("og_description", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label size="small">OG Image URL</Label>
                    <Input placeholder="https://.../preview.jpg" value={form.og_image} onChange={(e) => handleFieldChange("og_image", e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            {/* Action Footer */}
            <div className="pt-4 border-t border-ui-border-base flex items-center justify-between">
              <Button variant="secondary" size="small" onClick={handleResetToDefaults} disabled={saving}>
                Reset to Defaults
              </Button>
              <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
                {saving ? "Saving SEO..." : "Save SEO"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "pages.details.after",
})

export default PageSeoWidget

