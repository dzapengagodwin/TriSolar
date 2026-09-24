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
import { useParams } from "react-router-dom"

type CategorySeoWidgetProps = {
  data?: {
    id: string
    name?: string
    handle?: string
    description?: string
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
  status: "pass" | "warn" | "fail"
  score: number
  maxScore: number
  message: string
  recommendation?: string
}

const CategorySeoWidget = ({ data }: CategorySeoWidgetProps) => {
  const params = useParams<{ id: string }>()
  const categoryId = data?.id || params.id

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
  const [categoryName, setCategoryName] = useState(data?.name || "")
  const [categoryHandle, setCategoryHandle] = useState(data?.handle || "")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch initial SEO data from category SEO admin endpoint
  const fetchSeoData = useCallback(async () => {
    if (!categoryId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/seo/categories/${categoryId}`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        const seo = json.seo || {}
        const def = json.defaults || {}
        setDefaults(def)

        if (json.category?.name) setCategoryName(json.category.name)
        if (json.category?.handle) setCategoryHandle(json.category.handle)

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
      console.error("Failed to load category SEO data:", err)
      toast.error("Failed to load SEO metadata")
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchSeoData()
  }, [fetchSeoData])

  const handleFieldChange = (field: keyof SeoState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleResetToDefaults = () => {
    setForm({
      meta_title: defaults.meta_title || (categoryName ? `${categoryName} | LaptopZone` : ""),
      meta_description: defaults.meta_description || "",
      focus_keyphrase: defaults.focus_keyphrase || categoryName || "",
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
    if (!categoryId) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/seo/categories/${categoryId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setHasUnsavedChanges(false)
        toast.success("Category SEO metadata saved successfully")
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || "Failed to save category SEO metadata")
      }
    } catch (err: any) {
      console.error("Error saving category SEO data:", err)
      toast.error(err.message || "Failed to save category SEO metadata")
    } finally {
      setSaving(false)
    }
  }

  // Live snippet preview values
  const previewTitle = form.meta_title || defaults.meta_title || (categoryName ? `${categoryName} | LaptopZone` : "Category Title | LaptopZone")
  const previewSlug = categoryHandle || "category-slug"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    `Browse warranty-backed ${categoryName || "products"} with nationwide delivery in Zimbabwe.`

  const titleLength = form.meta_title.length
  const descLength = form.meta_description.length

  // Calculate live Category SEO Checklist
  const { checks, score, scoreColor, criticalCount, warningCount, passCount } = useMemo(() => {
    const list: CheckItem[] = []

    // 1. Slug Check
    if (previewSlug && previewSlug.length >= 2 && !previewSlug.includes(" ")) {
      list.push({
        id: "slug_valid",
        title: "Indexable URL Handle",
        status: "pass",
        score: 15,
        maxScore: 15,
        message: `/categories/${previewSlug}`,
      })
    } else {
      list.push({
        id: "slug_valid",
        title: "Indexable URL Handle",
        status: "fail",
        score: 0,
        maxScore: 15,
        message: "Category handle is missing or contains spaces.",
        recommendation: "Ensure category handle contains only lowercase letters and hyphens.",
      })
    }

    // 2. Meta Title Length
    if (titleLength >= 35 && titleLength <= 65) {
      list.push({
        id: "title_length",
        title: "SEO Meta Title Length",
        status: "pass",
        score: 25,
        maxScore: 25,
        message: `Optimal length (${titleLength} / 60 characters).`,
      })
    } else if (titleLength > 0 && titleLength < 35) {
      list.push({
        id: "title_length",
        title: "SEO Meta Title Length",
        status: "warn",
        score: 12,
        maxScore: 25,
        message: `Title is short (${titleLength} chars). Recommended: 40-60 chars.`,
        recommendation: "Include relevant descriptors (e.g. 'Laptops, Notebooks & Hardware').",
      })
    } else if (titleLength > 65) {
      list.push({
        id: "title_length",
        title: "SEO Meta Title Length",
        status: "warn",
        score: 12,
        maxScore: 25,
        message: `Title may truncate on Google search results (${titleLength} chars).`,
        recommendation: "Keep SEO title under 60-65 characters.",
      })
    } else {
      list.push({
        id: "title_length",
        title: "SEO Meta Title Length",
        status: "fail",
        score: 0,
        maxScore: 25,
        message: "Meta title is empty.",
        recommendation: "Provide a search-optimized category title tag.",
      })
    }

    // 3. Meta Description Length
    if (descLength >= 110 && descLength <= 165) {
      list.push({
        id: "desc_length",
        title: "Meta Description Length",
        status: "pass",
        score: 25,
        maxScore: 25,
        message: `Optimal length (${descLength} / 160 characters).`,
      })
    } else if (descLength > 0 && descLength < 110) {
      list.push({
        id: "desc_length",
        title: "Meta Description Length",
        status: "warn",
        score: 12,
        maxScore: 25,
        message: `Description is short (${descLength} chars). Recommended: 120-160 chars.`,
        recommendation: "Describe the product selection, warranty, and availability.",
      })
    } else if (descLength > 165) {
      list.push({
        id: "desc_length",
        title: "Meta Description Length",
        status: "warn",
        score: 12,
        maxScore: 25,
        message: `Description exceeds standard snippet length (${descLength} chars).`,
        recommendation: "Shorten meta description to 160 characters.",
      })
    } else {
      list.push({
        id: "desc_length",
        title: "Meta Description Length",
        status: "fail",
        score: 0,
        maxScore: 25,
        message: "Meta description is empty.",
        recommendation: "Add a compelling meta description to improve search click-through rate.",
      })
    }

    // 4. Focus Keyphrase
    const keyphrase = form.focus_keyphrase.trim().toLowerCase()
    if (keyphrase && keyphrase.length >= 2) {
      const inTitle = form.meta_title.toLowerCase().includes(keyphrase)
      const inDesc = form.meta_description.toLowerCase().includes(keyphrase)

      if (inTitle && inDesc) {
        list.push({
          id: "keyphrase",
          title: "Focus Keyphrase Alignment",
          status: "pass",
          score: 20,
          maxScore: 20,
          message: `Keyphrase "${form.focus_keyphrase}" appears in both title and description.`,
        })
      } else if (inTitle || inDesc) {
        list.push({
          id: "keyphrase",
          title: "Focus Keyphrase Alignment",
          status: "warn",
          score: 10,
          maxScore: 20,
          message: `Keyphrase found in ${inTitle ? "title" : "description"}, but missing in the other.`,
          recommendation: `Include "${form.focus_keyphrase}" in both SEO title and description.`,
        })
      } else {
        list.push({
          id: "keyphrase",
          title: "Focus Keyphrase Alignment",
          status: "warn",
          score: 5,
          maxScore: 20,
          message: `Keyphrase "${form.focus_keyphrase}" not found in title or description.`,
          recommendation: "Incorporate the keyphrase naturally into your title and description.",
        })
      }
    } else {
      list.push({
        id: "keyphrase",
        title: "Focus Keyphrase Alignment",
        status: "warn",
        score: 0,
        maxScore: 20,
        message: "No focus keyphrase specified.",
        recommendation: "Enter a target search term (e.g. 'Gaming Laptops Zimbabwe').",
      })
    }

    // 5. Robots Indexing
    if (form.robots_index) {
      list.push({
        id: "robots",
        title: "Search Indexing Status",
        status: "pass",
        score: 15,
        maxScore: 15,
        message: "Crawlable and indexed for search engines.",
      })
    } else {
      list.push({
        id: "robots",
        title: "Search Indexing Status",
        status: "warn",
        score: 5,
        maxScore: 15,
        message: "Category is set to noindex (hidden from Google).",
        recommendation: "Enable 'Allow Search Engines to Index' if this category should appear in search results.",
      })
    }

    const earned = list.reduce((sum, c) => sum + c.score, 0)
    const max = list.reduce((sum, c) => sum + c.maxScore, 0)
    const normalized = max > 0 ? Math.round((earned / max) * 100) : 0

    const color: "green" | "orange" | "red" =
      normalized >= 80 ? "green" : normalized >= 60 ? "orange" : "red"

    return {
      checks: list,
      score: normalized,
      scoreColor: color,
      criticalCount: list.filter((c) => c.status === "fail").length,
      warningCount: list.filter((c) => c.status === "warn").length,
      passCount: list.filter((c) => c.status === "pass").length,
    }
  }, [previewSlug, titleLength, descLength, form.focus_keyphrase, form.meta_title, form.meta_description, form.robots_index])

  return (
    <Container className="divide-y divide-ui-border-base p-0 overflow-hidden shadow-xs border border-ui-border-base rounded-xl bg-ui-bg-base mb-6">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between p-6 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-interactive flex items-center justify-center font-medium text-xs">
            SEO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2">
                Category SEO & Search Snippet
              </Heading>
              {hasUnsavedChanges && (
                <Badge color="orange" size="small">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <Text className="text-xs text-ui-fg-subtle mt-0.5">
              Configure Google search results, meta tags, and indexing directives for this category
            </Text>
          </div>
        </div>

        <Badge color={scoreColor} size="small">
          SEO Score: {score} / 100
        </Badge>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-ui-fg-muted">Loading category SEO metadata...</div>
      ) : (
        <div className="p-6 space-y-6">
          {/* 2. SEO Readiness Scorecard */}
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-ui-fg-base">Readiness Checklist:</span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {passCount} Passed
                </span>
                {warningCount > 0 && (
                  <span className="text-amber-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    {warningCount} Warnings
                  </span>
                )}
                {criticalCount > 0 && (
                  <span className="text-rose-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {criticalCount} Critical
                  </span>
                )}
              </div>

              <Button
                variant="transparent"
                size="small"
                onClick={() => setShowAllChecks(!showAllChecks)}
                className="text-xs text-ui-fg-interactive"
              >
                {showAllChecks ? "Hide Checklist" : "View Checklist Details"}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-ui-bg-component rounded-full h-2 overflow-hidden">
              <div
                className={clx(
                  "h-2 transition-all duration-300 rounded-full",
                  score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${Math.max(5, score)}%` }}
              />
            </div>

            {/* Checklist items */}
            {showAllChecks && (
              <div className="pt-3 border-t border-ui-border-base space-y-2 max-h-64 overflow-y-auto pr-1">
                {checks.map((check) => (
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
                      <div className="flex items-center gap-2 font-medium">
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
                        <p className="text-[10px] text-ui-fg-interactive font-medium">Tip: {check.recommendation}</p>
                      )}
                    </div>
                    <span className="font-medium text-[10px] text-ui-fg-subtle">
                      {check.score}/{check.maxScore} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Live Google Search Preview */}
          <div className="border border-ui-border-base rounded-xl p-4 bg-ui-bg-base space-y-3">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-2">
              <Text size="xsmall" weight="plus" className="uppercase tracking-wider text-ui-fg-subtle">
                Google Search Snippet Preview
              </Text>
              <div className="flex items-center gap-1 bg-ui-bg-subtle p-0.5 rounded-lg border border-ui-border-base">
                <Button
                  type="button"
                  variant={previewTab === "desktop" ? "secondary" : "transparent"}
                  size="small"
                  onClick={() => setPreviewTab("desktop")}
                  className="text-xs"
                >
                  Desktop View
                </Button>
                <Button
                  type="button"
                  variant={previewTab === "mobile" ? "secondary" : "transparent"}
                  size="small"
                  onClick={() => setPreviewTab("mobile")}
                  className="text-xs"
                >
                  Mobile View
                </Button>
              </div>
            </div>

            <div
              className={clx(
                "p-3 rounded-lg bg-ui-bg-subtle border border-ui-border-base font-sans",
                previewTab === "mobile" ? "max-w-xs" : "w-full"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-ui-fg-interactive flex items-center justify-center text-[9px] text-white font-medium">
                  LZ
                </div>
                <div className="text-[11px] text-ui-fg-subtle leading-tight">
                  <span className="font-medium text-ui-fg-base">LaptopZone</span>
                  <span className="text-ui-fg-muted mx-1">›</span>
                  <span className="text-ui-fg-muted text-[10px]">categories › {previewSlug}</span>
                </div>
              </div>

              <div className="text-ui-fg-interactive hover:underline text-sm sm:text-base font-medium leading-snug cursor-pointer line-clamp-1">
                {previewTitle}
              </div>

              <div className="text-xs text-ui-fg-subtle mt-1 leading-relaxed line-clamp-2">
                {previewDesc}
              </div>
            </div>
          </div>

          {/* 4. SEO Input Fields */}
          <div className="space-y-4">
            {/* Focus Keyphrase */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Focus Keyphrase</Label>
                <Text size="xsmall" className="text-ui-fg-muted">Primary search query to rank for</Text>
              </div>
              <Input
                placeholder="e.g. Gaming Laptops Zimbabwe"
                value={form.focus_keyphrase}
                onChange={(e) => handleFieldChange("focus_keyphrase", e.target.value)}
              />
            </div>

            {/* SEO Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">SEO Meta Title</Label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={clx(
                      "font-medium",
                      titleLength >= 35 && titleLength <= 65
                        ? "text-emerald-600"
                        : titleLength > 65
                        ? "text-amber-600"
                        : "text-ui-fg-muted"
                    )}
                  >
                    {titleLength} / 60 characters
                  </span>
                </div>
              </div>
              <Input
                placeholder="Custom category title for Google"
                value={form.meta_title}
                onChange={(e) => handleFieldChange("meta_title", e.target.value)}
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Meta Description</Label>
                <div className="flex items-center gap-2 text-[10px]">
                  <span
                    className={clx(
                      "font-medium",
                      descLength >= 110 && descLength <= 165
                        ? "text-emerald-600"
                        : descLength > 165
                        ? "text-amber-600"
                        : "text-ui-fg-muted"
                    )}
                  >
                    {descLength} / 160 characters
                  </span>
                </div>
              </div>
              <Textarea
                rows={3}
                placeholder="Summary of products in this category, brand selections, and store warranty..."
                value={form.meta_description}
                onChange={(e) => handleFieldChange("meta_description", e.target.value)}
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label size="small">Canonical URL</Label>
                <Text size="xsmall" className="text-ui-fg-muted">Optional override (default is automatic)</Text>
              </div>
              <Input
                placeholder="https://laptopzone.co.zw/zw/categories/..."
                value={form.canonical_url}
                onChange={(e) => handleFieldChange("canonical_url", e.target.value)}
              />
            </div>

            {/* Robots Directives */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-ui-fg-base">
                <Checkbox
                  checked={form.robots_index}
                  onCheckedChange={(checked) => handleFieldChange("robots_index", !!checked)}
                />
                <span>Allow Search Engines to Index (Index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-normal text-ui-fg-base">
                <Checkbox
                  checked={form.robots_follow}
                  onCheckedChange={(checked) => handleFieldChange("robots_follow", !!checked)}
                />
                <span>Follow Links in this Category (Follow)</span>
              </label>
            </div>

            {/* 5. Open Graph / Social Sharing Accordion */}
            <div className="pt-2">
              <Button
                variant="transparent"
                size="small"
                onClick={() => setShowSocial(!showSocial)}
                className="text-xs text-ui-fg-interactive flex items-center gap-1.5"
              >
                <span>{showSocial ? "▲ Hide" : "▼ Show"} Social Media (OpenGraph / Facebook / Twitter) Overrides</span>
              </Button>

              {showSocial && (
                <div className="mt-3 p-4 bg-ui-bg-subtle rounded-xl border border-ui-border-base space-y-3">
                  <div className="space-y-1">
                    <Label size="small">OG Title</Label>
                    <Input
                      placeholder="Title for social media sharing"
                      value={form.og_title}
                      onChange={(e) => handleFieldChange("og_title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label size="small">OG Description</Label>
                    <Textarea
                      rows={2}
                      placeholder="Description for social media shares"
                      value={form.og_description}
                      onChange={(e) => handleFieldChange("og_description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label size="small">OG Image URL</Label>
                    <Input
                      placeholder="https://.../banner.jpg"
                      value={form.og_image}
                      onChange={(e) => handleFieldChange("og_image", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. Action Footer */}
          <div className="pt-4 border-t border-ui-border-base flex items-center justify-between">
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
              {saving ? "Saving SEO..." : "Save Category SEO"}
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
})

export default CategorySeoWidget

