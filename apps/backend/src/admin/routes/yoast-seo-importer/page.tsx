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
          <Heading level="h1" className="text-2xl font-bold text-gray-900">
            Yoast SEO Importer
          </Heading>
          <Text className="text-sm text-gray-500 mt-1">
            Import Yoast SEO metadata (titles, descriptions, OpenGraph, robots) from your old WordPress site into LaptopZone.
          </Text>
        </div>
        {importResult && (
          <Badge color={importResult.errors.length > 0 ? "orange" : "green"}>
            {importResult.imported} records imported
          </Badge>
        )}
      </div>

      {/* Step 1: Connection */}
      <Container className="p-6 space-y-5 border border-gray-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <Heading level="h2" className="text-sm font-bold text-gray-900">
            WordPress Connection
          </Heading>
          {connectionStatus === "connected" && (
            <Badge color={yoastDetected ? "green" : "orange"} size="small">
              {yoastDetected ? "Yoast Detected" : "Connected — No Yoast"}
            </Badge>
          )}
          {connectionStatus === "failed" && <Badge color="red" size="small">Failed</Badge>}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">WordPress Site URL</Label>
            <Input
              placeholder="https://old-site.laptopzone.co.zw"
              value={wooUrl}
              onChange={(e) => { setWooUrl(e.target.value); setConnectionStatus("idle") }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Consumer Key</Label>
              <Input
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={consumerKey}
                onChange={(e) => { setConsumerKey(e.target.value); setConnectionStatus("idle") }}
                type="password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Consumer Secret</Label>
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
                ? yoastDetected ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {connectionMessage}
          </div>
        )}

        <Button
          variant="secondary"
          size="small"
          isLoading={connectionStatus === "testing"}
          disabled={!wooUrl || !consumerKey || !consumerSecret || connectionStatus === "testing"}
          onClick={handleTestConnection}
        >
          {connectionStatus === "connected" ? "Re-Test Connection" : "Test Connection"}
        </Button>
      </Container>

      {/* Step 2: Import Scope */}
      <Container className="p-6 space-y-5 border border-gray-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className={clx("w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center", canProceed ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400")}>2</span>
          <Heading level="h2" className="text-sm font-bold text-gray-900">Import Scope</Heading>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Products", value: importProducts, setter: setImportProducts, desc: "Product page SEO titles, descriptions & OpenGraph" },
            { label: "Categories", value: importCategories, setter: setImportCategories, desc: "Category page SEO data from WordPress terms" },
            { label: "Brands", value: importBrands, setter: setImportBrands, desc: "Brand taxonomy Yoast metadata (YITH or WC Brands)" },
            { label: "Static Pages", value: importPages, setter: setImportPages, desc: "About, Contact, and other WordPress static pages" },
          ].map(({ label, value, setter, desc }) => (
            <label key={label} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
              <Switch checked={value} onCheckedChange={setter} disabled={!canProceed} />
              <div>
                <div className="text-xs font-bold text-gray-900">{label}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed">{desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={overwriteExisting} onCheckedChange={setOverwriteExisting} disabled={!canProceed} />
            <div>
              <div className="text-xs font-bold text-gray-900">Overwrite Existing SEO Data</div>
              <div className="text-[11px] text-gray-500">
                When enabled, Yoast data will overwrite any SEO already set in the Medusa Admin SEO Widget.
                Disable to only fill in blank records.
              </div>
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
        <Container className="p-6 space-y-4 border border-blue-100 bg-blue-50/30 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <Heading level="h2" className="text-sm font-bold text-gray-900">Preview</Heading>
              <Badge color="blue" size="small">{previewData.length} records</Badge>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge color="green" size="small">{previewData.filter(r => r.willMatch).length} matched</Badge>
              <Badge color="orange" size="small">{previewData.filter(r => !r.willMatch).length} no match</Badge>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-blue-100">
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
                    <Table.Cell className="text-xs font-mono text-gray-600 max-w-[140px] truncate">
                      {row.wpSlug}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-gray-700 max-w-[220px] truncate">
                      {row.metaTitle || <span className="text-gray-400 italic">—</span>}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-gray-500 max-w-[200px] truncate">
                      {row.metaDescription
                        ? `${row.metaDescription.slice(0, 60)}…`
                        : <span className="text-gray-300 italic">—</span>}
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      {row.ogImage ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={row.willMatch ? "green" : "red"} size="small">
                        {row.willMatch ? "Match" : "No Match"}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {previewData.length > 50 && (
            <Text className="text-xs text-gray-400 text-center">
              Showing 50 of {previewData.length} records. Run the import to process all.
            </Text>
          )}
          <Text className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
            This is a dry run — nothing has been saved. Click <strong>Run Import</strong> above to apply these changes.
          </Text>
        </Container>
      )}

      {/* Error state */}
      {importStatus === "error" && importError && (
        <Container className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <Text className="text-sm font-bold text-red-700">Import Failed</Text>
          <Text className="text-xs text-red-600 mt-1">{importError}</Text>
        </Container>
      )}

      {/* Step 4: Results */}
      {importResult && importStatus === "complete" && (
        <Container className="p-6 space-y-5 border border-green-100 bg-green-50/20 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
            <Heading level="h2" className="text-sm font-bold text-gray-900">Import Complete</Heading>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Fetched", value: importResult.totalFetched, color: "bg-gray-50 border-gray-200 text-gray-700" },
              { label: "Imported", value: importResult.imported, color: "bg-green-50 border-green-200 text-green-700" },
              { label: "No Match", value: importResult.noMatch, color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Errors", value: importResult.errors.length, color: "bg-red-50 border-red-200 text-red-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className={clx("p-4 rounded-xl border text-center", color)}>
                <div className="text-2xl font-black">{value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-4">
            {(["details", "errors"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clx(
                  "text-xs font-bold pb-2 border-b-2 -mb-px transition-colors capitalize",
                  activeTab === tab
                    ? "border-black text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {tab === "details" ? `Details (${importResult.details.length})` : `Errors (${importResult.errors.length})`}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                      <Table.Cell className="text-xs text-gray-700 max-w-[220px] truncate">
                        {d.entityTitle}
                      </Table.Cell>
                      <Table.Cell className="text-xs font-mono text-gray-500 max-w-[160px] truncate">
                        {d.slug}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            d.status === "imported" ? "green"
                              : d.status === "skipped" ? "blue"
                              : d.status === "no_match" ? "orange"
                              : "red"
                          }
                          size="small"
                        >
                          {d.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              {importResult.details.length > 100 && (
                <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                  Showing first 100 of {importResult.details.length} records
                </div>
              )}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-2">
              {importResult.errors.length === 0 ? (
                <Text className="text-xs text-gray-400 text-center py-6">No errors</Text>
              ) : (
                importResult.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-mono">
                    {err}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            Imported SEO data is now visible in the <strong>Product SEO Widget</strong> for each product in the Medusa Admin, and at{" "}
            <code className="font-mono text-[11px]">GET /admin/seo/products/:id</code>.
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
