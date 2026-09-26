import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function storefrontCacheInvalidationHandler({
  event: { name, data },
  container,
}: SubscriberArgs<Record<string, any>>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const storefrontUrl =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_STOREFRONT_URL ||
    "http://localhost:8000"

  const revalidationSecret = process.env.REVALIDATION_SECRET

  if (!revalidationSecret) {
    logger.warn(
      "[Cache Invalidation] REVALIDATION_SECRET is not configured in backend environment. Skipping storefront cache notification."
    )
    return
  }

  let productId: string | undefined
  let handle: string | undefined
  let categoryId: string | undefined
  let collectionId: string | undefined

  if (name.startsWith("product-category.")) {
    categoryId = data.id
  } else if (name.startsWith("product-collection.")) {
    collectionId = data.id
  } else if (name.startsWith("product-variant.")) {
    productId = data.product_id
  } else if (name.startsWith("product.")) {
    productId = data.id
    // Try to enrich product handle if product exists
    if (name !== "product.deleted" && productId) {
      try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data: products } = await query.graph({
          entity: "product",
          fields: ["id", "handle", "categories.id", "collection_id"],
          filters: { id: productId },
        })
        if (products?.[0]) {
          handle = products[0].handle
          categoryId = products[0].categories?.[0]?.id
          collectionId = products[0].collection_id ?? undefined
        }
      } catch {
        // Fallback gracefully if query fails or product was deleted
      }
    }
  }

  const endpoint = `${storefrontUrl.replace(/\/$/, "")}/api/revalidate`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidation-secret": revalidationSecret,
      },
      body: JSON.stringify({
        event: name,
        product_id: productId,
        handle,
        category_id: categoryId,
        collection_id: collectionId,
        data,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      logger.error(
        `[Cache Invalidation] Webhook to ${endpoint} failed with status ${response.status}: ${errorText}`
      )
      return
    }

    const result = await response.json().catch(() => ({}))
    logger.info(
      `[Cache Invalidation] Successfully notified storefront for event ${name}. Invalidated tags: ${result.tags?.join(", ") || "none"}`
    )
  } catch (error: any) {
    logger.error(
      `[Cache Invalidation] Network error calling ${endpoint} for event ${name}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
    "inventory-item.updated",
    "inventory-level.updated",
    "price-list.created",
    "price-list.updated",
    "price-list.deleted",
  ],
}

