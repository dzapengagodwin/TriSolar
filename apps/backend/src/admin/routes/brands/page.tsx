import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Textarea,
  Checkbox,
  Drawer,
  StatusBadge,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useRef } from "react"

type BrandLogoFieldProps = {
  value: string
  onChange: (url: string) => void
}

const BrandLogoField = ({ value, onChange }: BrandLogoFieldProps) => {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Please upload a valid image file (PNG, JPG, SVG, WebP)",
      })
      return
    }

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
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload image")
      }

      const data = await res.json()
      const uploadedUrl = data.files?.[0]?.url

      if (!uploadedUrl) {
        throw new Error("No URL returned from upload server")
      }

      onChange(uploadedUrl)
      toast.success("Uploaded", {
        description: "Brand logo uploaded successfully",
      })
    } catch (err: any) {
      toast.error("Upload Failed", {
        description:
          err.message || "Could not upload image. You can also paste an image URL directly.",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-ui-fg-base block">
          Brand Logo
        </label>
        <div className="flex items-center gap-1 bg-ui-bg-subtle p-0.5 rounded-lg border border-ui-border-base text-[11px]">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={clx(
              "px-2.5 py-0.5 rounded-md font-medium transition-colors",
              mode === "upload"
                ? "bg-ui-bg-base text-ui-fg-base shadow-xs"
                : "text-ui-fg-muted hover:text-ui-fg-base"
            )}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={clx(
              "px-2.5 py-0.5 rounded-md font-medium transition-colors",
              mode === "url"
                ? "bg-ui-bg-base text-ui-fg-base shadow-xs"
                : "text-ui-fg-muted hover:text-ui-fg-base"
            )}
          >
            Enter URL
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload / Drag & Drop */}
      {mode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={clx(
              "border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
              uploading
                ? "bg-ui-bg-subtle border-ui-border-base opacity-60 cursor-not-allowed"
                : "border-ui-border-base hover:border-ui-border-interactive hover:bg-ui-bg-subtle bg-ui-bg-base"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-ui-bg-subtle flex items-center justify-center text-ui-fg-subtle border border-ui-border-base">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-ui-fg-interactive border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-ui-fg-base">
                {uploading ? "Uploading image..." : "Click to upload or drag & drop"}
              </p>
              <p className="text-[11px] text-ui-fg-muted mt-0.5">
                PNG, JPG, SVG, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {mode === "url" && (
        <div>
          <Input
            placeholder="https://example.com/logo.png"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {/* Live Logo Preview Box */}
      {value && (
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Logo preview"
              className="w-10 h-10 rounded-lg object-contain bg-white border border-ui-border-base p-1 shrink-0"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ui-fg-base">Active Logo</p>
              <p className="text-[11px] text-ui-fg-muted truncate font-mono">
                {value}
              </p>
            </div>
          </div>

          <Button
            variant="transparent"
            size="small"
            type="button"
            className="text-ui-fg-danger hover:text-ui-fg-danger-hover text-xs shrink-0"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

type SeoFormState = {
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

type BrandSeoProps = {
  brand: { id: string; name: string; handle: string; logo?: string } | null
  open: boolean
}

const EMPTY_SEO: SeoFormState = {
  meta_title: "",
  meta_description: "",
  focus_keyphrase: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  robots_index: true,
  robots_follow: true,
}

const BrandSeoPanel = ({ brand, open }: BrandSeoProps) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop")
  const [form, setForm] = useState<SeoFormState>(EMPTY_SEO)
  const [defaults, setDefaults] = useState<Partial<SeoFormState>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const fetchSeo = useCallback(async () => {
    if (!brand?.handle) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/seo/brands/${brand.handle}`, {
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
          og_image: seo.og_image ?? def.og_image ?? brand.logo ?? "",
          robots_index: seo.robots_index !== undefined ? seo.robots_index : true,
          robots_follow: seo.robots_follow !== undefined ? seo.robots_follow : true,
        })
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error("Failed to load brand SEO:", err)
    } finally {
      setLoading(false)
    }
  }, [brand?.handle, brand?.logo])

  // Reload whenever the drawer opens for a (possibly different) brand
  useEffect(() => {
    if (open && brand?.handle) {
      fetchSeo()
    }
  }, [open, fetchSeo])

  const handleChange = (field: keyof SeoFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleReset = () => {
    setForm({
      meta_title: defaults.meta_title || `${brand?.name ?? ""} | LaptopZone`,
      meta_description: defaults.meta_description || "",
      focus_keyphrase: defaults.focus_keyphrase || brand?.name || "",
      canonical_url: defaults.canonical_url || "",
      og_title: defaults.og_title || defaults.meta_title || "",
      og_description: defaults.og_description || defaults.meta_description || "",
      og_image: defaults.og_image || brand?.logo || "",
      robots_index: true,
      robots_follow: true,
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!brand?.handle) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/seo/brands/${brand.handle}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setHasUnsavedChanges(false)
        toast.success("Brand SEO saved successfully")
      } else {
        const errJson = await res.json().catch(() => ({}))
        toast.error(errJson.message || "Failed to save SEO metadata")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save SEO metadata")
    } finally {
      setSaving(false)
    }
  }

  const previewTitle = form.meta_title || defaults.meta_title || `${brand?.name ?? ""} | LaptopZone`
  const previewSlug = brand?.handle || "brand-url"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    "Shop original products at LaptopZone. Official warranty, fast delivery across Zimbabwe."

  const titleLength = form.meta_title.length
  const descLength = form.meta_description.length

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-ui-fg-muted">
        Loading SEO metadata...
      </div>
    )
  }

  return (
    <div className="space-y-5 pt-1">
      {/* Unsaved badge */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2">
          <Badge color="orange" size="small">Unsaved Changes</Badge>
        </div>
      )}

      {/* Live Google Search Preview */}
      <div className="border border-ui-border-base rounded-xl p-4 bg-ui-bg-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-ui-border-base pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">
            Google Snippet Preview
          </span>
          <div className="flex items-center gap-1 bg-ui-bg-base p-0.5 rounded-lg border border-ui-border-base text-[11px]">
            <button
              type="button"
              onClick={() => setPreviewTab("desktop")}
              className={clx(
                "px-2.5 py-1 rounded-md font-bold transition-colors",
                previewTab === "desktop" ? "bg-white text-black shadow-xs" : "text-ui-fg-muted hover:text-ui-fg-base"
              )}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("mobile")}
              className={clx(
                "px-2.5 py-1 rounded-md font-bold transition-colors",
                previewTab === "mobile" ? "bg-white text-black shadow-xs" : "text-ui-fg-muted hover:text-ui-fg-base"
              )}
            >
              Mobile
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
              <span className="text-gray-500 text-[10px]">brands › {previewSlug}</span>
            </div>
          </div>
          <div className="text-[#1a0dab] text-sm font-medium leading-snug cursor-pointer line-clamp-1">
            {previewTitle}
          </div>
          <div className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
            {previewDesc}
          </div>
        </div>
      </div>

      {/* SEO Fields */}
      <div className="space-y-4">
        {/* Focus Keyphrase */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ui-fg-base flex items-center justify-between">
            <span>Focus Keyphrase</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">Primary search term for this brand</span>
          </label>
          <Input
            placeholder={`e.g. ${brand?.name ?? "Lenovo"} laptops Zimbabwe`}
            value={form.focus_keyphrase}
            onChange={(e) => handleChange("focus_keyphrase", e.target.value)}
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-ui-fg-base">SEO Meta Title</label>
            <span
              className={clx(
                "text-[10px] font-bold",
                titleLength >= 40 && titleLength <= 60
                  ? "text-emerald-600"
                  : titleLength > 60
                  ? "text-amber-600"
                  : "text-ui-fg-muted"
              )}
            >
              {titleLength} / 60
            </span>
          </div>
          <Input
            placeholder={`${brand?.name ?? "Brand"} Laptops & Tech | LaptopZone`}
            value={form.meta_title}
            onChange={(e) => handleChange("meta_title", e.target.value)}
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-ui-fg-base">Meta Description</label>
            <span
              className={clx(
                "text-[10px] font-bold",
                descLength >= 120 && descLength <= 160
                  ? "text-emerald-600"
                  : descLength > 160
                  ? "text-amber-600"
                  : "text-ui-fg-muted"
              )}
            >
              {descLength} / 160
            </span>
          </div>
          <Textarea
            rows={3}
            placeholder="Compelling description of this brand's product range, warranty, and availability in Zimbabwe"
            value={form.meta_description}
            onChange={(e) => handleChange("meta_description", e.target.value)}
          />
        </div>

        {/* Canonical URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ui-fg-base flex items-center justify-between">
            <span>Canonical URL</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">Optional override (auto-generated by default)</span>
          </label>
          <Input
            placeholder={`https://laptopzone.co.zw/zw/brands/${brand?.handle ?? "..."}`}
            value={form.canonical_url}
            onChange={(e) => handleChange("canonical_url", e.target.value)}
          />
        </div>

        {/* Robots */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ui-fg-base">
            <Checkbox
              checked={form.robots_index}
              onCheckedChange={(checked) => handleChange("robots_index", !!checked)}
            />
            <span>Allow Search Engines to Index</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ui-fg-base">
            <Checkbox
              checked={form.robots_follow}
              onCheckedChange={(checked) => handleChange("robots_follow", !!checked)}
            />
            <span>Follow Links on this Page</span>
          </label>
        </div>

        {/* Open Graph Accordion */}
        <div className="pt-1">
          <Button
            variant="transparent"
            size="small"
            onClick={() => setShowSocial(!showSocial)}
            className="text-xs text-blue-600 font-bold p-0 flex items-center gap-1.5"
          >
            {showSocial ? "▲ Hide" : "▼ Show"} Social Media (OpenGraph) Overrides
          </Button>

          {showSocial && (
            <div className="mt-3 p-4 bg-ui-bg-subtle rounded-xl border border-ui-border-base space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ui-fg-base">OG Title</label>
                <Input
                  placeholder="Title for social media sharing"
                  value={form.og_title}
                  onChange={(e) => handleChange("og_title", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ui-fg-base">OG Description</label>
                <Textarea
                  rows={2}
                  placeholder="Description for social media shares"
                  value={form.og_description}
                  onChange={(e) => handleChange("og_description", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ui-fg-base">OG Image URL</label>
                <Input
                  placeholder="https://.../brand-og.jpg (1200×630 recommended)"
                  value={form.og_image}
                  onChange={(e) => handleChange("og_image", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-ui-border-base flex items-center justify-between">
        <Button variant="secondary" size="small" onClick={handleReset} disabled={saving}>
          Reset to Defaults
        </Button>
        <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save SEO"}
        </Button>
      </div>
    </div>
  )
}

const BrandsAdminPage = () => {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer / Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [editTab, setEditTab] = useState<"info" | "seo">("info")

  // Form states
  const [formName, setFormName] = useState("")
  const [formHandle, setFormHandle] = useState("")
  const [formLogo, setFormLogo] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formWebsite, setFormWebsite] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/brands?limit=100", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch brands")
      const data = await res.json()
      setBrands(data.brands || [])
    } catch (err: any) {
      toast.error("Error", {
        description: err.message || "Could not load brands",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const openCreateDrawer = () => {
    setFormName("")
    setFormHandle("")
    setFormLogo("")
    setFormDescription("")
    setFormWebsite("")
    setFormIsActive(true)
    setIsCreateOpen(true)
  }

  const openEditDrawer = (brand: any) => {
    setSelectedBrand(brand)
    setFormName(brand.name || "")
    setFormHandle(brand.handle || "")
    setFormLogo(brand.logo || "")
    setFormDescription(brand.description || "")
    setFormWebsite(brand.website || "")
    setFormIsActive(brand.is_active ?? true)
    setEditTab("info")
    setIsEditOpen(true)
  }

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Validation Error", { description: "Brand name is required" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formName.trim(),
          handle: formHandle.trim() || undefined,
          logo: formLogo.trim() || undefined,
          description: formDescription.trim() || undefined,
          website: formWebsite.trim() || undefined,
          is_active: formIsActive,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to create brand")
      }

      toast.success("Success", { description: `Brand "${formName}" created` })
      setIsCreateOpen(false)
      fetchBrands()
    } catch (err: any) {
      toast.error("Creation Failed", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand || !formName.trim()) return

    setSaving(true)
    try {
      const res = await fetch(`/admin/brands/${selectedBrand.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formName.trim(),
          handle: formHandle.trim() || undefined,
          logo: formLogo.trim() || undefined,
          description: formDescription.trim() || undefined,
          website: formWebsite.trim() || undefined,
          is_active: formIsActive,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to update brand")
      }

      toast.success("Success", { description: `Brand "${formName}" updated` })
      setIsEditOpen(false)
      fetchBrands()
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBrand = async (brand: any) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/admin/brands/${brand.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to delete brand")
      }

      toast.success("Deleted", { description: `Brand "${brand.name}" removed` })
      fetchBrands()
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message })
    }
  }

  const filteredBrands = brands.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.handle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Container className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ui-border-base pb-6">
        <div>
          <Heading level="h1" className="text-2xl font-bold text-ui-fg-base">
            Brands
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage your store&apos;s hardware and device brands, logos, and catalog relationships.
          </Text>
        </div>
        <Button variant="primary" size="base" onClick={openCreateDrawer}>
          + Add Brand
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search brands by name or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge color="grey">{brands.length} Total Brands</Badge>
          <Badge color="green">
            {brands.filter((b) => b.is_active).length} Active
          </Badge>
        </div>
      </div>

      {/* Brands Table */}
      <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base shadow-sm">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Brand</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Products Linked</Table.HeaderCell>
              <Table.HeaderCell>Website</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-12 text-ui-fg-muted">
                  Loading brands...
                </Table.Cell>
              </Table.Row>
            ) : filteredBrands.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-12 text-ui-fg-muted">
                  No brands found. Click &quot;+ Add Brand&quot; or import products via WooCommerce Migrator to automatically populate.
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredBrands.map((brand) => (
                <Table.Row key={brand.id} className="hover:bg-ui-bg-subtle transition-colors">
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-8 h-8 rounded-lg object-contain border border-ui-border-base p-1 bg-white"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center font-bold text-xs text-ui-fg-muted">
                          {brand.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Text size="base" className="font-semibold text-ui-fg-base">
                          {brand.name}
                        </Text>
                        {brand.description && (
                          <Text size="xsmall" className="text-ui-fg-muted truncate max-w-xs">
                            {brand.description}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <code className="text-xs bg-ui-bg-subtle px-2 py-1 rounded border border-ui-border-base">
                      {brand.handle}
                    </code>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={brand.is_active ? "green" : "grey"}>
                      {brand.is_active ? "Active" : "Disabled"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="blue">
                      {brand.products?.length || 0} products
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-ui-fg-interactive hover:underline truncate max-w-[150px] inline-block"
                      >
                        {brand.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <Text size="small" className="text-ui-fg-muted">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right space-x-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openEditDrawer(brand)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteBrand(brand)}
                    >
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Create Brand Drawer */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Drawer.Content className="max-w-md p-6">
          <Drawer.Header>
            <Drawer.Title>Create New Brand</Drawer.Title>
            <Drawer.Description>
              Add a brand to categorize products and enhance SEO.
            </Drawer.Description>
          </Drawer.Header>
          <form onSubmit={handleCreateBrand} className="space-y-4 my-6">
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Brand Name *
              </label>
              <Input
                placeholder="e.g. Lenovo"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value)
                  if (!formHandle) {
                    setFormHandle(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                    )
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Handle (URL Slug)
              </label>
              <Input
                placeholder="e.g. lenovo"
                value={formHandle}
                onChange={(e) => setFormHandle(e.target.value)}
              />
            </div>

            {/* Logo Upload / URL Component */}
            <BrandLogoField value={formLogo} onChange={setFormLogo} />

            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Website URL
              </label>
              <Input
                placeholder="https://www.lenovo.com"
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of the brand..."
                className="w-full bg-ui-bg-base border border-ui-border-base rounded-lg p-2.5 text-xs text-ui-fg-base focus:outline-none focus:border-ui-border-interactive"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active_create"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-ui-border-base text-ui-fg-interactive"
              />
              <label htmlFor="is_active_create" className="text-xs text-ui-fg-base">
                Active Brand (Visible on Storefront)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Brand"}
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>

      {/* Edit Brand Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Drawer.Content className="max-w-lg p-6">
          <Drawer.Header>
            <Drawer.Title>Edit Brand: {selectedBrand?.name}</Drawer.Title>
            <Drawer.Description>
              Update brand information, details, and SEO metadata.
            </Drawer.Description>
          </Drawer.Header>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 bg-ui-bg-subtle p-1 rounded-xl border border-ui-border-base mt-4">
            <button
              type="button"
              onClick={() => setEditTab("info")}
              className={clx(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-colors",
                editTab === "info"
                  ? "bg-ui-bg-base text-ui-fg-base shadow-xs"
                  : "text-ui-fg-muted hover:text-ui-fg-base"
              )}
            >
              Brand Info
            </button>
            <button
              type="button"
              onClick={() => setEditTab("seo")}
              className={clx(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5",
                editTab === "seo"
                  ? "bg-ui-bg-base text-ui-fg-base shadow-xs"
                  : "text-ui-fg-muted hover:text-ui-fg-base"
              )}
            >
              <span className="w-4 h-4 rounded bg-blue-600/15 text-blue-700 flex items-center justify-center text-[9px] font-black">
                S
              </span>
              SEO
            </button>
          </div>

          {/* Brand Info Tab */}
          {editTab === "info" && (
            <form onSubmit={handleUpdateBrand} className="space-y-4 my-6">
              <div>
                <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                  Brand Name *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                  Handle
                </label>
                <Input
                  value={formHandle}
                  onChange={(e) => setFormHandle(e.target.value)}
                />
              </div>

              {/* Logo Upload / URL Component */}
              <BrandLogoField value={formLogo} onChange={setFormLogo} />

              <div>
                <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                  Website URL
                </label>
                <Input
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-ui-bg-base border border-ui-border-base rounded-lg p-2.5 text-xs text-ui-fg-base focus:outline-none focus:border-ui-border-interactive"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-ui-border-base text-ui-fg-interactive"
                />
                <label htmlFor="is_active_edit" className="text-xs text-ui-fg-base">
                  Active Brand (Visible on Storefront)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}

          {/* SEO Tab */}
          {editTab === "seo" && (
            <div className="my-6">
              <BrandSeoPanel brand={selectedBrand} open={isEditOpen} />
            </div>
          )}
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsAdminPage
