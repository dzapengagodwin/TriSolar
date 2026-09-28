import { Drawer, Button, Select, Input, Switch, Label, toast } from "@medusajs/ui"
import { useState } from "react"

export type BulkPricingDrawerProps = {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  onSuccess: () => void
}

export const BulkPricingDrawer = ({
  open,
  onClose,
  selectedIds,
  onSuccess,
}: BulkPricingDrawerProps) => {
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [direction, setDirection] = useState<"increase" | "decrease">("increase")
  const [amount, setAmount] = useState<string>("10")
  const [round, setRound] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Invalid amount", { description: "Please enter a positive number" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/admin/products/batch-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product_ids: selectedIds,
          action: "adjust_pricing",
          data: {
            pricing: {
              type,
              direction,
              amount: numAmount,
              round,
            },
          },
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to adjust prices")
      }

      const result = await res.json()
      toast.success("Prices Updated", {
        description: result.message || `Updated prices for ${selectedIds.length} products`,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error("Pricing Update Failed", {
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
          <Drawer.Title>Adjust Pricing</Drawer.Title>
          <Drawer.Description>
            Update prices across all variants for {selectedIds.length} selected products.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Adjustment Mode
            </label>
            <Select value={direction} onValueChange={(val: any) => setDirection(val)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="increase">Increase Prices (+)</Select.Item>
                <Select.Item value="decrease">Decrease / Discount Prices (-)</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Calculation Type
            </label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="percentage">Percentage (%)</Select.Item>
                <Select.Item value="fixed">Fixed Currency Amount ($)</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ui-fg-base">
              Amount ({type === "percentage" ? "%" : "$"})
            </label>
            <Input
              type="number"
              min="0.1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === "percentage" ? "e.g. 10" : "e.g. 5.00"}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-ui-border-base">
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-ui-fg-base">Round Prices</Label>
              <span className="text-xs text-ui-fg-muted">
                Round final price to whole dollar (.00)
              </span>
            </div>
            <Switch checked={round} onCheckedChange={setRound} />
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
          >
            Apply to {selectedIds.length} Products
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
