import { Drawer, Button, Select, toast } from "@medusajs/ui"
import { useState } from "react"

export type BulkBrandDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  brands: Array<{ id: string; name: string }>
  onSuccess: () => void
}

export const BulkBrandDrawer = ({
  open,
  onClose,
  selectedIds,
  brands,
  onSuccess,
}: BulkBrandDrawerProps) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/products/batch-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product_ids: selectedIds,
          action: "update_brand",
          data: { brand_id: selectedBrandId === "none" ? null : selectedBrandId },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update brand")
      }

      toast.success("Brand Updated", {
        description: `Updated brand for ${selectedIds.length} products`,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error("Update Failed", {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(val) => !val && onClose()}>
      <Drawer.Content className="max-w-md">
        <Drawer.Header>
          <Drawer.Title>Assign Brand</Drawer.Title>
          <Drawer.Description>
            Assign or remove brand for {selectedIds.length} selected products.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Select Brand
            </label>
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
              <Select.Trigger>
                <Select.Value placeholder="Choose a brand..." />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">-- Remove Brand (Unlink) --</Select.Item>
                {brands.map((b) => (
                  <Select.Item key={b.id} value={b.id}>
                    {b.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!selectedBrandId}
          >
            Apply to {selectedIds.length} Products
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
