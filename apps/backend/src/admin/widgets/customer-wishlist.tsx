import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Table,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"

type WishlistVariant = {
  id: string
  title?: string | null
  sku?: string | null
  product?: {
    id: string
    title?: string | null
    handle?: string | null
    thumbnail?: string | null
  } | null
}

type WishlistItem = {
  id: string
  wishlist_id: string
  product_id?: string | null
  product_variant_id: string
  created_at: string
  product_variant?: WishlistVariant | null
}

type CustomerWishlistWidgetProps = {
  data: {
    id: string
    email?: string
    first_name?: string
    last_name?: string
  }
}

const CustomerWishlistWidget = ({ data }: CustomerWishlistWidgetProps) => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    if (!data?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await sdk.client.fetch<{
        items: WishlistItem[]
        count: number
      }>(`/admin/customers/${data.id}/wishlist`, {
        method: "GET",
      })
      setItems(res.items || [])
    } catch (err) {
      console.error("Failed to fetch customer wishlist:", err)
      setError("Failed to load customer wishlist items.")
    } finally {
      setLoading(false)
    }
  }, [data?.id])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  return (
    <Container className="divide-y p-0 overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Heading level="h2">Customer Wishlist</Heading>
          {!loading && (
            <Badge size="2xsmall" color={items.length > 0 ? "blue" : "grey"}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <Text className="text-ui-fg-subtle text-sm">
            Loading wishlist items...
          </Text>
        ) : error ? (
          <Text className="text-ui-fg-error text-sm">{error}</Text>
        ) : items.length === 0 ? (
          <div className="py-6 text-center">
            <Text className="text-ui-fg-subtle text-sm">
              This customer has no saved items in their wishlist.
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Variant</Table.HeaderCell>
                <Table.HeaderCell>SKU</Table.HeaderCell>
                <Table.HeaderCell>Added On</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item) => {
                const product = item.product_variant?.product
                const variant = item.product_variant
                const formattedDate = new Date(item.created_at).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )

                return (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        {product?.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title || "Product"}
                            className="w-9 h-9 rounded object-contain border border-ui-border-base bg-ui-bg-subtle p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded border border-ui-border-base bg-ui-bg-subtle flex items-center justify-center text-xs text-ui-fg-muted shrink-0">
                            No img
                          </div>
                        )}
                        <span className="font-medium text-ui-fg-base text-xs">
                          {product?.title || "Unknown product"}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle">
                      {variant?.title || "Default"}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-muted">
                      {variant?.sku || "-"}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-muted">
                      {formattedDate}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {product?.id && (
                        <Link
                          to={`/products/${product.id}`}
                          className="text-xs font-semibold text-ui-fg-interactive hover:underline"
                        >
                          View Product
                        </Link>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerWishlistWidget

