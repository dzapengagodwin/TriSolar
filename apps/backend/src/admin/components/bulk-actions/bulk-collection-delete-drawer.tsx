import { Drawer, Button, Input, toast } from "@medusajs/ui"
import { useState } from "react"

export type BulkCollectionDeleteDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  onSuccess: () => void
}

export const BulkCollectionDeleteDrawer = ({
  open,
  onClose,
  selectedIds,
  onSuccess,
}: BulkCollectionDeleteDrawerProps) => {
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)

  const isConfirmed = confirmText.trim().toLowerCase() === "delete"

  const handleDelete = async () => {
    if (!isConfirmed) return

    setLoading(true)
    try {
      const res = await fetch("/admin/collections/batch-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          collection_ids: selectedIds,
          action: "delete",
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete collections")
      }

      toast.success("Collections Deleted", {
        description: `Permanently deleted ${selectedIds.length} collections`,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error("Deletion Failed", {
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
          <Drawer.Title className="text-ui-fg-error">Delete Collections</Drawer.Title>
          <Drawer.Description>
            Are you sure you want to delete {selectedIds.length} selected collections? This action cannot be undone.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="p-4 flex flex-col gap-4">
          <div className="bg-ui-bg-error-subtle border border-ui-border-error p-3 rounded-lg text-xs text-ui-fg-error">
            Warning: The selected collections will be permanently deleted. Products in these collections will not be deleted, but will no longer be linked to these collections.
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Type <span className="font-bold text-ui-fg-error">DELETE</span> to confirm:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={loading}
            disabled={!isConfirmed}
          >
            Delete {selectedIds.length} Collections
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
