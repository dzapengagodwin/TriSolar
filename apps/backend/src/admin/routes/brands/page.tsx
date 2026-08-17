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
  StatusBadge,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

const BrandsAdminPage = () => {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer / Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

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
            Manage your store's hardware and device brands, logos, and catalog relationships.
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
                  No brands found. Click "+ Add Brand" or import products via WooCommerce Migrator to automatically populate.
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
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Logo URL
              </label>
              <Input
                placeholder="https://..."
                value={formLogo}
                onChange={(e) => setFormLogo(e.target.value)}
              />
            </div>
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
        <Drawer.Content className="max-w-md p-6">
          <Drawer.Header>
            <Drawer.Title>Edit Brand: {selectedBrand?.name}</Drawer.Title>
            <Drawer.Description>
              Update brand information and details.
            </Drawer.Description>
          </Drawer.Header>
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
            <div>
              <label className="text-xs font-semibold text-ui-fg-base mb-1 block">
                Logo URL
              </label>
              <Input
                value={formLogo}
                onChange={(e) => setFormLogo(e.target.value)}
              />
            </div>
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
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsAdminPage
