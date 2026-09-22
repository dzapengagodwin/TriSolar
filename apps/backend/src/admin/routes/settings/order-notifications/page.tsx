import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  BellAlert,
  ArrowPath,
  InformationCircle,
  Mailbox,
} from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Badge,
  toast,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

type NotificationSettingsResponse = {
  order_notification_emails: string | null
  valid_emails: string[]
  fallback_email: string
  is_configured: boolean
  has_db_record: boolean
}

const OrderNotificationsPage = () => {
  const [emailsInput, setEmailsInput] = useState("")
  const [savedEmails, setSavedEmails] = useState<string[]>([])
  const [fallbackEmail, setFallbackEmail] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [hasDbRecord, setHasDbRecord] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/admin/notification-settings")
      if (res.ok) {
        const data: NotificationSettingsResponse = await res.json()
        setEmailsInput(data.order_notification_emails || "")
        setSavedEmails(data.valid_emails || [])
        setFallbackEmail(data.fallback_email || "")
        setIsConfigured(data.is_configured)
        setHasDbRecord(data.has_db_record)
      }
    } catch (err: any) {
      console.error("Failed to load notification settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Parse emails currently in the input field for real-time validation preview
  const currentTypedEmails = emailsInput
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)

  const validTypedEmails = currentTypedEmails.filter((e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  )
  const invalidTypedEmails = currentTypedEmails.filter(
    (e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  )

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await fetch("/admin/notification-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_notification_emails: emailsInput,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setEmailsInput(data.order_notification_emails || "")
        setSavedEmails(data.valid_emails || [])
        setIsConfigured(data.is_configured)
        setHasDbRecord(true)
        toast.success("Settings Saved", {
          description:
            data.valid_emails.length > 0
              ? `Notifications will be delivered to ${data.valid_emails.length} recipient(s).`
              : "Cleared database override. Using default fallback if configured.",
        })
      } else {
        toast.error("Save Failed", {
          description: data.error || data.message || "Failed to save settings.",
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error while saving settings."
      toast.error("Save Error", { description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    setTesting(true)

    try {
      const res = await fetch("/admin/notification-settings/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: emailsInput.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Test Email Sent", {
          description: data.message || "Test order notification sent successfully.",
        })
      } else {
        toast.error("Test Failed", {
          description: data.error || "Failed to send test notification.",
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error while sending test email."
      toast.error("Test Error", { description: msg })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-6 max-w-4xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mailbox className="text-ui-fg-subtle" />
            <Heading level="h1" className="text-2xl font-bold">
              Order Notifications
            </Heading>
          </div>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            Receive dedicated email alerts whenever a customer places an order on LaptopZone.
          </Text>
        </div>

        <div>
          {isConfigured ? (
            <Badge color="green" className="px-3 py-1">
              Active ({savedEmails.length} recipient{savedEmails.length !== 1 ? "s" : ""})
            </Badge>
          ) : fallbackEmail ? (
            <Badge color="blue" className="flex items-center gap-1.5 px-3 py-1">
              <InformationCircle className="w-3.5 h-3.5" />
              Fallback ({fallbackEmail})
            </Badge>
          ) : (
            <Badge color="grey" className="px-3 py-1">
              Not Configured
            </Badge>
          )}
        </div>
      </div>

      {/* Main Settings Card */}
      <Container className="p-6">
        <div className="flex flex-col gap-y-6">
          <div>
            <Heading level="h2" className="text-base font-semibold">
              Notification Recipients
            </Heading>
            <Text className="text-ui-fg-subtle text-sm mt-1">
              Configure one or more email addresses that should receive the internal store order alert.
            </Text>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="notification-emails" className="text-sm font-medium">
              Notification Email(s)
            </Label>
            <Input
              id="notification-emails"
              type="text"
              placeholder="owner@laptopzone.co.zw, manager@laptopzone.co.zw"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              disabled={loading || saving}
              className="w-full font-mono text-sm"
            />
            <Text className="text-ui-fg-muted text-xs">
              Separate multiple email addresses with commas.
            </Text>
          </div>

          {/* Real-time Email Preview Pills */}
          {currentTypedEmails.length > 0 && (
            <div className="flex flex-col gap-y-2 pt-2 border-t border-ui-border-base">
              <Text className="text-ui-fg-subtle text-xs font-medium">
                Detected Recipients ({validTypedEmails.length} valid
                {invalidTypedEmails.length > 0 ? `, ${invalidTypedEmails.length} invalid` : ""}):
              </Text>
              <div className="flex flex-wrap gap-2">
                {validTypedEmails.map((email) => (
                  <Badge key={email} color="green" className="text-xs font-mono">
                    {email}
                  </Badge>
                ))}
                {invalidTypedEmails.map((email) => (
                  <Badge key={email} color="red" className="text-xs font-mono">
                    {email} (Invalid format)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Information Callout */}
          <div className="bg-ui-bg-subtle p-4 rounded-lg flex items-start gap-3 border border-ui-border-base">
            <InformationCircle className="w-5 h-5 text-ui-fg-muted flex-shrink-0 mt-0.5" />
            <div className="text-xs text-ui-fg-subtle space-y-1">
              <p className="font-semibold text-ui-fg-base">
                How Order Notifications Work:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>This is an <strong>independent, non-blocking internal notification</strong>.</li>
                <li>Customer order confirmation emails are never delayed or exposed to these addresses.</li>
                <li>The email includes full order details, line items, customer contact, and a direct button to the order in the Admin Dashboard.</li>
                {fallbackEmail && (
                  <li>
                    Default environment fallback: <code className="bg-ui-bg-base px-1 py-0.5 rounded text-ui-fg-base">{fallbackEmail}</code>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ui-border-base">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendTest}
              disabled={loading || testing || validTypedEmails.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {testing && <ArrowPath className="w-4 h-4 animate-spin" />}
              Send Test Email
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={loading || saving || invalidTypedEmails.length > 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {saving && <ArrowPath className="w-4 h-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Order Notifications",
  icon: BellAlert,
})

export default OrderNotificationsPage

