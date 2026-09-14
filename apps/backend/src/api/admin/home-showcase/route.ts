import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = true

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let collections: any[] = []

  try {
    const { data } = await query.graph({
      entity: "product_collection",
      fields: [
        "id",
        "title",
        "handle",
        "metadata",
        "created_at",
        "updated_at",
        "products.id",
      ],
      filters: {
        handle: {
          $like: "home-%",
        },
      },
    })
    collections = data || []
  } catch (_err) {
    // Fallback: Query all collections and filter in memory if $like operator is not supported by backend driver
    const { data } = await query.graph({
      entity: "product_collection",
      fields: [
        "id",
        "title",
        "handle",
        "metadata",
        "created_at",
        "updated_at",
        "products.id",
      ],
    })
    collections = (data || []).filter((c: any) =>
      c.handle?.toLowerCase().startsWith("home-")
    )
  }

  // Sort by priority ascending, then title
  collections.sort((a: any, b: any) => {
    const pA = Number(a.metadata?.priority ?? Number.MAX_SAFE_INTEGER)
    const pB = Number(b.metadata?.priority ?? Number.MAX_SAFE_INTEGER)
    if (pA !== pB) return pA - pB
    return (a.title || "").localeCompare(b.title || "")
  })

  return res.status(200).json({
    collections,
    count: collections.length,
  })
}

