import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"

export type UpdateBrandingBody = {
  logo_url?: string | null
  app_name?: string
  welcome_title?: string | null
  welcome_subtitle?: string | null
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "name", "metadata.*"],
    })

    const store = stores?.[0]
    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    const metadata = (store.metadata as Record<string, unknown>) || {}
    const appName = (metadata.admin_app_name as string) || store.name || "LaptopZone"
    const logoUrl = (metadata.admin_logo_url as string) || null
    const welcomeTitle = (metadata.admin_welcome_title as string) || `Welcome to ${appName}`
    const welcomeSubtitle = (metadata.admin_welcome_subtitle as string) || "Sign in to access your admin dashboard"

    return res.status(200).json({
      branding: {
        logo_url: logoUrl,
        app_name: appName,
        welcome_title: welcomeTitle,
        welcome_subtitle: welcomeSubtitle,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve branding settings"
    return res.status(500).json({ error: message })
  }
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const body = req.body as UpdateBrandingBody

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "name", "metadata.*"],
    })

    const store = stores?.[0]
    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    const currentMetadata = (store.metadata as Record<string, unknown>) || {}
    const newAppName = body.app_name !== undefined ? body.app_name.trim() : (currentMetadata.admin_app_name as string) || store.name

    const updatedMetadata = {
      ...currentMetadata,
      admin_logo_url: body.logo_url !== undefined ? body.logo_url : currentMetadata.admin_logo_url ?? null,
      admin_app_name: newAppName,
      admin_welcome_title: body.welcome_title !== undefined ? body.welcome_title : currentMetadata.admin_welcome_title ?? `Welcome to ${newAppName}`,
      admin_welcome_subtitle: body.welcome_subtitle !== undefined ? body.welcome_subtitle : currentMetadata.admin_welcome_subtitle ?? "Sign in to access your admin dashboard",
    }

    await updateStoresWorkflow(req.scope).run({
      input: {
        selector: { id: store.id },
        update: {
          name: newAppName || store.name,
          metadata: updatedMetadata,
        },
      },
    })

    return res.status(200).json({
      success: true,
      branding: {
        logo_url: updatedMetadata.admin_logo_url,
        app_name: updatedMetadata.admin_app_name,
        welcome_title: updatedMetadata.admin_welcome_title,
        welcome_subtitle: updatedMetadata.admin_welcome_subtitle,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update branding settings"
    return res.status(500).json({ error: message })
  }
}
