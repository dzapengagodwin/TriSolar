import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { BULK_OPERATION_MODULE } from "../modules/bulk-operation"
import { BULK_ACTIONS } from "../modules/bulk-operation/utils/action-registry"

export type ProcessBulkOperationInput = {
  operationId: string
}

const MAX_ATTEMPTS = 3

// Step 1: Reclaim stale processing items from previous runs/crashes
export const reclaimStaleItemsStep = createStep(
  "reclaim-stale-items",
  async (input: { operationId: string }, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    // Find any items that were left in 'processing' status
    const staleItems = await bulkModule.listBulkOperationItems({
      operation_id: input.operationId,
      status: "processing",
    })

    if (staleItems.length > 0) {
      logger.info(`Reclaiming ${staleItems.length} stale processing items for operation ${input.operationId}`)
      
      const updates = staleItems.map((item: any) => {
        const nextAttempts = item.attempts + 1
        return {
          id: item.id,
          status: nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
          attempts: nextAttempts,
          error: nextAttempts >= MAX_ATTEMPTS ? "Reclaimed after worker process crash (Max attempts exceeded)" : "Reclaimed after worker process crash",
          processed_at: new Date(),
        }
      })

      await bulkModule.updateBulkOperationItems(updates)
    }

    return new StepResponse({ reclaimedCount: staleItems.length })
  }
)

// Step 2: Create Snapshot and populate operation items
export const createSnapshotStep = createStep(
  "create-snapshot",
  async (input: { operationId: string }, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    // 1. Fetch operation details
    const operation = await bulkModule.retrieveBulkOperation(input.operationId)
    if (!operation) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `BulkOperation with ID ${input.operationId} not found`
      )
    }

    if (operation.status !== "pending") {
      logger.warn(`BulkOperation ${input.operationId} is already in status ${operation.status}. Skipping snapshot.`)
      return new StepResponse({ snapshotCount: operation.total })
    }

    // 2. Resolve selection to get list of target product IDs
    const selection = operation.selection_data as any
    let targetIds: string[] = []

    if (selection.type === "ids") {
      targetIds = selection.ids || []
    } else if (selection.type === "filter") {
      const filters = selection.filters || {}
      const productFilters: any = {}

      if (filters.q) {
        productFilters.q = filters.q
      }
      if (filters.status && filters.status.length > 0) {
        productFilters.status = filters.status
      }
      if (filters.collection_id && filters.collection_id.length > 0) {
        productFilters.collection_id = filters.collection_id
      }
      if (filters.category_id && filters.category_id.length > 0) {
        productFilters.categories = { id: filters.category_id }
      }
      if (filters.brand_id && filters.brand_id.length > 0) {
        productFilters.brand = { id: filters.brand_id }
      }

      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: productFilters,
      })

      targetIds = (products || []).map((p: any) => p.id)
    }

    logger.info(`Resolved ${targetIds.length} target products for bulk operation ${input.operationId}`)

    // 3. Create BulkOperationItem records
    if (targetIds.length > 0) {
      const itemsToCreate = targetIds.map((id) => ({
        operation_id: input.operationId,
        entity_id: id,
        status: "pending",
        attempts: 0,
      }))

      await bulkModule.createBulkOperationItems(itemsToCreate)
    }

    // 4. Update parent operation total count, started_at, and transition to 'processing'
    await bulkModule.updateBulkOperations({
      id: input.operationId,
      total: targetIds.length,
      status: targetIds.length > 0 ? "processing" : "completed",
      started_at: new Date(),
    })

    return new StepResponse({ snapshotCount: targetIds.length })
  }
)

// Step 3: Process snapshot items in batches
export const executeBatchesStep = createStep(
  "execute-batches",
  async (input: { operationId: string }, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    // Retrieve active operation
    let operation = await bulkModule.retrieveBulkOperation(input.operationId)
    if (!operation || operation.status === "completed" || operation.status === "failed") {
      return new StepResponse({ status: "skipped" })
    }

    // Load action handler from registry
    const actionKey = `${operation.entity_type}:${operation.action}`
    const handler = BULK_ACTIONS[actionKey]
    if (!handler) {
      const errorMsg = `Action ${actionKey} is not registered in Action Registry`
      await bulkModule.updateBulkOperations({
        id: input.operationId,
        status: "failed",
        error: errorMsg,
        completed_at: new Date(),
      })
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        errorMsg
      )
    }

    // Main worker batch execution loop
    const batchSize = operation.batch_size || 50
    let stopProcessing = false

    while (!stopProcessing) {
      // 1. Check for cancellation requests
      operation = await bulkModule.retrieveBulkOperation(input.operationId)
      if (operation.status === "cancelling") {
        logger.info(`BulkOperation ${input.operationId} cancellation requested. Stopping engine.`)
        
        // Cancel all remaining pending/processing items
        const pendingItems = await bulkModule.listBulkOperationItems({
          operation_id: input.operationId,
          status: ["pending", "processing"],
        })

        if (pendingItems.length > 0) {
          const cancelUpdates = pendingItems.map((item: any) => ({
            id: item.id,
            status: "cancelled",
            processed_at: new Date(),
          }))
          await bulkModule.updateBulkOperationItems(cancelUpdates)
        }

        // Update overall counts and set status to cancelled
        const finalItems = await bulkModule.listBulkOperationItems({
          operation_id: input.operationId,
        })
        const successful = finalItems.filter((i: any) => i.status === "successful").length
        const failed = finalItems.filter((i: any) => i.status === "failed").length
        const cancelled = finalItems.filter((i: any) => i.status === "cancelled").length

        await bulkModule.updateBulkOperations({
          id: input.operationId,
          status: "cancelled",
          processed: successful + failed + cancelled,
          successful,
          failed,
          completed_at: new Date(),
        })

        stopProcessing = true
        break
      }

      // 2. Fetch next batch of pending items
      const pendingItems = await bulkModule.listBulkOperationItems(
        {
          operation_id: input.operationId,
          status: "pending",
        },
        {
          take: batchSize,
        }
      )

      if (pendingItems.length === 0) {
        logger.info(`BulkOperation ${input.operationId} has no more pending items. Completing.`)
        break
      }

      logger.info(`BulkOperation ${input.operationId}: Processing batch of ${pendingItems.length} items`)

      // 3. Claim items using atomic statuses to prevent concurrent execution
      const claimedItems = pendingItems.map((item: any) => ({
        id: item.id,
        status: "processing",
        attempts: item.attempts + 1,
        started_at: new Date(),
      }))
      await bulkModule.updateBulkOperationItems(claimedItems)

      // 4. Process items in batch
      const batchUpdates: any[] = []
      for (const item of pendingItems) {
        try {
          // Execute action handler on individual item
          const result = await handler.executeItem(item.entity_id, operation.payload, container)
          
          batchUpdates.push({
            id: item.id,
            status: result.success ? "successful" : "failed",
            error: result.error || null,
            previous_value: result.previousValue || null,
            new_value: result.newValue || null,
            processed_at: new Date(),
          })
        } catch (itemErr: any) {
          const isRetryable = item.attempts + 1 < MAX_ATTEMPTS
          batchUpdates.push({
            id: item.id,
            status: isRetryable ? "pending" : "failed",
            error: itemErr.message || String(itemErr),
            processed_at: new Date(),
          })
        }
      }

      // Save item execution statuses
      await bulkModule.updateBulkOperationItems(batchUpdates)

      // 5. Update progress counts on parent operation
      const currentItems = await bulkModule.listBulkOperationItems({
        operation_id: input.operationId,
      })

      const successfulCount = currentItems.filter((i: any) => i.status === "successful").length
      const failedCount = currentItems.filter((i: any) => i.status === "failed").length
      const cancelledCount = currentItems.filter((i: any) => i.status === "cancelled").length
      const processedCount = successfulCount + failedCount + cancelledCount

      await bulkModule.updateBulkOperations({
        id: input.operationId,
        processed: processedCount,
        successful: successfulCount,
        failed: failedCount,
      })
    }

    return new StepResponse({ status: "done" })
  }
)

// Step 4: Finalize operation status and completed_at timestamp
export const completeBulkOperationStep = createStep(
  "complete-bulk-operation",
  async (input: { operationId: string }, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    const operation = await bulkModule.retrieveBulkOperation(input.operationId)
    if (!operation || ["completed", "completed_with_errors", "cancelled", "failed"].includes(operation.status)) {
      return new StepResponse({ finalStatus: operation?.status || "unknown" })
    }

    const items = await bulkModule.listBulkOperationItems({
      operation_id: input.operationId,
    })

    const totalCount = items.length
    const successfulCount = items.filter((i: any) => i.status === "successful").length
    const failedCount = items.filter((i: any) => i.status === "failed").length
    const cancelledCount = items.filter((i: any) => i.status === "cancelled").length
    const processedCount = successfulCount + failedCount + cancelledCount

    let finalStatus = "completed"
    if (cancelledCount > 0) {
      finalStatus = "cancelled"
    } else if (failedCount > 0) {
      finalStatus = "completed_with_errors"
    } else if (totalCount === 0) {
      finalStatus = "completed"
    }

    logger.info(`Finalizing BulkOperation ${input.operationId} in status: ${finalStatus}`)

    await bulkModule.updateBulkOperations({
      id: input.operationId,
      status: finalStatus,
      processed: processedCount,
      successful: successfulCount,
      failed: failedCount,
      completed_at: new Date(),
    })

    return new StepResponse({ finalStatus })
  }
)

export const processBulkOperationWorkflow = createWorkflow(
  "process-bulk-operation",
  (input: ProcessBulkOperationInput) => {
    // 1. Reclaim any stale processing items
    reclaimStaleItemsStep(input)
    
    // 2. Create the immutable snapshot list of product IDs
    createSnapshotStep(input)
    
    // 3. Process items in claimed chunks of 50
    executeBatchesStep(input)
    
    // 4. Set terminal state status
    const result = completeBulkOperationStep(input)
    
    return new WorkflowResponse(result)
  }
)

export type CreateBulkOperationInput = {
  action: string
  entity_type: string
  selection_data: any
  payload: any
  batch_size: number
  created_by: string
}

export const createBulkOperationRecordStep = createStep(
  "create-bulk-operation-record",
  async (input: CreateBulkOperationInput, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const operation = await bulkModule.createBulkOperations(input)
    return new StepResponse(operation)
  }
)

export const createBulkOperationWorkflow = createWorkflow(
  "create-bulk-operation",
  (input: CreateBulkOperationInput) => {
    const operation = createBulkOperationRecordStep(input)
    return new WorkflowResponse(operation)
  }
)

export type CancelBulkOperationInput = {
  id: string
}

export const cancelBulkOperationRecordStep = createStep(
  "cancel-bulk-operation-record",
  async (input: CancelBulkOperationInput, { container }) => {
    const bulkModule: any = container.resolve(BULK_OPERATION_MODULE)
    const operation = await bulkModule.updateBulkOperations({
      id: input.id,
      status: "cancelling",
    })
    return new StepResponse(operation)
  }
)

export const cancelBulkOperationWorkflow = createWorkflow(
  "cancel-bulk-operation",
  (input: CancelBulkOperationInput) => {
    const operation = cancelBulkOperationRecordStep(input)
    return new WorkflowResponse(operation)
  }
)
