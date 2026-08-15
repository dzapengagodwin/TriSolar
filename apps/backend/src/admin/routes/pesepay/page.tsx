import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  CreditCard,
  Key,
  Eye,
  EyeSlash,
  CheckCircleSolid,
  ExclamationCircleSolid,
  ArrowPath,
  InformationCircle,
} from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Badge,
  clx,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

type ConnectionTestResult = {
  success: boolean
  message?: string
  error?: string
}

const PesepaySettingsPage = () => {
  const [integrationKey, setIntegrationKey] = useState("")
  const [encryptionKey, setEncryptionKey] = useState("")
  const [hasIntegrationKey, setHasIntegrationKey] = useState(false)
  const [hasEncryptionKey, setHasEncryptionKey] = useState(false)
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    "sandbox"
  )
  const [callbackUrl, setCallbackUrl] = useState("")
  const [showIntegrationKey, setShowIntegrationKey] = useState(false)
  const [showEncryptionKey, setShowEncryptionKey] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/admin/pesepay/settings")
      if (res.ok) {
        const data = await res.json()
        setHasIntegrationKey(Boolean(data.hasIntegrationKey))
        setHasEncryptionKey(Boolean(data.hasEncryptionKey))
        if (data.maskedIntegrationKey) {
          setIntegrationKey(data.maskedIntegrationKey)
        }
        setEnvironment(
          data.environment === "production" ? "production" : "sandbox"
        )
        setCallbackUrl(
          data.callbackUrl || "http://localhost:8000/us/order/confirmed"
        )
      }
    } catch (err: any) {
      console.error("Failed to load Pesepay settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    setTestResult(null)

    try {
      const res = await fetch("/admin/pesepay/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationKey,
          encryptionKey,
          environment,
          callbackUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setHasIntegrationKey(Boolean(data.hasIntegrationKey))
        setHasEncryptionKey(Boolean(data.hasEncryptionKey))
        setEncryptionKey("")
        if (data.maskedIntegrationKey) {
          setIntegrationKey(data.maskedIntegrationKey)
        }
        setSaveStatus({
          type: "success",
          message: "Pesepay configuration saved successfully!",
        })
      } else {
        setSaveStatus({
          type: "error",
          message: data.error || "Failed to save settings.",
        })
      }
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        message: err.message || "An error occurred while saving.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setSaveStatus(null)

    try {
      const res = await fetch("/admin/pesepay/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationKey,
          encryptionKey,
          environment,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message:
            data.message || "Connected to Pesepay gateway successfully!",
        })
      } else {
        setTestResult({
          success: false,
          error:
            data.error || "Failed to connect to Pesepay with these credentials.",
        })
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Connection test request failed.",
      })
    } finally {
      setTesting(false)
    }
  }

  const isConfigured =
    (Boolean(integrationKey) || hasIntegrationKey) &&
    (Boolean(encryptionKey) || hasEncryptionKey)

  return (
    <div className="flex flex-col gap-y-6 max-w-4xl mx-auto py-4">
      {/* Header Container */}
      <Container className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 rounded-xl bg-ui-bg-subtle-pressed border border-ui-border-base flex items-center justify-center text-ui-fg-base">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <Heading level="h1" className="text-xl font-bold">
                Pesepay Payment Gateway
              </Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Configure API keys, toggle between Sandbox and Production modes,
                and verify credentials.
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Badge color={environment === "production" ? "green" : "orange"}>
              {environment === "production" ? "Live (Production)" : "Test (Sandbox)"}
            </Badge>
            <Badge color={isConfigured ? "green" : "grey"}>
              {isConfigured ? "Configured" : "Unconfigured"}
            </Badge>
          </div>
        </div>
      </Container>

      {/* Save Status Alert */}
      {saveStatus && (
        <div
          className={clx(
            "p-4 rounded-xl border flex items-center gap-3 text-sm transition-all",
            saveStatus.type === "success"
              ? "bg-ui-bg-success-subtle border-ui-border-success text-ui-fg-success"
              : "bg-ui-bg-error-subtle border-ui-border-error text-ui-fg-error"
          )}
        >
          {saveStatus.type === "success" ? (
            <CheckCircleSolid className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ExclamationCircleSolid className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Test Connection Alert */}
      {testResult && (
        <div
          className={clx(
            "p-4 rounded-xl border flex items-center gap-3 text-sm transition-all",
            testResult.success
              ? "bg-ui-bg-success-subtle border-ui-border-success text-ui-fg-success"
              : "bg-ui-bg-error-subtle border-ui-border-error text-ui-fg-error"
          )}
        >
          {testResult.success ? (
            <CheckCircleSolid className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ExclamationCircleSolid className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold">
              {testResult.success
                ? "Connection Verified"
                : "Connection Failed"}
            </p>
            <p className="text-xs mt-0.5">
              {testResult.success ? testResult.message : testResult.error}
            </p>
          </div>
        </div>
      )}

      {/* Environment / Mode Section */}
      <Container className="p-6">
        <div className="flex flex-col gap-y-4">
          <div className="border-b border-ui-border-base pb-3">
            <Heading level="h2" className="text-base font-semibold">
              Environment & Mode
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Switch between Sandbox (for testing with test cards/wallets) and
              Production (for real customer transactions).
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setEnvironment("sandbox")}
              className={clx(
                "p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2",
                environment === "sandbox"
                  ? "border-ui-border-interactive bg-ui-bg-subtle ring-1 ring-ui-border-interactive"
                  : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-base"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Sandbox (Test Mode)</span>
                  <Badge color="orange">Test</Badge>
                </div>
                <input
                  type="radio"
                  name="environment"
                  checked={environment === "sandbox"}
                  onChange={() => setEnvironment("sandbox")}
                  className="accent-ui-fg-interactive"
                />
              </div>
              <Text size="xsmall" className="text-ui-fg-muted">
                Endpoint: <code>https://api.test.sandbox.pesepay.com</code>
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Ideal for testing mobile money, Ecocash, and cards without real
                money charges.
              </Text>
            </div>

            <div
              onClick={() => setEnvironment("production")}
              className={clx(
                "p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2",
                environment === "production"
                  ? "border-ui-border-interactive bg-ui-bg-subtle ring-1 ring-ui-border-interactive"
                  : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-base"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    Production (Live Mode)
                  </span>
                  <Badge color="green">Live</Badge>
                </div>
                <input
                  type="radio"
                  name="environment"
                  checked={environment === "production"}
                  onChange={() => setEnvironment("production")}
                  className="accent-ui-fg-interactive"
                />
              </div>
              <Text size="xsmall" className="text-ui-fg-muted">
                Endpoint: <code>https://api.pesepay.com</code>
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Processes live customer payments through Ecocash, Innbucks,
                Visa, and Mastercard.
              </Text>
            </div>
          </div>
        </div>
      </Container>

      {/* API Credentials Section */}
      <Container className="p-6">
        <div className="flex flex-col gap-y-4">
          <div className="border-b border-ui-border-base pb-3">
            <Heading level="h2" className="text-base font-semibold">
              API Credentials
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Enter your Integration Key and Encryption Key from your Pesepay
              Merchant Dashboard.
            </Text>
          </div>

          <div className="flex flex-col gap-y-4 pt-2">
            {/* Integration Key */}
            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="pesepay-integration-key"
                className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Integration Key
              </Label>
              <div className="relative">
                <Input
                  id="pesepay-integration-key"
                  type={showIntegrationKey ? "text" : "password"}
                  value={integrationKey}
                  onChange={(e) => setIntegrationKey(e.target.value)}
                  placeholder="e.g. 74b09b55-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowIntegrationKey(!showIntegrationKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base"
                >
                  {showIntegrationKey ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Encryption Key */}
            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="pesepay-encryption-key"
                className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Encryption Key
              </Label>
              <div className="relative">
                <Input
                  id="pesepay-encryption-key"
                  type={showEncryptionKey ? "text" : "password"}
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder={
                    hasEncryptionKey
                      ? "Configured (leave blank to keep current key)"
                      : "e.g. 16 or 32 character AES key"
                  }
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base"
                >
                  {showEncryptionKey ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Callback URL */}
            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="pesepay-callback-url"
                className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle"
              >
                Storefront Callback / Return URL
              </Label>
              <Input
                id="pesepay-callback-url"
                type="text"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                placeholder="http://localhost:8000/us/order/confirmed"
                className="font-mono text-sm"
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                URL where customers are redirected after completing or
                cancelling payment on Pesepay.
              </Text>
            </div>
          </div>
        </div>
      </Container>

      {/* Helpful Info Banner */}
      <Container className="p-4 bg-ui-bg-subtle border border-ui-border-base rounded-xl">
        <div className="flex items-start gap-3">
          <InformationCircle className="w-5 h-5 text-ui-fg-interactive flex-shrink-0 mt-0.5" />
          <div className="text-xs text-ui-fg-subtle space-y-1">
            <p className="font-medium text-ui-fg-base">
              Where do I get my Pesepay credentials?
            </p>
            <p>
              Log in to your{" "}
              <a
                href="https://pesepay.com"
                target="_blank"
                rel="noreferrer"
                className="text-ui-fg-interactive underline"
              >
                Pesepay Merchant Portal
              </a>
              , navigate to <strong>Integrations / API Settings</strong>, and
              copy your Integration Key and Encryption Key.
            </p>
          </div>
        </div>
      </Container>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          variant="secondary"
          onClick={handleTestConnection}
          disabled={
            testing ||
            loading ||
            (!integrationKey && !hasIntegrationKey) ||
            (!encryptionKey && !hasEncryptionKey)
          }
          className="flex items-center gap-2"
        >
          {testing && <ArrowPath className="w-4 h-4 animate-spin" />}
          Test Connection
        </Button>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2"
        >
          {saving && <ArrowPath className="w-4 h-4 animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Pesepay",
  icon: CreditCard,
})

export default PesepaySettingsPage
