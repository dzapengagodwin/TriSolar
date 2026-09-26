import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Switch,
  Badge,
  StatusBadge,
  Table,
  clx,
} from "@medusajs/ui"
import { useState, useCallback } from "react"

type ConnectionStatus = "idle" | "testing" | "connected" | "failed"
type ImportStatus = "idle" | "previewing" | "importing" | "complete" | "error"

type PreviewRow = {
  wpId: number
  wpSlug: string
  entityType: string
  entityTitle: string
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  canonicalUrl: string | null
  willMatch: boolean
}

type ImportResult = {
  dryRun: boolean
  totalFetched: number
  matched: number
  imported: number
  skipped: number
  noMatch: number
  errors: string[]
  details: {
    slug: string
    entityType: string
    entityTitle: string
    medusaId: string
    status: "imported" | "skipped" | "no_match" | "error"
    error?: string
  }[]
  preview?: PreviewRow[]
}

const ENTITY_TYPE_COLORS: Record<string, "blue" | "green" | "orange" | "purple"> = {
  product: "blue",
  category: "green",
  brand: "orange",
  page: "purple",
}

const YoastSeoImporterPage = () => {
  const [wooUrl, setWooUrl] = useState("")
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [yoastDetected, setYoastDetected] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState("")

  const [importProducts, setImportProducts] = useState(true)
  const [importCategories, setImportCategories] = useState(true)
  const [importBrands, setImportBrands] = useState(true)
  const [importPages, setImportPages] = useState(true)
  const [overwriteExisting, setOverwriteExisting] = useState(true)

  const [importStatus, setImportStatus] = useState<ImportStatus>("idle")
  const [previewData, setPreviewData] = useState<PreviewRow[] | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState("")

  const [activeTab, setActiveTab] = useState<"details" | "errors">("details")

  const canProceed = connectionStatus === "connected"

  const handleTestConnection = useCallback(async () => {
    if (!wooUrl || !consumerKey || !consumerSecret) return
    setConnectionStatus("testing")
    setConnectionMessage("")
    setYoastDetected(false)

    try {
      const res = await fetch("/admin/yoast-seo-importer/test-connection", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wooUrl: wooUrl.replace(/\/+$/, ""),
          consumerKey,
          consumerSecret,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setConnectionStatus("connected")
        setYoastDetected(data.yoastDetected)
        setConnectionMessage(
          data.yoastDetected
            ? "Connected. Yoast SEO fields detected on this site."
            : "Connected, but Yoast SEO fields were not detected. Ensure Yoast SEO plugin is active on the WordPress site."
        )
      } else {
        setConnectionStatus("failed")
        setConnectionMessage(data.error || "Connection failed")
      }
    } catch (err: any) {
      setConnectionStatus("failed")
      setConnectionMessage(err.message)
    }
  }, [wooUrl, consumerKey, consumerSecret])

  const handlePreview = useCallback(async () => {
    setImportStatus("previewing")
    setPreviewData(null)
    setImportError("")

    try {
      const res = await fetch("/admin/yoast-seo-importer/preview", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wooUrl: wooUrl.replace(/\/+$/, ""),
          consumerKey,
          consumerSecret,
          importProducts,
          importCategories,
          importBrands,
          importPages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Preview failed")

      setPreviewData(data.result?.preview || [])
      setImportStatus("idle")
    } catch (err: any) {
      setImportStatus("error")
      setImportError(err.message)
    }
  }, [wooUrl, consumerKey, consumerSecret, importProducts, importCategories, importBrands, importPages])

  const handleImport = useCallback(async () => {
    setImportStatus("importing")
    setImportResult(null)
    setImportError("")

    try {
      const res = await fetch("/admin/yoast-seo-importer/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wooUrl: wooUrl.replace(/\/+$/, ""),
          consumerKey,
          consumerSecret,
          importProducts,
          importCategories,
          importBrands,
          importPages,
          overwriteExisting,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")

      setImportResult(data.result)
      setImportStatus("complete")
    } catch (err: any) {
      setImportStatus("error")
      setImportError(err.message)
    }
  }, [
    wooUrl, consumerKey, consumerSecret,
    importProducts, importCategories, importBrands, importPages,
    overwriteExisting,
  ])

  return (
    <div className="flex flex-col gap-y-6 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Heading level="h1">
            Yoast SEO Importer
          </Heading>
          <Text className="text-sm text-ui-fg-subtle mt-1">
            Import Yoast SEO metadata (titles, descriptions, OpenGraph, robots) from your old WordPress site into Laptopzone.
          </Text>
        </div>
        {importResult && (
          <StatusBadge color={importResult.errors.length > 0 ? "orange" : "green"}>
            {importResult.imported} records imported
          </StatusBadge>
        )}
      </div>

      {/* Step 1: Connection */}
      <Container className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">
              WordPress Connection
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Enter your WordPress REST API credentials with read permissions.
            </Text>
          </div>
          {connectionStatus === "connected" && (
            <StatusBadge color={yoastDetected ? "green" : "orange"}>
              {yoastDetected ? "Yoast Detected" : "Connected (No Yoast)"}
            </StatusBadge>
          )}
          {connectionStatus === "failed" && <StatusBadge color="red">Connection Failed</StatusBadge>}
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label size="small" className="text-ui-fg-subtle">WordPress Site URL</Label>
            <Input
              placeholder="https://old-site.laptopzone.co.zw"
              value={wooUrl}
              onChange={(e) => { setWooUrl(e.target.value); setConnectionStatus("idle") }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label size="small" className="text-ui-fg-subtle">Consumer Key</Label>
              <Input
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={consumerKey}
                onChange={(e) => { setConsumerKey(e.target.value); setConnectionStatus("idle") }}
                type="password"
              />
            </div>
            <div className="space-y-1.5">
              <Label size="small" className="text-ui-fg-subtle">Consumer Secret</Label>
              <Input
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={consumerSecret}
                onChange={(e) => { setConsumerSecret(e.target.value); setConnectionStatus("idle") }}
                type="password"
              />
            </div>
          </div>
        </div>

        {connectionMessage && (
          <div
            className={clx(
              "p-3 rounded-lg text-xs",
              connectionStatus === "connected"
                ? yoastDetected ? "bg-ui-bg-subtle text-ui-fg-base border border-ui-border-base" : "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {connectionMessage}
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="secondary"
            size="small"
            isLoading={connectionStatus === "testing"}
            disabled={!wooUrl || !consumerKey || !consumerSecret || connectionStatus === "testing"}
            onClick={handleTestConnection}
          >
            {connectionStatus === "connected" ? "Re-Test Connection" : "Test Connection"}
          </Button>
        </div>
      </Container>

      {/* Step 2: Import Scope */}
      <Container className="p-6 space-y-5">
        <div>
          <Heading level="h2">Import Scope</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Select the content types you want to import metadata for.
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Products", value: importProducts, setter: setImportProducts, desc: "Product page SEO titles, descriptions & OpenGraph" },
            { label: "Categories", value: importCategories, setter: setImportCategories, desc: "Category page SEO data from WordPress terms" },
            { label: "Brands", value: importBrands, setter: setImportBrands, desc: "Brand taxonomy Yoast metadata (YITH or WC Brands)" },
            { label: "Static Pages", value: importPages, setter: setImportPages, desc: "About, Contact, and other WordPress static pages" },
          ].map(({ label, value, setter, desc }) => (
            <label key={label} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-ui-border-base hover:border-ui-border-strong transition-colors">
              <Switch checked={value} onCheckedChange={setter} disabled={!canProceed} />
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-base">{label}</Text>
                <Text size="xsmall" className="text-ui-fg-subtle leading-relaxed mt-0.5">{desc}</Text>
              </div>
            </label>
          ))}
        </div>

        <div className="border-t border-ui-border-base pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={overwriteExisting} onCheckedChange={setOverwriteExisting} disabled={!canProceed} />
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base">Overwrite Existing SEO Data</Text>
              <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
                When enabled, Yoast data will overwrite any SEO already set in the Medusa Admin SEO Widget.
                Disable to only fill in blank records.
              </Text>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="small"
            isLoading={importStatus === "previewing"}
            disabled={!canProceed || importStatus === "previewing" || importStatus === "importing"}
            onClick={handlePreview}
          >
            Preview (Dry Run)
          </Button>
          <Button
            variant="primary"
            size="small"
            isLoading={importStatus === "importing"}
            disabled={!canProceed || importStatus === "importing" || importStatus === "previewing"}
            onClick={handleImport}
          >
            <ArrowDownTray className="mr-1.5 w-4 h-4" />
            Run Import
          </Button>
        </div>
      </Container>

      {/* Step 3: Dry-Run Preview */}
      {previewData && previewData.length > 0 && importStatus !== "importing" && importStatus !== "complete" && (
        <Container className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heading level="h2">Preview</Heading>
              <Badge color="grey" size="small">{previewData.length} records</Badge>
            </div>
            <div className="flex gap-3 text-xs">
              <StatusBadge color="green">{previewData.filter(r => r.willMatch).length} matched</StatusBadge>
              <StatusBadge color="orange">{previewData.filter(r => !r.willMatch).length} no match</StatusBadge>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="text-xs">Type</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">WP Slug</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Meta Title</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Meta Description</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">OG Image</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Match</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {previewData.slice(0, 50).map((row) => (
                  <Table.Row key={`${row.entityType}-${row.wpSlug}`}>
                    <Table.Cell>
                      <Badge
                        color={ENTITY_TYPE_COLORS[row.entityType] || "grey"}
                        size="small"
                      >
                        {row.entityType}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="text-xs font-mono text-ui-fg-subtle max-w-[140px] truncate">
                      {row.wpSlug}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-base max-w-[220px] truncate">
                      {row.metaTitle || <span className="text-ui-fg-muted italic">—</span>}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle max-w-[200px] truncate">
                      {row.metaDescription
                        ? `${row.metaDescription.slice(0, 60)}…`
                        : <span className="text-ui-fg-muted italic">—</span>}
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      {row.ogImage ? (
                        <span className="text-ui-fg-interactive">Yes</span>
                      ) : (
                        <span className="text-ui-fg-muted">—</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge color={row.willMatch ? "green" : "red"}>
                        {row.willMatch ? "Match" : "No Match"}
                      </StatusBadge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {previewData.length > 50 && (
            <Text className="text-xs text-ui-fg-muted text-center">
              Showing 50 of {previewData.length} records. Run the import to process all.
            </Text>
          )}
          <Text className="text-[11px] text-ui-fg-subtle bg-ui-bg-subtle border border-ui-border-base rounded-lg p-2.5">
            This is a dry run — nothing has been saved. Click <strong>Run Import</strong> above to apply these changes.
          </Text>
        </Container>
      )}

      {/* Error state */}
      {importStatus === "error" && importError && (
        <Container className="p-4 bg-ui-bg-subtle border border-ui-border-error">
          <Text size="small" weight="plus" className="text-ui-fg-error">Import Failed</Text>
          <Text size="xsmall" className="text-ui-fg-subtle mt-1">{importError}</Text>
        </Container>
      )}

      {/* Step 4: Results */}
      {importResult && importStatus === "complete" && (
        <Container className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Heading level="h2">Import Complete</Heading>
            <StatusBadge color={importResult.errors.length > 0 ? "orange" : "green"}>
              {importResult.imported} of {importResult.totalFetched} imported
            </StatusBadge>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Fetched", value: importResult.totalFetched },
              { label: "Imported", value: importResult.imported },
              { label: "No Match", value: importResult.noMatch },
              { label: "Errors", value: importResult.errors.length },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wider">{label}</Text>
                <Text size="xlarge" weight="plus" className="text-ui-fg-base mt-1">{value}</Text>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-ui-border-base flex gap-2">
            {(["details", "errors"] as const).map((tab) => (
              <Button
                key={tab}
                variant="transparent"
                size="small"
                onClick={() => setActiveTab(tab)}
                className={clx(
                  "border-b-2 rounded-none px-3 pb-2 -mb-px transition-colors capitalize",
                  activeTab === tab
                    ? "border-ui-border-interactive text-ui-fg-base font-medium"
                    : "border-transparent text-ui-fg-muted hover:text-ui-fg-subtle"
                )}
              >
                {tab === "details" ? `Details (${importResult.details.length})` : `Errors (${importResult.errors.length})`}
              </Button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="overflow-x-auto rounded-lg border border-ui-border-base">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="text-xs">Type</Table.HeaderCell>
                    <Table.HeaderCell className="text-xs">Title</Table.HeaderCell>
                    <Table.HeaderCell className="text-xs">Slug</Table.HeaderCell>
                    <Table.HeaderCell className="text-xs">Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {importResult.details.slice(0, 100).map((d, i) => (
                    <Table.Row key={`${d.entityType}-${d.slug}-${i}`}>
                      <Table.Cell>
                        <Badge
                          color={ENTITY_TYPE_COLORS[d.entityType] || "grey"}
                          size="small"
                        >
                          {d.entityType}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-base max-w-[220px] truncate">
                        {d.entityTitle}
                      </Table.Cell>
                      <Table.Cell className="text-xs font-mono text-ui-fg-subtle max-w-[160px] truncate">
                        {d.slug}
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge
                          color={
                            d.status === "imported" ? "green"
                              : d.status === "skipped" ? "blue"
                              : d.status === "no_match" ? "orange"
                              : "red"
                          }
                        >
                          {d.status}
                        </StatusBadge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              {importResult.details.length > 100 && (
                <div className="p-3 text-center text-xs text-ui-fg-muted border-t border-ui-border-base">
                  Showing first 100 of {importResult.details.length} records
                </div>
              )}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-2">
              {importResult.errors.length === 0 ? (
                <Text className="text-xs text-ui-fg-muted text-center py-6">No errors</Text>
              ) : (
                importResult.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-mono">
                    {err}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="p-3 bg-ui-bg-subtle border border-ui-border-base rounded-lg text-xs text-ui-fg-subtle">
            Imported SEO data is now visible in the <strong>Product SEO Widget</strong> for each product in the Medusa Admin, and at{" "}
            <code className="font-mono text-[11px] text-ui-fg-base">GET /admin/seo/products/:id</code>.
          </div>
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Yoast SEO Import",
  icon: ArrowDownTray,
})

export default YoastSeoImporterPage
