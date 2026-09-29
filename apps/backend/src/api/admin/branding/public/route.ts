import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const AUTHENTICATE = false

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "name", "metadata"],
    })

    const store = stores?.[0]
    const metadata = (store?.metadata as Record<string, unknown>) || {}

    const appName = (metadata.admin_app_name as string) || store?.name || "LaptopZone"
    const logoUrl = (metadata.admin_logo_url as string) || null
    const welcomeTitle = (metadata.admin_welcome_title as string) || `Welcome to ${appName}`
    const welcomeSubtitle = (metadata.admin_welcome_subtitle as string) || "Sign in to access your admin dashboard"

    return res.status(200).json({
      logo_url: logoUrl,
      app_name: appName,
      welcome_title: welcomeTitle,
      welcome_subtitle: welcomeSubtitle,
    })
  } catch (error) {
    return res.status(200).json({
      logo_url: null,
      app_name: "LaptopZone",
      welcome_title: "Welcome to LaptopZone",
      welcome_subtitle: "Sign in to access your admin dashboard",
    })
  }
}
