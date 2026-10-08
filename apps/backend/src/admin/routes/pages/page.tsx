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
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback, useMemo } from "react"

type PageEntry = {
  handle: string
  title: string
  description: string
  path: string
  has_seo: boolean
  meta_title: string | null
  meta_description: string | null
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

// ---------------------------------------------------------------------------
// SEO Drawer Panel (reusable for each page)
// ---------------------------------------------------------------------------
const PageSeoPanel = ({
  page,
  open,
  onSaved,
}: {
  page: PageEntry | null
  open: boolean
  onSaved?: () => void
}) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop")
  const [form, setForm] = useState<SeoFormState>(EMPTY_SEO)
  const [defaults, setDefaults] = useState<Partial<SeoFormState>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const fetchSeo = useCallback(async () => {
    if (!page?.handle) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/seo/pages/${page.handle}`, {
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
          robots_index:
            seo.robots_index !== undefined ? seo.robots_index : true,
          robots_follow:
            seo.robots_follow !== undefined ? seo.robots_follow : true,
        })
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error("Failed to load page SEO:", err)
      toast.error("Failed to load SEO data")
    } finally {
      setLoading(false)
    }
  }, [page?.handle])

  useEffect(() => {
    if (open && page?.handle) {
      fetchSeo()
    }
  }, [open, fetchSeo])

  const handleChange = (field: keyof SeoFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleReset = () => {
    setForm({
      meta_title: defaults.meta_title || page?.title || "",
      meta_description: defaults.meta_description || "",
      focus_keyphrase: defaults.focus_keyphrase || page?.title || "",
      canonical_url: defaults.canonical_url || "",
      og_title: defaults.og_title || defaults.meta_title || "",
      og_description:
        defaults.og_description || defaults.meta_description || "",
      og_image: defaults.og_image || "",
      robots_index: true,
      robots_follow: true,
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!page?.handle) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/seo/pages/${page.handle}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setHasUnsavedChanges(false)
        toast.success("Page SEO saved successfully")
        onSaved?.()
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

  const previewTitle =
    form.meta_title ||
    defaults.meta_title ||
    page?.title ||
    ""
  const previewSlug = page?.handle || "page"
  const previewDesc =
    form.meta_description ||
    defaults.meta_description ||
    ""

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
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2">
          <Badge color="orange" size="small">
            Unsaved Changes
          </Badge>
        </div>
      )}

      {/* Google Search Preview */}
      <div className="border border-ui-border-base rounded-xl p-4 bg-ui-bg-subtle space-y-3">
        <div className="flex items-center justify-between border-b border-ui-border-base pb-2">
          <Text
            size="xsmall"
            className="uppercase tracking-wider text-ui-fg-muted"
          >
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
              <span className="text-gray-400 mx-1">&rsaquo;</span>
              <span className="text-gray-500 text-[10px]">{previewSlug}</span>
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
          <Label
            size="small"
            className="text-ui-fg-base flex items-center justify-between"
          >
            <span>Focus Keyphrase</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">
              Primary search term for this page
            </span>
          </Label>
          <Input
            placeholder={`e.g. ${page?.title ?? "Page"} Laptopzone`}
            value={form.focus_keyphrase}
            onChange={(e) => handleChange("focus_keyphrase", e.target.value)}
          />
        </div>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label size="small" className="text-ui-fg-base">
              SEO Meta Title
            </Label>
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
            placeholder={`${page?.title ?? "Page"} | Laptopzone`}
            value={form.meta_title}
            onChange={(e) => handleChange("meta_title", e.target.value)}
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label size="small" className="text-ui-fg-base">
              Meta Description
            </Label>
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
            placeholder="Compelling description of this page for search results"
            value={form.meta_description}
            onChange={(e) => handleChange("meta_description", e.target.value)}
          />
        </div>

        {/* Canonical URL */}
        <div className="space-y-1.5">
          <Label
            size="small"
            className="text-ui-fg-base flex items-center justify-between"
          >
            <span>Canonical URL</span>
            <span className="text-[10px] text-ui-fg-muted font-normal">
              Optional override (auto-generated by default)
            </span>
          </Label>
          <Input
            placeholder={`https://laptopzone.co.zw${page?.path ?? "/"}`}
            value={form.canonical_url}
            onChange={(e) => handleChange("canonical_url", e.target.value)}
          />
        </div>

        {/* Robots */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ui-fg-base">
            <Checkbox
              checked={form.robots_index}
              onCheckedChange={(checked) =>
                handleChange("robots_index", !!checked)
              }
            />
            <span>Allow Search Engines to Index</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ui-fg-base">
            <Checkbox
              checked={form.robots_follow}
              onCheckedChange={(checked) =>
                handleChange("robots_follow", !!checked)
              }
            />
            <span>Follow Links on this Page</span>
          </label>
        </div>

        {/* Open Graph */}
        <div className="pt-1">
          <Button
            variant="transparent"
            size="small"
            onClick={() => setShowSocial(!showSocial)}
            className="text-xs text-ui-fg-interactive flex items-center gap-1.5"
          >
            {showSocial ? "Hide" : "Show"} Social Media (OpenGraph) Overrides
          </Button>

          {showSocial && (
            <div className="mt-3 p-4 bg-ui-bg-subtle rounded-xl border border-ui-border-base space-y-3">
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">
                  OG Title
                </Label>
                <Input
                  placeholder="Title for social media sharing"
                  value={form.og_title}
                  onChange={(e) => handleChange("og_title", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">
                  OG Description
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Description for social media shares"
                  value={form.og_description}
                  onChange={(e) =>
                    handleChange("og_description", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label size="small" className="text-ui-fg-base">
                  OG Image URL
                </Label>
                <Input
                  placeholder="https://.../page-og.jpg (1200x630 recommended)"
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
        <Button
          variant="secondary"
          size="small"
          onClick={handleReset}
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
          {saving ? "Saving..." : "Save SEO"}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Pages Admin Page
// ---------------------------------------------------------------------------
const PagesAdminPage = () => {
  const [pages, setPages] = useState<PageEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPage, setSelectedPage] = useState<PageEntry | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/seo/pages", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch pages")
      const data = await res.json()
      setPages(data.pages || [])
    } catch (err: any) {
      toast.error(err.message || "Could not load pages")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const openSeoDrawer = (page: PageEntry) => {
    setSelectedPage(page)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      // Refresh to pick up any SEO changes
      fetchPages()
    }
  }

  const seoConfigured = pages.filter((p) => p.has_seo).length
  const totalPages = pages.length

  return (
    <Container className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ui-border-base pb-6">
        <div>
          <Heading level="h1">Pages</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Manage SEO metadata for your static storefront pages.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Badge color="grey">{totalPages} Pages</Badge>
          <StatusBadge color="green">
            {seoConfigured} / {totalPages} SEO Configured
          </StatusBadge>
        </div>
      </div>

      {/* Pages Table */}
      <div className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-base shadow-sm">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Page</Table.HeaderCell>
              <Table.HeaderCell>Path</Table.HeaderCell>
              <Table.HeaderCell>SEO Status</Table.HeaderCell>
              <Table.HeaderCell>Meta Title</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center py-12 text-ui-fg-muted"
                >
                  Loading pages...
                </Table.Cell>
              </Table.Row>
            ) : pages.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={5}
                  className="text-center py-12 text-ui-fg-muted"
                >
                  No pages registered.
                </Table.Cell>
              </Table.Row>
            ) : (
              pages.map((page) => (
                <Table.Row
                  key={page.handle}
                  className="hover:bg-ui-bg-subtle transition-colors cursor-pointer"
                  onClick={() => openSeoDrawer(page)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-ui-fg-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <Text
                          size="small"
                          weight="plus"
                          className="text-ui-fg-base"
                        >
                          {page.title}
                        </Text>
                        <Text
                          size="xsmall"
                          className="text-ui-fg-muted"
                        >
                          {page.description}
                        </Text>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <code className="text-xs bg-ui-bg-subtle px-2 py-1 rounded border border-ui-border-base">
                      {page.path}
                    </code>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={page.has_seo ? "green" : "grey"}>
                      {page.has_seo ? "Configured" : "Not Set"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      size="small"
                      className={
                        page.meta_title
                          ? "text-ui-fg-base"
                          : "text-ui-fg-muted italic"
                      }
                    >
                      {page.meta_title || "Using default"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        openSeoDrawer(page)
                      }}
                    >
                      Edit SEO
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* SEO Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={handleDrawerClose}>
        <Drawer.Content className="max-w-lg p-6">
          <Drawer.Header>
            <Drawer.Title>
              SEO: {selectedPage?.title}
            </Drawer.Title>
            <Drawer.Description>
              Edit search engine metadata for the {selectedPage?.title} page ({selectedPage?.path}).
            </Drawer.Description>
          </Drawer.Header>
          <div className="mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <PageSeoPanel
              page={selectedPage}
              open={isDrawerOpen}
              onSaved={fetchPages}
            />
          </div>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
})

export default PagesAdminPage

