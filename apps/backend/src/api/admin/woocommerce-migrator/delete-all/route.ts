import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow, deleteReservationsWorkflow } from "@medusajs/medusa/core-flows"

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Delete reservations first to prevent inventory item deletion blocks
    try {
      const { data: reservations } = await query.graph({
        entity: "reservation",
        fields: ["id"],
      })

      if (reservations && reservations.length > 0) {
        const reservationIds = reservations.map((r: any) => r.id)
        await deleteReservationsWorkflow(req.scope).run({
          input: {
            ids: reservationIds,
          },
        })
      }
    } catch (resError: any) {
      console.warn("Reservation cleanup note:", resError?.message)
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
    })

    if (!products || products.length === 0) {
      return res.status(200).json({ deletedCount: 0, message: "No products found to delete." })
    }

    const productIds = products.map((p: any) => p.id)

    // Delete products in batches of 50
    const batchSize = 50
    let totalDeleted = 0

    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize)
      await deleteProductsWorkflow(req.scope).run({
        input: {
          ids: batch,
        },
      })
      totalDeleted += batch.length
    }

    return res.status(200).json({
      deletedCount: totalDeleted,
      message: `Successfully deleted ${totalDeleted} product(s).`,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
