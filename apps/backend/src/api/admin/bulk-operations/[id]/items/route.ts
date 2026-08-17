import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BULK_OPERATION_MODULE } from "../../../../../modules/bulk-operation"

export const AUTHENTICATE = true

// GET /admin/bulk-operations/:id/items - Get individual item results and execution errors
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const bulkModule = req.scope.resolve(BULK_OPERATION_MODULE)
  const { id } = req.params

  // 1. Verify operation exists
  const operation = await bulkModule.retrieveBulkOperation(id).catch(() => null)
  if (!operation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `BulkOperation with ID ${id} not found`
    )
  }

  const limit = Math.max(1, Number(req.query.limit) || 100)
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const status = req.query.status as string | undefined

  const filter: any = { operation_id: id }
  if (status) {
    filter.status = status
  }

  // 2. Fetch items count and list
  const [items, count] = await bulkModule.listAndCountBulkOperationItems(
    filter,
    {
      order: { processed_at: "DESC" },
      take: limit,
      skip: offset,
    }
  )

  return res.status(200).json({
    items,
    count,
    offset,
    limit,
  })
}
