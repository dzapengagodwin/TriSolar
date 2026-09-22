import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Table,
  Badge,
  Input,
  Drawer,
  toast,
  clx,
} from "@medusajs/ui"
import {
  Sparkles,
  Plus,
  PencilSquare,
  Trash,
  MagnifyingGlass,
  Photo,
  ArrowUpRightMini,
  Tag,
} from "@medusajs/icons"
import { MediaUploadField } from "../../components/media-upload-field"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"

type ProductCategory = {
  id: string
  name: string
  handle: string
}

type CollectionMetadata = {
  title?: string
  banner_image?: string
  bannerImage?: string
  category_handle?: string
  categoryHandle?: string
  view_all_href?: string
  viewAllHref?: string
  priority?: number | string
  [key: string]: unknown
}

const getCollectionMetadata = (meta?: Record<string, any> | null) => {
  if (!meta) {
    return {
      title: "",
      banner_image: "",
      category_handle: "",
      view_all_href: "",
      priority: 0,
    }
  }
  return {
    title: meta.title || "",
    banner_image: meta.banner_image || meta.bannerImage || meta.Bannerimage || "",
    category_handle: meta.category_handle || meta.categoryHandle || "",
    view_all_href: meta.view_all_href || meta.viewAllHref || "",
    priority: meta.priority ?? 0,
  }
}

type Collection = {
  id: string
  title: string
  handle: string
  created_at?: string
  updated_at?: string
  products?: { id: string }[]
  metadata?: CollectionMetadata | null
}

type SearchableCategorySelectProps = {
  categories: ProductCategory[]
  value: string
  onChange: (handle: string) => void
}

