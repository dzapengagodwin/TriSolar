import { HttpTypes } from "@medusajs/types"
import { event } from "./gtag"
import { GA4Item } from "./types"
import { getPricesForVariant } from "@lib/util/get-product-price"

/**
 * Extracts a clean brand name from a product if available.
 */
function getProductBrand(product: HttpTypes.StoreProduct): string | undefined {
  const brandObj = (product as unknown as Record<string, unknown>)?.brand as
    | { name?: string }
    | undefined
  return brandObj?.name || (product.metadata?.brand as string) || undefined
}

/**
 * Transforms a Medusa product into a standard GA4 Item.
 */
export function transformProductToGA4Item(
  product: HttpTypes.StoreProduct,
  variant?: HttpTypes.StoreProductVariant | null,
  quantity = 1
): GA4Item {
  const chosenVariant = variant || product.variants?.[0]
  const priceInfo = getPricesForVariant(chosenVariant)

  const categoryName = product.categories?.[0]?.name
  const brandName = getProductBrand(product)

  return {
    item_id: chosenVariant?.id || product.id,
    item_name: product.title,
    item_brand: brandName,
    item_category: categoryName,
    item_variant: chosenVariant?.title || undefined,
    price: priceInfo?.calculated_price_number || 0,
    quantity,
  }
}

/**
 * Transforms a Medusa cart line item or order line item into a standard GA4 Item.
 */
export function transformLineItemToGA4Item(
  item:
    | HttpTypes.StoreCartLineItem
    | HttpTypes.StoreOrderLineItem
    | Record<string, unknown>
): GA4Item {
  const id = (item.variant_id as string) || (item.id as string) || ""
  const title =
    (item.product_title as string) || (item.title as string) || "Unknown Item"
  const variantTitle = (item.variant_title as string) || undefined
  const quantity = typeof item.quantity === "number" ? item.quantity : 1
  const price = typeof item.unit_price === "number" ? item.unit_price : 0

  const product = (item as { product?: HttpTypes.StoreProduct }).product
  const brandName = product ? getProductBrand(product) : undefined
  const categoryName = product?.categories?.[0]?.name

  return {
    item_id: id,
    item_name: title,
    item_brand: brandName,
    item_category: categoryName,
    item_variant: variantTitle,
    price,
    quantity,
  }
}

/**
 * GA4 Event: view_item
 * Fired when a customer views a product details page.
 */
export function trackViewItem({
  product,
  variant,
  currency = "USD",
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant | null
  currency?: string
}) {
  const item = transformProductToGA4Item(product, variant, 1)

  event("view_item", {
    currency,
    value: item.price,
    items: [item],
  })
}

/**
 * GA4 Event: view_item_list
 * Fired when a customer views a collection, category, or search results list.
 */
export function trackViewItemList({
  items,
  listId,
  listName,
}: {
  items: GA4Item[]
  listId?: string
  listName?: string
}) {
  if (!items || items.length === 0) return

  event("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items,
  })
}

/**
 * GA4 Event: add_to_cart
 * Fired only after an item is successfully added to the cart.
 */
export function trackAddToCart({
  item,
  quantity = 1,
  currency = "USD",
}: {
  item: GA4Item
  quantity?: number
  currency?: string
}) {
  const price = item.price || 0
  const value = price * quantity

  event("add_to_cart", {
    currency,
    value,
    items: [{ ...item, quantity }],
  })
}

/**
 * GA4 Event: remove_from_cart
 * Fired only after an item is successfully removed from the cart.
 */
export function trackRemoveFromCart({
  item,
  quantity = 1,
  currency = "USD",
}: {
  item: GA4Item
  quantity?: number
  currency?: string
}) {
  const price = item.price || 0
  const value = price * quantity

  event("remove_from_cart", {
    currency,
    value,
    items: [{ ...item, quantity }],
  })
}

/**
 * GA4 Event: view_cart
 * Fired when a customer navigates to the shopping cart page.
 */
export function trackViewCart({
  items,
  total,
  currency = "USD",
}: {
  items: GA4Item[]
  total: number
  currency?: string
}) {
  event("view_cart", {
    currency,
    value: total,
    items,
  })
}

/**
 * GA4 Event: begin_checkout
 * Fired when a customer initiates checkout.
 */
export function trackBeginCheckout({
  items,
  total,
  currency = "USD",
}: {
  items: GA4Item[]
  total: number
  currency?: string
}) {
  event("begin_checkout", {
    currency,
    value: total,
    items,
  })
}

/**
 * GA4 Event: add_shipping_info
 * Fired when the customer confirms or changes their shipping tier.
 */
export function trackAddShippingInfo({
  items,
  total,
  currency = "USD",
  shippingTier,
}: {
  items: GA4Item[]
  total: number
  currency?: string
  shippingTier?: string
}) {
  event("add_shipping_info", {
    currency,
    value: total,
    shipping_tier: shippingTier,
    items,
  })
}

/**
 * GA4 Event: add_payment_info
 * Fired when the customer selects/confirms their payment method.
 */
export function trackAddPaymentInfo({
  items,
  total,
  currency = "USD",
  paymentType,
}: {
  items: GA4Item[]
  total: number
  currency?: string
  paymentType?: string
}) {
  event("add_payment_info", {
    currency,
    value: total,
    payment_type: paymentType,
    items,
  })
}

/**
 * GA4 Event: purchase
 * Fired upon successful order placement.
 */
export function trackPurchase({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  const items = (order.items || []).map((item) =>
    transformLineItemToGA4Item(item)
  )

  event("purchase", {
    transaction_id: order.id || String(order.display_id),
    value: order.total || 0,
    currency: order.currency_code?.toUpperCase() || "USD",
    tax: order.tax_total || 0,
    shipping: order.shipping_total || 0,
    items,
  })
}

