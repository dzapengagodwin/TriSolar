import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  deleteCollectionsWorkflow,
  batchLinkProductsToCollectionWorkflow,
  updateCollectionsWorkflow,
} from "@medusajs/medusa/core-flows"

export type CollectionBatchActionType =
  | "delete"
  | "add_products"
  | "remove_products"
  | "update_metadata"

export type CollectionBatchActionBody = {
  collection_ids: string[]
  action: CollectionBatchActionType
  data?: {
    product_ids?: string[]
    metadata?: Record<string, unknown>
  }
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const body = req.body as CollectionBatchActionBody
  const { collection_ids, action, data } = body

  if (!collection_ids || !Array.isArray(collection_ids) || collection_ids.length === 0) {
    return res.status(400).json({ error: "collection_ids must be a non-empty array of collection IDs" })
  }

  if (!action) {
    return res.status(400).json({ error: "action is required" })
  }

  try {
    switch (action) {
      case "delete": {
        await deleteCollectionsWorkflow(req.scope).run({
          input: { ids: collection_ids },
        })
        return res.status(200).json({
          success: true,
          count: collection_ids.length,
          action,
          message: `Successfully deleted ${collection_ids.length} collections`,
        })
      }

      case "add_products": {
        if (!data?.product_ids || !Array.isArray(data.product_ids) || data.product_ids.length === 0) {
          return res.status(400).json({ error: "data.product_ids must be a non-empty array for add_products" })
        }

        for (const colId of collection_ids) {
          await batchLinkProductsToCollectionWorkflow(req.scope).run({
            input: {
              id: colId,
              add: data.product_ids,
            },
          })
        }

        return res.status(200).json({
          success: true,
          count: collection_ids.length,
          products_count: data.product_ids.length,
          action,
          message: `Successfully added ${data.product_ids.length} products across ${collection_ids.length} collections`,
        })
      }

      case "remove_products": {
        if (!data?.product_ids || !Array.isArray(data.product_ids) || data.product_ids.length === 0) {
          return res.status(400).json({ error: "data.product_ids must be a non-empty array for remove_products" })
        }

        for (const colId of collection_ids) {
          await batchLinkProductsToCollectionWorkflow(req.scope).run({
            input: {
              id: colId,
              remove: data.product_ids,
            },
          })
        }

        return res.status(200).json({
          success: true,
          count: collection_ids.length,
          products_count: data.product_ids.length,
          action,
          message: `Successfully removed ${data.product_ids.length} products across ${collection_ids.length} collections`,
        })
      }

      case "update_metadata": {
        if (!data?.metadata || typeof data.metadata !== "object") {
          return res.status(400).json({ error: "data.metadata must be an object for update_metadata" })
        }

        await updateCollectionsWorkflow(req.scope).run({
          input: {
            selector: { id: collection_ids },
            update: { metadata: data.metadata },
          },
        })

        return res.status(200).json({
          success: true,
          count: collection_ids.length,
          action,
          message: `Successfully updated metadata for ${collection_ids.length} collections`,
        })
      }

      default:
        return res.status(400).json({ error: `Unsupported action: ${action}` })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred during collection batch execution"
    return res.status(500).json({ error: message })
  }
}