const SearchableCategorySelect = ({
  categories,
  value,
  onChange,
}: SearchableCategorySelectProps) => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedCategory = useMemo(
    () => categories.find((c) => c.handle === value),
    [categories, value]
  )

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.toLowerCase()
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    )
  }, [categories, query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative space-y-1">
      {selectedCategory && !isOpen ? (
        <div className="flex items-center justify-between px-3 py-2 border border-ui-border-base rounded-lg bg-ui-bg-base">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-ui-fg-interactive" />
            <span className="text-xs font-semibold text-ui-fg-base">
              {selectedCategory.name}
            </span>
            <span className="text-[11px] text-ui-fg-muted font-mono">
              ({selectedCategory.handle})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="transparent"
              size="small"
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-xs text-ui-fg-interactive hover:underline"
            >
              Change
            </Button>
            <Button
              variant="transparent"
              size="small"
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-ui-fg-muted hover:text-ui-fg-error"
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Input
              placeholder="Search category by name or handle..."
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              className="pl-8"
            />
            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted w-4 h-4 pointer-events-none" />
          </div>

          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-ui-bg-base border border-ui-border-base rounded-lg shadow-lg z-30 divide-y divide-ui-border-subtle">
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setIsOpen(false)
                    setQuery("")
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-ui-fg-error hover:bg-ui-bg-subtle transition-colors flex items-center justify-between"
                >
                  <span>Remove category link</span>
                  <span className="text-[10px]">None</span>
                </button>
              )}
              {filteredCategories.length === 0 ? (
                <div className="p-3 text-center text-xs text-ui-fg-muted">
                  No matching categories found
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = cat.handle === value
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onChange(cat.handle)
                        setIsOpen(false)
                        setQuery("")
                      }}
                      className={clx(
                        "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between hover:bg-ui-bg-subtle",
                        isSelected ? "bg-ui-bg-highlight font-semibold" : ""
                      )}
                    >
                      <span className="text-ui-fg-base">{cat.name}</span>
                      <span className="text-[11px] text-ui-fg-muted font-mono">
                        /categories/{cat.handle}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const HomeShowcasePage = () => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formTitle, setFormTitle] = useState("")
  const [formHandle, setFormHandle] = useState("")
  const [formDisplayTitle, setFormDisplayTitle] = useState("")
  const [formPriority, setFormPriority] = useState<number | string>(1)
  const [formBannerImage, setFormBannerImage] = useState("")
  const [formCategoryHandle, setFormCategoryHandle] = useState("")
  const [formViewAllHref, setFormViewAllHref] = useState("")

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/admin/product-categories?limit=250", {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.product_categories || [])
      }
    } catch (err) {
      console.error("Failed to load product categories:", err)
    }
  }, [])

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      let homeList: Collection[] = []
      const res = await fetch("/admin/home-showcase", {
        credentials: "include",
      })

      if (res.ok) {
        const data = await res.json()
        homeList = data.collections || []
      } else {
        // Fallback to standard admin collections endpoint with high limit if needed
        const fallbackRes = await fetch(
          "/admin/collections?limit=1000&fields=id,title,handle,metadata,+products.id",
          {
            credentials: "include",
          }
        )
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json()
          const all: Collection[] = fallbackData.collections || []
          homeList = all.filter((c) =>
            c.handle?.toLowerCase().startsWith("home-")
          )
        }
      }

      // Sort by priority ascending
      homeList.sort((a, b) => {
        const pA = Number(a.metadata?.priority ?? Number.MAX_SAFE_INTEGER)
        const pB = Number(b.metadata?.priority ?? Number.MAX_SAFE_INTEGER)
        if (pA !== pB) return pA - pB
        return a.title.localeCompare(b.title)
      })

      setCollections(homeList)
    } catch (err) {
      console.error("Failed to load collections:", err)
      toast.error("Error", { description: "Failed to load home collections" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
    fetchCategories()
  }, [fetchCollections, fetchCategories])

  const openEditDrawer = (col: Collection) => {
    setSelectedCollection(col)
    const meta = getCollectionMetadata(col.metadata)
    setFormTitle(col.title)
    setFormHandle(col.handle)
    setFormDisplayTitle(meta.title)
    setFormPriority(meta.priority !== 0 ? String(meta.priority) : "")
    setFormBannerImage(meta.banner_image)
    setFormCategoryHandle(meta.category_handle)
    setFormViewAllHref(meta.view_all_href)
    setIsEditOpen(true)
  }

  const openCreateDrawer = () => {
    // Propose default priority next in line
    const maxPriority = collections.reduce((max, c) => {
      const p = Number(c.metadata?.priority)
      return !isNaN(p) && p > max ? p : max
    }, 0)

    setFormTitle("")
    setFormHandle("home-")
    setFormDisplayTitle("")
    setFormPriority(maxPriority + 1)
    setFormBannerImage("")
    setFormCategoryHandle("")
    setFormViewAllHref("")
    setIsCreateOpen(true)
  }

  const handleCategoryChange = (handle: string) => {
    setFormCategoryHandle(handle)
    if (handle) {
      // Auto-set viewAllHref if empty or previously pointing to categories
      if (!formViewAllHref || formViewAllHref.startsWith("/categories/")) {
        setFormViewAllHref(`/categories/${handle}`)
      }
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollection) return

    setSaving(true)
    try {
      const existingMeta = selectedCollection.metadata || {}
      const priorityNum =
        formPriority !== "" && !isNaN(Number(formPriority))
          ? Number(formPriority)
          : undefined

      const updatedMetadata: Record<string, unknown> = {
        ...existingMeta,
        title: formDisplayTitle.trim() || undefined,
        banner_image: formBannerImage.trim() || undefined,
        bannerImage: formBannerImage.trim() || undefined,
        category_handle: formCategoryHandle.trim() || undefined,
        categoryHandle: formCategoryHandle.trim() || undefined,
        view_all_href: formViewAllHref.trim() || undefined,
        viewAllHref: formViewAllHref.trim() || undefined,
        priority: priorityNum,
      }

      // Clean undefined keys
      Object.keys(updatedMetadata).forEach((key) => {
        if (updatedMetadata[key] === undefined) {
          delete updatedMetadata[key]
        }
      })

      const res = await fetch(`/admin/collections/${selectedCollection.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formTitle.trim(),
          metadata: updatedMetadata,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update collection")
      }

      toast.success("Showcase Updated", {
        description: `Collection "${formTitle}" homepage settings saved.`,
      })
      setIsEditOpen(false)
      fetchCollections()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast.error("Error", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault()

    let cleanHandle = formHandle.trim().toLowerCase()
    if (!cleanHandle.startsWith("home-")) {
      cleanHandle = `home-${cleanHandle.replace(/^[^a-z0-9]+/, "")}`
    }

    if (!formTitle.trim()) {
      toast.error("Missing title", {
        description: "Please provide a collection title.",
      })
      return
    }

    setSaving(true)
    try {
      const priorityNum =
        formPriority !== "" && !isNaN(Number(formPriority))
          ? Number(formPriority)
          : collections.length + 1

      const metadata: Record<string, unknown> = {
        title: formDisplayTitle.trim() || undefined,
        banner_image: formBannerImage.trim() || undefined,
        bannerImage: formBannerImage.trim() || undefined,
        category_handle: formCategoryHandle.trim() || undefined,
        categoryHandle: formCategoryHandle.trim() || undefined,
        view_all_href: formViewAllHref.trim() || undefined,
        viewAllHref: formViewAllHref.trim() || undefined,
        priority: priorityNum,
      }

      Object.keys(metadata).forEach((key) => {
        if (metadata[key] === undefined) {
          delete metadata[key]
        }
      })

      const res = await fetch("/admin/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formTitle.trim(),
          handle: cleanHandle,
          metadata,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to create collection")
      }

      toast.success("Showcase Created", {
        description: `Created home collection "${cleanHandle}".`,
      })
      setIsCreateOpen(false)
      fetchCollections()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed"
      toast.error("Creation Error", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (col: Collection) => {
    if (
      !confirm(
        `Are you sure you want to delete the home showcase section "${col.title}" (${col.handle})?`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/admin/collections/${col.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete collection")
      }

      toast.success("Showcase Deleted", {
        description: `Removed collection "${col.title}".`,
      })
      fetchCollections()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      toast.error("Delete Error", { description: msg })
    }
  }

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections
    const q = searchQuery.toLowerCase()
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.metadata?.title?.toLowerCase().includes(q) ||
        c.metadata?.categoryHandle?.toLowerCase().includes(q)
    )
  }, [collections, searchQuery])

  return (
    <Container className="p-0 overflow-hidden divide-y divide-ui-border-base">
      {/* Top Header */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ui-bg-base">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-ui-fg-interactive w-5 h-5" />
            <Heading level="h1" className="text-xl">
              Home Showcase
            </Heading>
            <Badge size="2xsmall" color="blue">
              {collections.length} {collections.length === 1 ? "Section" : "Sections"}
            </Badge>
          </div>
          <Text className="text-xs text-ui-fg-subtle mt-1">
            Manage the featured product rails and clickable promo banners displayed on the storefront homepage.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="small"
            onClick={openCreateDrawer}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Showcase Section
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-ui-bg-subtle flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search home sections by title or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-ui-bg-base text-xs"
          />
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted w-3.5 h-3.5 pointer-events-none" />
        </div>
        <div className="text-xs text-ui-fg-muted">
          Sections are displayed top-to-bottom on the homepage ordered by{" "}
          <span className="font-semibold text-ui-fg-base">Priority</span>.
        </div>
      </div>

      {/* Table */}
      <div className="p-0">
        {loading ? (
          <div className="p-12 text-center text-xs text-ui-fg-muted">
            Loading homepage showcase sections...
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-ui-fg-muted mx-auto" />
            <Text className="text-sm font-medium text-ui-fg-base">
              No home showcase sections found
            </Text>
            <Text className="text-xs text-ui-fg-subtle max-w-md mx-auto">
              Any collection with a handle starting with{" "}
              <code className="bg-ui-bg-subtle px-1 rounded font-mono">home-</code>{" "}
              is automatically recognized as a homepage product rail.
            </Text>
            <Button
              variant="secondary"
              size="small"
              onClick={openCreateDrawer}
              className="mt-2"
            >
              Create your first section
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-16 text-center">
                  Priority
                </Table.HeaderCell>
                <Table.HeaderCell className="w-40">Banner</Table.HeaderCell>
                <Table.HeaderCell>Section & Title</Table.HeaderCell>
                <Table.HeaderCell>Linked Category</Table.HeaderCell>
                <Table.HeaderCell className="text-center">Products</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredCollections.map((col, idx) => {
                const meta = getCollectionMetadata(col.metadata)
                const priority = meta.priority || idx + 1
                const banner = meta.banner_image
                const displayTitle = meta.title || col.title
                const categoryHandle = meta.category_handle
                const viewAllHref =
                  meta.view_all_href ||
                  (categoryHandle
                    ? `/categories/${categoryHandle}`
                    : `/collections/${col.handle}`)
                const productCount = col.products?.length || 0

                return (
                  <Table.Row key={col.id} className="hover:bg-ui-bg-subtle/50">
                    {/* Priority Badge */}
                    <Table.Cell className="text-center">
                      <Badge
                        size="small"
                        color={priority <= 3 ? "blue" : "grey"}
                        className="font-mono font-semibold"
                      >
                        #{priority}
                      </Badge>
                    </Table.Cell>

                    {/* Banner Thumbnail */}
                    <Table.Cell>
                      {banner ? (
                        <div className="relative w-36 h-14 rounded-lg overflow-hidden border border-ui-border-base bg-ui-bg-subtle">
                          <img
                            src={banner}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-14 rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle flex flex-col items-center justify-center text-[10px] text-ui-fg-muted gap-0.5">
                          <Photo className="w-3.5 h-3.5 text-ui-fg-muted" />
                          <span>No Banner</span>
                        </div>
                      )}
                    </Table.Cell>

                    {/* Titles & Handle */}
                    <Table.Cell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-ui-fg-base flex items-center gap-1.5">
                          <span>{displayTitle}</span>
                          {col.metadata?.title && (
                            <Badge size="2xsmall" color="purple">
                              Custom Title
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-ui-fg-muted font-mono">
                          <span>{col.handle}</span>
                          <span>&bull;</span>
                          <span className="text-ui-fg-subtle truncate max-w-xs">
                            {viewAllHref}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Category Link */}
                    <Table.Cell>
                      {categoryHandle ? (
                        <Badge size="small" color="green" className="gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{categoryHandle}</span>
                        </Badge>
                      ) : (
                        <Text className="text-xs text-ui-fg-muted italic">
                          None (defaults to collection)
                        </Text>
                      )}
                    </Table.Cell>

                    {/* Product count */}
                    <Table.Cell className="text-center">
                      <a
                        href={`/app/collections/${col.id}`}
                        className="inline-flex items-center gap-1 text-xs text-ui-fg-interactive hover:underline font-medium"
                      >
                        <span>{productCount}</span>
                        <ArrowUpRightMini className="w-3 h-3" />
                      </a>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => openEditDrawer(col)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <PencilSquare className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="transparent"
                          size="small"
                          onClick={() => handleDelete(col)}
                          className="text-ui-fg-muted hover:text-ui-fg-error"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Edit Drawer */}
      <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Drawer.Content className="max-w-xl p-6 overflow-y-auto">
          <Drawer.Header>
            <Drawer.Title className="text-lg">
              Edit Showcase: {selectedCollection?.title}
            </Drawer.Title>
            <Drawer.Description className="text-xs text-ui-fg-subtle">
              Configure the banner, storefront headline, linked category, and order priority.
            </Drawer.Description>
          </Drawer.Header>

          <form onSubmit={handleSaveEdit} className="space-y-5 my-6">
            {/* Display Title */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Showcase Display Title
              </label>
              <Input
                placeholder="e.g. Gaming Gear & High-End Laptops"
                value={formDisplayTitle}
                onChange={(e) => setFormDisplayTitle(e.target.value)}
              />
              <Text className="text-[11px] text-ui-fg-muted mt-1">
                Overrides the collection name for the homepage banner rail headline.
              </Text>
            </div>

            {/* Collection Base Title */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Collection Name (Admin Internal)
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            {/* Priority Number */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Homepage Priority (Sort Order)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
              />
              <Text className="text-[11px] text-ui-fg-muted mt-1">
                Lower numbers appear higher on the homepage (1 is first, 2 is second, etc.).
              </Text>
            </div>

            {/* Banner Image Uploader */}
            <div className="pt-2 border-t border-ui-border-base">
              <MediaUploadField
                value={formBannerImage}
                onChange={setFormBannerImage}
                label="Promo Banner Image"
                aspectRatio="banner"
              />
            </div>

            {/* Category Selector */}
            <div className="pt-2 border-t border-ui-border-base">
              <label className="text-xs font-semibold text-ui-fg-base mb-1.5 block">
                Linked Store Category
              </label>
              <SearchableCategorySelect
                categories={categories}
                value={formCategoryHandle}
                onChange={handleCategoryChange}
              />
              <Text className="text-[11px] text-ui-fg-muted mt-1">
                Selecting a category automatically sets the &quot;View All&quot; link and header navigation target.
              </Text>
            </div>

            {/* Custom View All Link */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                &quot;View All&quot; Destination URL
              </label>
              <Input
                placeholder="/categories/laptops"
                value={formViewAllHref}
                onChange={(e) => setFormViewAllHref(e.target.value)}
              />
              <Text className="text-[11px] text-ui-fg-muted mt-1">
                The URL users are taken to when clicking the banner or the &quot;View All&quot; link.
              </Text>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Showcase"}
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>

      {/* Create Drawer */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Drawer.Content className="max-w-xl p-6 overflow-y-auto">
          <Drawer.Header>
            <Drawer.Title className="text-lg">
              New Homepage Showcase Section
            </Drawer.Title>
            <Drawer.Description className="text-xs text-ui-fg-subtle">
              Create a new Medusa collection configured to display on the storefront homepage.
            </Drawer.Description>
          </Drawer.Header>

          <form onSubmit={handleCreateShowcase} className="space-y-5 my-6">
            {/* Collection Title */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Collection Title *
              </label>
              <Input
                placeholder="e.g. Ultrawide Monitors"
                value={formTitle}
                onChange={(e) => {
                  const val = e.target.value
                  setFormTitle(val)
                  // Auto-suggest handle if it was default
                  if (formHandle === "home-" || !formHandle) {
                    const slug = val
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                    setFormHandle(slug ? `home-${slug}` : "home-")
                  }
                }}
                required
              />
            </div>

            {/* Handle */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Handle (Must start with <code className="font-mono text-ui-fg-interactive">home-</code>)
              </label>
              <Input
                placeholder="home-monitors"
                value={formHandle}
                onChange={(e) => setFormHandle(e.target.value)}
                required
              />
              <Text className="text-[11px] text-ui-fg-muted mt-1">
                The storefront queries all collections prefixed with <code className="font-mono">home-</code>.
              </Text>
            </div>

            {/* Display Title */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Headline / Display Title
              </label>
              <Input
                placeholder="e.g. Ultrawide Gaming & Productivity Monitors"
                value={formDisplayTitle}
                onChange={(e) => setFormDisplayTitle(e.target.value)}
              />
            </div>

            {/* Priority Number */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Priority Rank
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
              />
            </div>

            {/* Banner Image Uploader */}
            <div className="pt-2 border-t border-ui-border-base">
              <MediaUploadField
                value={formBannerImage}
                onChange={setFormBannerImage}
                label="Promo Banner Image"
                aspectRatio="banner"
              />
            </div>

            {/* Category Selector */}
            <div className="pt-2 border-t border-ui-border-base">
              <label className="text-xs font-semibold text-ui-fg-base mb-1.5 block">
                Linked Store Category
              </label>
              <SearchableCategorySelect
                categories={categories}
                value={formCategoryHandle}
                onChange={handleCategoryChange}
              />
            </div>

            {/* Custom View All Link */}
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                &quot;View All&quot; Link URL
              </label>
              <Input
                placeholder="/categories/monitors"
                value={formViewAllHref}
                onChange={(e) => setFormViewAllHref(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Creating Section..." : "Create Showcase Section"}
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Home Showcase",
  icon: Sparkles,
})

export default HomeShowcasePage

