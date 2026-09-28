import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Heading, Badge } from "@medusajs/ui"
import { Link } from "react-router-dom"

const BulkProductsButtonWidget = () => {
  return (
    <Container className="mb-4 flex items-center justify-between p-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Heading level="h2" className="text-base font-semibold">
            In-Table Bulk Operations Workspace
          </Heading>
          <Badge color="blue" size="small">WooCommerce Style</Badge>
        </div>
        <p className="text-xs text-ui-fg-subtle">
          Batch edit prices (+/- % or $), sale prices, stock status, quantities, quick edit rows, status, categories, and brands.
        </p>
      </div>
      <Link to="/bulk-products">
        <Button variant="primary" size="small">
          Open In-Table Bulk Workspace
        </Button>
      </Link>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default BulkProductsButtonWidget
