import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Heading } from "@medusajs/ui"

const BulkProductsButtonWidget = () => {
  return (
    <Container className="mb-4 flex items-center justify-between p-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg">
      <div className="flex flex-col gap-1">
        <Heading level="h2" className="text-base font-semibold">
          Bulk Operations Workspace ⚡
        </Heading>
        <p className="text-xs text-ui-fg-subtle">
          Perform batch updates on status, brand, categories, collections, and metadata across your catalog.
        </p>
      </div>
      <a href="/admin/bulk-products">
        <Button variant="primary" size="small">
          Open Bulk Workspace
        </Button>
      </a>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default BulkProductsButtonWidget
