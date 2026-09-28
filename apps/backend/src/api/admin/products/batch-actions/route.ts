import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  deleteProductsWorkflow,
  batchLinkProductsToCategoryWorkflow,
  batchLinkProductsToCollectionWorkflow,
  upsertVariantPricesWorkflow,
} from "@medusajs/medusa/core-flows"
import { linkProductBrandWorkflow } from "../../../../workflows/link-product-brand"

export type BatchActionType =
  | "update_status"
  | "update_brand"
  | "add_category"
  | "remove_category"
  | "add_collection"
  | "remove_collection"
  | "adjust_pricing"
  | "delete"

export type BatchActionBody = {
  product_ids: string[]
  action: BatchActionType
  data?: {
    status?: ProductStatus
    brand_id?: string | null
    category_id?: string
    collection_id?: string
    pricing?: {
      type: "percentage" | "fixed"
      direction?: "increase" | "decrease"
      amount: number
      round?: boolean
      currency_code?: string
    }
  }
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const body = req.body as BatchActionBody
  const { product_ids, action, data } = body

  if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({ error: "product_ids must be a non-empty array of product IDs" })
  }

  if (!action) {
    return res.status(400).json({ error: "action is required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    switch (action) {
      case "update_status": {
        if (!data?.status) {
          return res.status(400).json({ error: "data.status is required for update_status" })
        }
        await updateProductsWorkflow(req.scope).run({
          input: {
            selector: { id: product_ids },
            update: { status: data.status },
          },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully updated status to '${data.status}' for ${product_ids.length} products`,
        })
      }

      case "delete": {
        await deleteProductsWorkflow(req.scope).run({
          input: { ids: product_ids },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully deleted ${product_ids.length} products`,
        })
      }

      case "add_category": {
        if (!data?.category_id) {
          return res.status(400).json({ error: "data.category_id is required for add_category" })
        }
        await batchLinkProductsToCategoryWorkflow(req.scope).run({
          input: {
            id: data.category_id,
            add: product_ids,
          },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully added ${product_ids.length} products to category`,
        })
      }

      case "remove_category": {
        if (!data?.category_id) {
          return res.status(400).json({ error: "data.category_id is required for remove_category" })
        }
        await batchLinkProductsToCategoryWorkflow(req.scope).run({
          input: {
            id: data.category_id,
            remove: product_ids,
          },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully removed ${product_ids.length} products from category`,
        })
      }

      case "add_collection": {
        if (!data?.collection_id) {
          return res.status(400).json({ error: "data.collection_id is required for add_collection" })
        }
        await batchLinkProductsToCollectionWorkflow(req.scope).run({
          input: {
            id: data.collection_id,
            add: product_ids,
          },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully added ${product_ids.length} products to collection`,
        })
      }

      case "remove_collection": {
        if (!data?.collection_id) {
          return res.status(400).json({ error: "data.collection_id is required for remove_collection" })
        }
        await batchLinkProductsToCollectionWorkflow(req.scope).run({
          input: {
            id: data.collection_id,
            remove: product_ids,
          },
        })
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: `Successfully removed ${product_ids.length} products from collection`,
        })
      }

      case "update_brand": {
        const brandId = data?.brand_id ?? null
        for (const productId of product_ids) {
          await linkProductBrandWorkflow(req.scope).run({
            input: {
              productId,
              brandId,
            },
          })
        }
        return res.status(200).json({
          success: true,
          count: product_ids.length,
          action,
          message: brandId
            ? `Successfully assigned brand to ${product_ids.length} products`
            : `Successfully unlinked brand from ${product_ids.length} products`,
        })
      }

      case "adjust_pricing": {
        const pricing = data?.pricing
        if (!pricing || typeof pricing.amount !== "number" || pricing.amount <= 0) {
          return res.status(400).json({ error: "Valid pricing.amount is required for adjust_pricing" })
        }

        const { data: products } = await query.graph({
          entity: "product",
          fields: [
            "id",
            "variants.id",
            "variants.prices.id",
            "variants.prices.amount",
            "variants.prices.currency_code",
            "variants.prices.rules.*",
          ],
          filters: { id: product_ids },
        })

        const priceUpdates: Array<{
          id?: string
          variant_id: string
          amount: number
          currency_code: string
        }> = []

        for (const product of products) {
          const variants = (product as any).variants || []
          for (const variant of variants) {
            const prices = variant.prices || []
            for (const price of prices) {
              if (pricing.currency_code && price.currency_code?.toLowerCase() !== pricing.currency_code.toLowerCase()) {
                continue
              }

              let currentAmount = Number(price.amount)
              let newAmount = currentAmount

              if (pricing.type === "percentage") {
                const delta = (currentAmount * pricing.amount) / 100
                newAmount = pricing.direction === "decrease"
                  ? Math.max(0, currentAmount - delta)
                  : currentAmount + delta
              } else if (pricing.type === "fixed") {
                const deltaInCents = Math.round(pricing.amount * 100)
                newAmount = pricing.direction === "decrease"
                  ? Math.max(0, currentAmount - deltaInCents)
                  : currentAmount + deltaInCents
              }

              if (pricing.round) {
                newAmount = Math.round(newAmount / 100) * 100
              } else {
                newAmount = Math.round(newAmount)
              }

              if (newAmount !== currentAmount) {
                priceUpdates.push({
                  id: price.id,
                  variant_id: variant.id,
                  amount: newAmount,
                  currency_code: price.currency_code,
                })
              }
            }
          }
        }

        if (priceUpdates.length > 0) {
          await upsertVariantPricesWorkflow(req.scope).run({
            input: {
              prices: priceUpdates,
            },
          })
        }

        return res.status(200).json({
          success: true,
          count: product_ids.length,
          variants_updated: priceUpdates.length,
          action,
          message: `Successfully adjusted ${priceUpdates.length} price entries across ${product_ids.length} products`,
        })
      }

      default:
        return res.status(400).json({ error: `Unsupported action: ${action}` })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred during batch execution"
    return res.status(500).json({ error: message })
  }
}
