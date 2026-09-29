import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Swatch } from "@medusajs/icons"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { Link } from "react-router-dom"

type StoreBrandingWidgetProps = {
  data: {
    id: string
    name?: string
    metadata?: Record<string, unknown>
  }
}

const StoreBrandingWidget = ({ data }: StoreBrandingWidgetProps) => {
  const metadata = data?.metadata || {}
  const logoUrl = (metadata.admin_logo_url as string) || null
  const appName = (metadata.admin_app_name as string) || data?.name || "LaptopZone"
  const welcomeTitle = (metadata.admin_welcome_title as string) || `Welcome to ${appName}`

  return (
    <Container className="p-0 overflow-hidden divide-y divide-ui-border-base border border-ui-border-base rounded-xl bg-ui-bg-base mt-4">
      <div className="flex items-center justify-between px-6 py-4 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-base">
            <Swatch className="w-5 h-5" />
          </div>
          <div>
            <Heading level="h2" className="text-base font-semibold">
              Admin & Sign-in Branding
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Custom logo, welcome messaging, and admin dashboard titles.
            </Text>
          </div>
        </div>

        <Link to="/settings/branding">
          <Button variant="secondary" size="small">
            Configure Branding
          </Button>
        </Link>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-ui-bg-subtle border border-ui-border-base rounded-lg flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-ui-fg-muted font-medium">Default</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-ui-fg-subtle">Sign-in Logo</span>
            <span className="text-sm font-semibold text-ui-fg-base">
              {logoUrl ? "Custom Logo Active" : "Default Medusa Avatar"}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-ui-fg-subtle">Sign-in Welcome Headline</span>
          <span className="text-sm font-semibold text-ui-fg-base truncate">
            {welcomeTitle}
          </span>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "store.details.after",
})

export default StoreBrandingWidget

