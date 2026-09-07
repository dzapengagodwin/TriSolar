import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Textarea,
  Checkbox,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type ProductSeoWidgetProps = {
  data: {
    id: string
    title?: string
    handle?: string
    thumbnail?: string
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

type CheckItem = {
  id: string
  title: string
  category: string
  status: "pass" | "warn" | "fail"
  score: number
  maxScore: number
  message: string
  recommendation?: string
}

type AnalysisData = {
  score: number
  status: "good" | "ok" | "poor"
  criticalCount: number
  warningCount: number
  passCount: number
  checks: CheckItem[]
}

const ProductSeoWidget = ({ data }: ProductSeoWidgetProps) => {
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
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch initial SEO data and analysis
  const fetchSeoData = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/seo/products/${data.id}`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        const seo = json.seo || {}
        const def = json.defaults || {}
        setDefaults(def)
        setAnalysis(json.analysis || null)

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
      }
    } catch (err) {
      console.error("Failed to load SEO data:", err)
      toast.error("Failed to load SEO data")
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
      meta_title: defaults.meta_title || (data.title ? `${data.title} | LaptopZone` : ""),
      meta_description: defaults.meta_description || "",
      focus_keyphrase: defaults.focus_keyphrase || data.title || "",
      canonical_url: defaults.canonical_url || "",
      og_title: defaults.og_title || defaults.meta_title || "",
      og_description: defaults.og_description || defaults.meta_description || "",
      og_image: defaults.og_image || data.thumbnail || "",
      robots_index: true,
      robots_follow: true,
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!data?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/seo/products/${data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const json = await res.json()
        setAnalysis(json.analysis || null)
        setHasUnsavedChanges(false)
        toast.success("Product SEO saved successfully")
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || "Failed to save SEO metadata")
      }
    } catch (err: any) {
      console.error("Error saving SEO data:", err)
      toast.error(err.message || "Failed to save SEO metadata")
    } finally {
      setSaving(false)
    }
  }

  // Live snippet display values
  const previewTitle = form.meta_title || defaults.meta_title || data.title || "Product Title | LaptopZone"
  const previewSlug = data.handle || "product-url"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    "Authentic warranty-backed laptops, computers, and tech hardware with fast delivery in Zimbabwe."

  const titleLength = form.meta_title.length
  const descLength = form.meta_description.length

  const scoreColor = useMemo(() => {
    if (!analysis) return "bg-gray-100 text-gray-700 border-gray-300"
    if (analysis.score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (analysis.score >= 60) return "bg-amber-50 text-amber-700 border-amber-200"
    return "bg-rose-50 text-rose-700 border-rose-200"
  }, [analysis])

  return (
    <Container className="divide-y divide-gray-100 p-0 overflow-hidden shadow-xs border border-gray-200 rounded-xl bg-white mb-6">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between p-6 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-sm">
            SEO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-base font-bold text-gray-900">
                SEO Manager & Search Snippet
              </Heading>
              {hasUnsavedChanges && (
                <Badge color="orange" size="small">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <Text className="text-xs text-gray-500">
              Manage Google search rankings, meta tags, and structured data readiness
            </Text>
          </div>
        </div>

        {analysis && (
          <div className={clx("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold", scoreColor)}>
            <span>SEO Score:</span>
            <span className="text-sm font-black">{analysis.score} / 100</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">Loading SEO metadata...</div>
      ) : (
        <div className="p-6 space-y-6">
          {/* 2. SEO Readiness Scorecard */}
          {analysis && (
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-gray-900 font-bold">SEO Readiness:</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {analysis.passCount} Passed
                  </span>
                  <span className="text-amber-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    {analysis.warningCount} Warnings
                  </span>
                  {analysis.criticalCount > 0 && (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                      {analysis.criticalCount} Critical
                    </span>
                  )}
                </div>

                <Button
                  variant="transparent"
                  size="small"
                  onClick={() => setShowAllChecks(!showAllChecks)}
                  className="text-xs text-blue-600 font-bold"
                >
                  {showAllChecks ? "Hide Checklist" : "View Checklist Details"}
                </Button>
              </div>

              {/* Score Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={clx(
                    "h-2 transition-all duration-300 rounded-full",
                    analysis.score >= 80 ? "bg-emerald-500" : analysis.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${Math.max(5, analysis.score)}%` }}
                />
              </div>

              {/* Expandable Checks List */}
              {showAllChecks && (
                <div className="pt-3 border-t border-gray-200/60 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {analysis.checks.map((check) => (
                    <div
                      key={check.id}
                      className={clx(
                        "flex items-start justify-between p-2 rounded-lg text-xs",
                        check.status === "pass"
                          ? "bg-emerald-50/50 text-emerald-900"
                          : check.status === "warn"
                          ? "bg-amber-50/60 text-amber-900"
                          : "bg-rose-50/60 text-rose-900"
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold">
                          {check.status === "pass" ? (
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          ) : check.status === "warn" ? (
                            <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>{check.title}</span>
                        </div>
                        <p className="text-[11px] opacity-85">{check.message}</p>
                        {check.recommendation && (
                          <p className="text-[10px] text-blue-700 font-medium">Tip: {check.recommendation}</p>
                        )}
                      </div>
                      <span className="font-bold text-[10px] opacity-75">
                        {check.score}/{check.maxScore} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Live Google Search Preview */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Google Search Snippet Preview
              </span>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewTab("desktop")}
                  className={clx(
                    "px-2.5 py-1 rounded-md font-bold transition-colors",
                    previewTab === "desktop" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"
                  )}
                >
                  Desktop View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("mobile")}
                  className={clx(
                    "px-2.5 py-1 rounded-md font-bold transition-colors",
                    previewTab === "mobile" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"
                  )}
                >
                  Mobile View
                </button>
              </div>
            </div>

            <div
              className={clx(
                "p-3 rounded-lg bg-[#F8F9FA] border border-gray-100 font-sans",
                previewTab === "mobile" ? "max-w-xs" : "w-full"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">
                  LZ
                </div>
                <div className="text-[11px] text-gray-700 leading-tight">
                  <span className="font-medium text-gray-900">LaptopZone</span>
                  <span className="text-gray-400 mx-1">›</span>
                  <span className="text-gray-500 text-[10px]">products › {previewSlug}</span>
                </div>
              </div>

              <div className="text-[#1a0dab] hover:underline text-sm sm:text-base font-medium leading-snug cursor-pointer line-clamp-1">
                {previewTitle}
              </div>

              <div className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                {previewDesc}
              </div>
            </div>
          </div>

          {/* 4. SEO Input Fields */}
          <div className="space-y-4">
            {/* Focus Keyphrase */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Focus Keyphrase</span>
                <span className="text-[10px] text-gray-400 font-normal">Primary search term to optimize for</span>
              </label>
              <Input
                placeholder="e.g. Lenovo ThinkPad E14 Gen 6"
                value={form.focus_keyphrase}
                onChange={(e) => handleFieldChange("focus_keyphrase", e.target.value)}
              />
            </div>

            {/* SEO Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">SEO Meta Title</label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={clx(
                      "font-bold",
                      titleLength >= 40 && titleLength <= 60
                        ? "text-emerald-600"
                        : titleLength > 60
                        ? "text-amber-600"
                        : "text-gray-400"
                    )}
                  >
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
                <label className="text-xs font-bold text-gray-700">Meta Description</label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={clx(
                      "font-bold",
                      descLength >= 120 && descLength <= 160
                        ? "text-emerald-600"
                        : descLength > 160
                        ? "text-amber-600"
                        : "text-gray-400"
                    )}
                  >
                    {descLength} / 160 characters
                  </span>
                </div>
              </div>
              <Textarea
                rows={3}
                placeholder="Compelling description summarizing product specs, warranty, and fast delivery in Zimbabwe"
                value={form.meta_description}
                onChange={(e) => handleFieldChange("meta_description", e.target.value)}
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Canonical URL</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional override (default is automatic)</span>
              </label>
              <Input
                placeholder="https://laptopzone.co.zw/zw/products/..."
                value={form.canonical_url}
                onChange={(e) => handleFieldChange("canonical_url", e.target.value)}
              />
            </div>

            {/* Robots Configuration */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <Checkbox
                  checked={form.robots_index}
                  onCheckedChange={(checked) => handleFieldChange("robots_index", !!checked)}
                />
                <span>Allow Search Engines to Index (Index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <Checkbox
                  checked={form.robots_follow}
                  onCheckedChange={(checked) => handleFieldChange("robots_follow", !!checked)}
                />
                <span>Follow Links on this Page (Follow)</span>
              </label>
            </div>

            {/* 5. Image SEO & Media Readiness */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Image SEO & Media Discovery
                </span>
                <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  {data.thumbnail ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Primary Image Active
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                      </svg>
                      Missing Thumbnail
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Descriptive alt text, Schema.org image arrays, and Google Image Sitemap (<code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-blue-200">/image-sitemap.xml</code>) are generated dynamically for search crawlers.
              </p>
            </div>

            {/* 6. Open Graph / Social Sharing Accordion */}
            <div className="pt-2">
              <Button
                variant="transparent"
                size="small"
                onClick={() => setShowSocial(!showSocial)}
                className="text-xs text-blue-600 font-bold p-0 flex items-center gap-1.5"
              >
                <span>{showSocial ? "▲ Hide" : "▼ Show"} Social Media (OpenGraph / Facebook / Twitter) Overrides</span>
              </Button>

              {showSocial && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">OG Title</label>
                    <Input
                      placeholder="Title for social media sharing"
                      value={form.og_title}
                      onChange={(e) => handleFieldChange("og_title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">OG Description</label>
                    <Textarea
                      rows={2}
                      placeholder="Description for social media shares"
                      value={form.og_description}
                      onChange={(e) => handleFieldChange("og_description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">OG Image URL</label>
                    <Input
                      placeholder="https://.../preview.jpg"
                      value={form.og_image}
                      onChange={(e) => handleFieldChange("og_image", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Action Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="secondary"
              size="small"
              onClick={handleResetToDefaults}
              disabled={saving}
            >
              Reset to Defaults
            </Button>

            <Button
              variant="primary"
              size="small"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving SEO..." : "Save SEO Metadata"}
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductSeoWidget
