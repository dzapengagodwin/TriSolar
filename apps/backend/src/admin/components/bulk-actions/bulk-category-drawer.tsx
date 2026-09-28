import { Drawer, Button, Select, toast } from "@medusajs/ui"
import { useState } from "react"

export type BulkCategoryDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  categories: Array<{ id: string; name: string }>
  onSuccess: () => void
}

export const BulkCategoryDrawer = ({
  open,
  onClose,
  selectedIds,
  categories,
  onSuccess,
}: BulkCategoryDrawerProps) => {
  const [categoryId, setCategoryId] = useState<string>("")
  const [operation, setOperation] = useState<"add" | "remove">("add")
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
          action: operation === "add" ? "add_category" : "remove_category",
          data: { category_id: categoryId },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update category")
      }

      toast.success("Category Updated", {
        description: `${operation === "add" ? "Added to" : "Removed from"} category for ${selectedIds.length} products`,
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
          <Drawer.Title>Manage Categories</Drawer.Title>
          <Drawer.Description>
            Add or remove a category for {selectedIds.length} selected products.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Action
            </label>
            <Select value={operation} onValueChange={(val: any) => setOperation(val)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="add">Add Category to Selected Products</Select.Item>
                <Select.Item value="remove">Remove Category from Selected Products</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Target Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <Select.Trigger>
                <Select.Value placeholder="Select category..." />
              </Select.Trigger>
              <Select.Content>
                {categories.map((c) => (
                  <Select.Item key={c.id} value={c.id}>
                    {c.name}
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
            disabled={!categoryId}
          >
            Apply to {selectedIds.length} Products
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
