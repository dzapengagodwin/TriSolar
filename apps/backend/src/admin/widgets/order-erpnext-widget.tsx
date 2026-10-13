import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray, ArrowPath, DocumentText, CheckCircle } from "@medusajs/icons"
import { Container, Heading, Text, Button, Badge, StatusBadge, toast } from "@medusajs/ui"
import { useState } from "react"

type OrderData = {
  id: string
  display_id?: number
  metadata?: Record<string, any>
}

type OrderErpnextWidgetProps = {
  data: OrderData
}

const OrderErpnextWidget = ({ data }: OrderErpnextWidgetProps) => {
  const [salesOrderId, setSalesOrderId] = useState<string | null>(
    data.metadata?.erpnext_sales_order_id || null
  )
  const [syncing, setSyncing] = useState(false)

  const handleDownloadPdf = () => {
    window.open(`/admin/erpnext/orders/${data.id}/sales-order-pdf`, "_blank")
  }

  const handleSyncSalesOrder = async () => {
    setSyncing(true)
    try {
      const res = await fetch(`/admin/erpnext/orders/${data.id}/sync-sales-order`, {
        method: "POST",
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setSalesOrderId(result.salesOrderId)
        toast.success("ERPNext Sales Order", {
          description: `Sales Order ${result.salesOrderId} created in ERPNext.`,
        })
      } else {
        toast.error("ERPNext Sync Failed", {
          description: result.error || "Could not create Sales Order in ERPNext.",
        })
      }
    } catch (err: any) {
      toast.error("Sync Error", { description: err.message })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Container className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentText className="w-5 h-5 text-ui-fg-interactive" />
          <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
            ERPNext Sales Order
          </Heading>
        </div>
        <StatusBadge color={salesOrderId ? "green" : "orange"}>
          {salesOrderId ? "Synced" : "Not Synced"}
        </StatusBadge>
      </div>

      {salesOrderId ? (
        <div className="space-y-3">
          <div className="p-3 bg-ui-bg-base rounded border border-ui-border-base flex items-center justify-between">
            <div>
              <Text className="text-xs text-ui-fg-muted">Sales Order Reference</Text>
              <Text className="font-mono text-sm font-medium text-ui-fg-base">{salesOrderId}</Text>
            </div>
            <CheckCircle className="w-5 h-5 text-ui-fg-interactive" />
          </div>

          <div className="flex items-center gap-2">
            <Button size="small" variant="primary" onClick={handleDownloadPdf}>
              <ArrowDownTray className="w-4 h-4 mr-1" />
              Download Sales Order PDF
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={handleSyncSalesOrder}
              disabled={syncing}
            >
              <ArrowPath className="w-4 h-4 mr-1" />
              {syncing ? "Re-syncing..." : "Re-sync"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Text className="text-xs text-ui-fg-subtle">
            This order has not been submitted to ERPNext as a Sales Order yet.
          </Text>
          <Button
            size="small"
            variant="primary"
            onClick={handleSyncSalesOrder}
            disabled={syncing}
          >
            {syncing ? "Creating in ERPNext..." : "Create Sales Order & Get PDF"}
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderErpnextWidget

