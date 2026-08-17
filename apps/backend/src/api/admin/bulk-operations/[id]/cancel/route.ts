import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BULK_OPERATION_MODULE } from "../../../../../modules/bulk-operation"

import { cancelBulkOperationWorkflow } from "../../../../../workflows/process-bulk-operation"

export const AUTHENTICATE = true

// POST /admin/bulk-operations/:id/cancel - Request bulk operation cancellation
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const bulkModule = req.scope.resolve(BULK_OPERATION_MODULE)
  const { id } = req.params

  // 1. Fetch operation
  const operation = await bulkModule.retrieveBulkOperation(id).catch(() => null)
  if (!operation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `BulkOperation with ID ${id} not found`
    )
  }

  // 2. Enforce active cancellable state
  const allowedStatus = ["pending", "processing"]
  if (!allowedStatus.includes(operation.status)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Cannot cancel operation in terminal state: ${operation.status}`
    )
  }

  // 3. Mark state as cancelling (worker will catch this at batch boundary)
  const { result: updated } = await cancelBulkOperationWorkflow(req.scope).run({
    input: {
      id,
    }
  })

  return res.status(200).json({
    message: "Cancellation request received. Halting future batches.",
    operation: updated,
  })
}
