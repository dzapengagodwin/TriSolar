import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BULK_OPERATION_MODULE } from "../../../../modules/bulk-operation"

export const AUTHENTICATE = true

// GET /admin/bulk-operations/:id - Fetch bulk operation details and progress counters
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const bulkModule = req.scope.resolve(BULK_OPERATION_MODULE)
  const { id } = req.params

  const operation = await bulkModule.retrieveBulkOperation(id).catch(() => null)

  if (!operation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `BulkOperation with ID ${id} not found`
    )
  }

  return res.status(200).json({
    operation,
  })
}
