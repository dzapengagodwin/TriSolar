import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Label,
  Textarea,
  Checkbox,
  Drawer,
  StatusBadge,
  Prompt,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useRef } from "react"
import { MediaUploadField } from "../../components/media-upload-field"

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
      meta_title: defaults.meta_title || `${brand?.name ?? ""} | Laptopzone`,
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

  const previewTitle = form.meta_title || defaults.meta_title || `${brand?.name ?? ""} | Laptopzone`
  const previewSlug = brand?.handle || "brand-url"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    "Shop original products at Laptopzone. Official warranty, fast delivery across Zimbabwe."

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
          <Text size="xsmall" className="uppercase tracking-wider text-ui-fg-muted">
            Google Snippet Preview
          </Text>
          <div className="flex items-center gap-1 bg-ui-bg-base p-0.5 rounded-lg border border-ui-border-base">
            <Button
              type="button"
              variant={previewTab === "desktop" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setPreviewTab("desktop")}
              className="text-xs"
            >
              Desktop
            </Button>
            <Button
              type="button"
              variant={previewTab === "mobile" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setPreviewTab("mobile")}
              className="text-xs"
            >
              Mobile
            </Button>
          </div>
        </div>

        <div
          className={clx(
            "p-3 rounded-lg bg-[#F8F9FA] border border-gray-100 font-sans",
            previewTab === "mobile" ? "max-w-xs" : "w-full"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-medium">
              LZ
            </div>
            <div className="text-[11px] text-gray-700 leading-tight">
              <span className="font-medium text-gray-900">Laptopzone</span>
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
          <Label size="small" className="text-ui-fg-base flex items-center justify-between">
            <span>Focus Keyphrase</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">Primary search term for this brand</span>
          </Label>
          <Input
            placeholder={`e.g. ${brand?.name ?? "Lenovo"} laptops Zimbabwe`}
            value={form.focus_keyphrase}
            onChange={(e) => handleChange("focus_keyphrase", e.target.value)}
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label size="small" className="text-ui-fg-base">SEO Meta Title</Label>
            <span
              className={clx(
                "text-[10px] font-medium",
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
            placeholder={`${brand?.name ?? "Brand"} Laptops & Tech | Laptopzone`}
            value={form.meta_title}
            onChange={(e) => handleChange("meta_title", e.target.value)}
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label size="small" className="text-ui-fg-base">Meta Description</Label>
            <span
              className={clx(
                "text-[10px] font-medium",
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
          <Label size="small" className="text-ui-fg-base flex items-center justify-between">
            <span>Canonical URL</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">Optional override (auto-generated by default)</span>
          </Label>
          <Input
            placeholder={`https://laptopzone.co.zw/brand/${brand?.handle ?? "..."}`}
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
            className="text-xs text-ui-fg-interactive flex items-center gap-1.5"
          >
            {showSocial ? "▲ Hide" : "▼ Show"} Social Media (OpenGraph) Overrides
          </Button>

          {showSocial && (
            <div className="mt-3 p-4 bg-ui-bg-subtle rounded-xl border border-ui-border-base space-y-3">
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">OG Title</Label>
                <Input
                  placeholder="Title for social media sharing"
                  value={form.og_title}
                  onChange={(e) => handleChange("og_title", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">OG Description</Label>
                <Textarea
                  rows={2}
                  placeholder="Description for social media shares"
                  value={form.og_description}
                  onChange={(e) => handleChange("og_description", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">OG Image URL</Label>
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
  const [brandToDelete, setBrandToDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
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

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return
    setDeleting(true)

    try {
      const res = await fetch(`/admin/brands/${brandToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to delete brand")
      }

      toast.success("Deleted", { description: `Brand "${brandToDelete.name}" removed` })
      setBrandToDelete(null)
      fetchBrands()
    } catch (err: any) {
      toast.error("Delete Failed", { description: err.message })
    } finally {
      setDeleting(false)
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
          <Heading level="h1">
            Brands
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage your store&apos;s hardware and device brands, logos, and catalog relationships.
          </Text>
        </div>
        <Button variant="primary" size="small" onClick={openCreateDrawer}>
          Add Brand
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
        <div className="flex items-center gap-3">
          <Badge color="grey">{brands.length} Total Brands</Badge>
          <StatusBadge color="green">
            {brands.filter((b) => b.is_active).length} Active
          </StatusBadge>
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
                  No brands found. Click &quot;Add Brand&quot; or import products via WooCommerce Migrator to automatically populate.
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
                        <div className="w-8 h-8 rounded-lg bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center font-medium text-xs text-ui-fg-muted">
                          {brand.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Text size="small" weight="plus" className="text-ui-fg-base">
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
                      onClick={() => setBrandToDelete(brand)}
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
              <Label size="small" className="text-ui-fg-base mb-1 block">
                Brand Name *
              </Label>
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
              <Label size="small" className="text-ui-fg-base mb-1 block">
                Handle (URL Slug)
              </Label>
              <Input
                placeholder="e.g. lenovo"
                value={formHandle}
                onChange={(e) => setFormHandle(e.target.value)}
              />
            </div>

            {/* Logo Upload / URL Component */}
            <MediaUploadField
              value={formLogo}
              onChange={setFormLogo}
              label="Brand Logo"
              aspectRatio="square"
            />

            <div>
              <Label size="small" className="text-ui-fg-base mb-1 block">
                Website URL
              </Label>
              <Input
                placeholder="https://www.lenovo.com"
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
              />
            </div>
            <div>
              <Label size="small" className="text-ui-fg-base mb-1 block">
                Description
              </Label>
              <Textarea
                rows={3}
                placeholder="Brief summary of the brand..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="is_active_create"
                checked={formIsActive}
                onCheckedChange={(checked) => setFormIsActive(!!checked)}
              />
              <label htmlFor="is_active_create" className="text-xs text-ui-fg-base cursor-pointer">
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
            <Button
              type="button"
              variant={editTab === "info" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setEditTab("info")}
              className="flex-1 text-xs"
            >
              Brand Info
            </Button>
            <Button
              type="button"
              variant={editTab === "seo" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setEditTab("seo")}
              className="flex-1 text-xs"
            >
              SEO & Metadata
            </Button>
          </div>

          {/* Brand Info Tab */}
          {editTab === "info" && (
            <form onSubmit={handleUpdateBrand} className="space-y-4 my-6">
              <div>
                <Label size="small" className="text-ui-fg-base mb-1 block">
                  Brand Name *
                </Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label size="small" className="text-ui-fg-base mb-1 block">
                  Handle
                </Label>
                <Input
                  value={formHandle}
                  onChange={(e) => setFormHandle(e.target.value)}
                />
              </div>

              {/* Logo Upload / URL Component */}
              <MediaUploadField
                value={formLogo}
                onChange={setFormLogo}
                label="Brand Logo"
                aspectRatio="square"
              />

              <div>
                <Label size="small" className="text-ui-fg-base mb-1 block">
                  Website URL
                </Label>
                <Input
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                />
              </div>
              <div>
                <Label size="small" className="text-ui-fg-base mb-1 block">
                  Description
                </Label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="is_active_edit"
                  checked={formIsActive}
                  onCheckedChange={(checked) => setFormIsActive(!!checked)}
                />
                <label htmlFor="is_active_edit" className="text-xs text-ui-fg-base cursor-pointer">
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

      {/* Delete Confirmation Prompt */}
      <Prompt open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Brand</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete &quot;{brandToDelete?.name}&quot;? Products linked to this brand will be unlinked. This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel disabled={deleting}>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={confirmDeleteBrand} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsAdminPage
