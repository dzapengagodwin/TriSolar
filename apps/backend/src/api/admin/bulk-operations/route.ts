import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { BULK_OPERATION_MODULE } from "../../../modules/bulk-operation"
import { BULK_ACTIONS } from "../../../modules/bulk-operation/utils/action-registry"
import { processBulkOperationWorkflow, createBulkOperationWorkflow } from "../../../workflows/process-bulk-operation"

export const AUTHENTICATE = true

// GET /admin/bulk-operations - List bulk operations history
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const bulkModule = req.scope.resolve(BULK_OPERATION_MODULE)

  const limit = Math.max(1, Number(req.query.limit) || 50)
  const offset = Math.max(0, Number(req.query.offset) || 0)

  const [operations, count] = await bulkModule.listAndCountBulkOperations(
    {},
    {
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    }
  )

  return res.status(200).json({
    operations,
    count,
    offset,
    limit,
  })
}

// POST /admin/bulk-operations - Start a new bulk operation
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const bulkModule = req.scope.resolve(BULK_OPERATION_MODULE)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const { action, entity_type = "product", selection_data, payload, batch_size = 50 } = req.body as {
    action: string
    entity_type?: string
    selection_data: {
      type: "ids" | "filter"
      ids?: string[]
      filters?: any
    }
    payload: any
    batch_size?: number
  }

  // 1. Authenticated check
  const createdBy = (req as any).auth_user?.app_metadata?.user_id
  if (!createdBy) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Unauthorized: Admin user credentials are required"
    )
  }

  // 2. Validate action existence in registry
  const actionKey = `${entity_type}:${action}`
  const actionHandler = BULK_ACTIONS[actionKey]
  if (!actionHandler) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Action ${actionKey} is not registered in the Action Registry`
    )
  }

  // 3. Validate selection structure
  if (!selection_data || !["ids", "filter"].includes(selection_data.type)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "selection_data.type must be either 'ids' or 'filter'"
    )
  }

  if (selection_data.type === "ids" && (!Array.isArray(selection_data.ids) || selection_data.ids.length === 0)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "selection_data.ids must be a non-empty array of strings"
    )
  }

  // 4. Action-specific payload validation
  const validationResult = actionHandler.validate(payload)
  if (validationResult !== true) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Payload validation failed: ${validationResult}`
    )
  }

  // 5. Create operation record atomicaly in database
  const { result: operation } = await createBulkOperationWorkflow(req.scope).run({
    input: {
      action,
      entity_type,
      selection_data,
      payload,
      batch_size,
      created_by: createdBy,
    }
  })

  logger.info(`Starting asynchronous bulk operation: ${operation.id} (${actionKey})`)

  // 6. Launch the background workflow task (non-blocking)
  processBulkOperationWorkflow(req.scope)
    .run({
      input: {
        operationId: operation.id,
      },
    })
    .catch((err) => {
      logger.error(`Failed to process bulk operation workflow ${operation.id}: ${err.message}`)
    })

  // 7. Return 202 Accepted
  return res.status(202).json({
    message: "Bulk operation enqueued successfully",
    operation,
  })
}
