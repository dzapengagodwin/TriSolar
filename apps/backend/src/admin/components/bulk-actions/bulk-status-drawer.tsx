import { Drawer, Button, Select, toast } from "@medusajs/ui"
import { useState } from "react"

export type BulkStatusDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  onSuccess: () => void
}

export const BulkStatusDrawer = ({
  open,
  onClose,
  selectedIds,
  onSuccess,
}: BulkStatusDrawerProps) => {
  const [status, setStatus] = useState<"published" | "draft">("published")
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
          action: "update_status",
          data: { status },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update status")
      }

      toast.success("Products Updated", {
        description: `Updated ${selectedIds.length} products to ${status}`,
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
          <Drawer.Title>Update Product Status</Drawer.Title>
          <Drawer.Description>
            Change status for {selectedIds.length} selected products.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              New Status
            </label>
            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="published">Published</Select.Item>
                <Select.Item value="draft">Draft</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Apply to {selectedIds.length} Products
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
