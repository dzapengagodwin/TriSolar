import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray, Trash } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Switch,
  Badge,
  Table,
  clx,
} from "@medusajs/ui"
import { useState, useCallback } from "react"

type ConnectionStatus = "idle" | "testing" | "connected" | "failed"

type ImportStatus = "idle" | "importing" | "complete" | "error"

type ImportedProduct = {
  wcId: number
  wcTitle: string
  medusaId: string
  variantsCount: number
  status: "success" | "failed"
  error?: string
}

type ImportResult = {
  totalProducts: number
  importedProducts: number
  failedProducts: number
  importedCategories: number
  importedCollections: number
  errors: string[]
  importedProductDetails: ImportedProduct[]
}

const WooCommerceMigratorPage = () => {
  // Connection form state
  const [wooUrl, setWooUrl] = useState("")
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle")
  const [connectionMessage, setConnectionMessage] = useState("")

  // Import options state
  const [currencyCode, setCurrencyCode] = useState("usd")
  const [importCategories, setImportCategories] = useState(true)
  const [importTags, setImportTags] = useState(false)
  const [publishProducts, setPublishProducts] = useState(false)
  const [createPriceList, setCreatePriceList] = useState(false)
  const [skipVariants, setSkipVariants] = useState(true)
  const [createdAfter, setCreatedAfter] = useState("")
  const [createdBefore, setCreatedBefore] = useState("")
  const [datePreset, setDatePreset] = useState("all")

  // JSON upload state
  const [useJsonUpload, setUseJsonUpload] = useState(false)
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<any>(null)

  // Import state
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState("")

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")

  const handleTestConnection = useCallback(async () => {
    if (!wooUrl || !consumerKey || !consumerSecret) return

    setConnectionStatus("testing")
    setConnectionMessage("")

    try {
      const response = await fetch(
        "/admin/woocommerce-migrator/test-connection",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wooUrl: wooUrl.replace(/\/+$/, ""),
            consumerKey,
            consumerSecret,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setConnectionStatus("connected")
        setConnectionMessage(
          data.storeName
            ? `Connected to "${data.storeName}"`
            : "Connection successful"
        )
      } else {
        setConnectionStatus("failed")
        setConnectionMessage(data.error || "Connection failed")
      }
    } catch (err: any) {
      setConnectionStatus("failed")
      setConnectionMessage(err.message || "Network error")
    }
  }, [wooUrl, consumerKey, consumerSecret])

  const handleJsonFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setJsonFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string)
          setJsonData(parsed)
        } catch {
          setJsonData(null)
          setImportError("Invalid JSON file")
        }
      }
      reader.readAsText(file)
    },
    []
  )

  const handleDatePresetChange = useCallback((val: string) => {
    setDatePreset(val)
    const now = new Date()
    if (val === "all") {
      setCreatedAfter("")
      setCreatedBefore("")
    } else if (val === "30d") {
      const d = new Date()
      d.setDate(now.getDate() - 30)
      setCreatedAfter(d.toISOString().split("T")[0])
      setCreatedBefore("")
    } else if (val === "90d") {
      const d = new Date()
      d.setDate(now.getDate() - 90)
      setCreatedAfter(d.toISOString().split("T")[0])
      setCreatedBefore("")
    } else if (val === "this_year") {
      setCreatedAfter(`${now.getFullYear()}-01-01`)
      setCreatedBefore("")
    } else if (val === "last_year") {
      setCreatedAfter(`${now.getFullYear() - 1}-01-01`)
      setCreatedBefore(`${now.getFullYear() - 1}-12-31`)
    }
  }, [])

  const handleStartImport = useCallback(async () => {
    setImportStatus("importing")
    setImportError("")
    setImportResult(null)

    const body: any = {
      currencyCode,
      importCategories,
      importTags,
      publishProducts,
      createPriceList,
      skipVariants,
      createdAfter: createdAfter || undefined,
      createdBefore: createdBefore || undefined,
    }

    if (useJsonUpload && jsonData) {
      body.jsonData = jsonData
    } else {
      body.wooUrl = wooUrl.replace(/\/+$/, "")
      body.consumerKey = consumerKey
      body.consumerSecret = consumerSecret
    }

    try {
      const response = await fetch(
        "/admin/woocommerce-migrator/import",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setImportStatus("complete")
        setImportResult(data.result || data)
      } else {
        setImportStatus("error")
        setImportError(data.error || data.message || "Import failed")
      }
    } catch (err: any) {
      setImportStatus("error")
      setImportError(err.message || "Network error during import")
    }
  }, [
    wooUrl,
    consumerKey,
    consumerSecret,
    currencyCode,
    importCategories,
    importTags,
    publishProducts,
    createPriceList,
    skipVariants,
    createdAfter,
    createdBefore,
    useJsonUpload,
    jsonData,
  ])

  const handleDeleteAllProducts = useCallback(async () => {
    setIsDeleting(true)
    setDeleteMessage("")

    try {
      const response = await fetch(
        "/admin/woocommerce-migrator/delete-all",
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      const data = await response.json()

      if (response.ok) {
        setDeleteMessage(data.message || `Deleted ${data.deletedCount} products.`)
        setDeleteConfirming(false)
        setImportResult(null)
      } else {
        setDeleteMessage(`Delete failed: ${data.error || "Unknown error"}`)
      }
    } catch (err: any) {
      setDeleteMessage(`Delete error: ${err.message || "Network error"}`)
    } finally {
      setIsDeleting(false)
    }
  }, [])

  const canImport =
    useJsonUpload && jsonData
      ? true
      : connectionStatus === "connected"

  return (
    <div className="flex flex-col gap-y-3">
      {/* Header */}
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1">WooCommerce Product Migrator</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Import products, categories, and tags from a WooCommerce store
              into Medusa.
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            {importResult && (
              <Badge
                color={importResult.failedProducts > 0 ? "orange" : "green"}
                size="small"
              >
                {importResult.importedProducts} / {importResult.totalProducts}{" "}
                imported
              </Badge>
            )}
            {!deleteConfirming ? (
              <Button
                variant="danger"
                size="small"
                onClick={() => setDeleteConfirming(true)}
              >
                <Trash />
                Bulk Delete Products
              </Button>
            ) : (
              <div className="flex items-center gap-x-2">
                <Button
                  variant="danger"
                  size="small"
                  onClick={handleDeleteAllProducts}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete All"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setDeleteConfirming(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {deleteMessage && (
          <div className="mt-3 p-3 bg-ui-bg-subtle rounded-md">
            <Text size="small" className="text-ui-fg-subtle">
              {deleteMessage}
            </Text>
          </div>
        )}
      </Container>

      {/* Data Source Toggle */}
      <Container>
        <Heading level="h2" className="mb-4">
          Data Source
        </Heading>
        <div className="flex items-center gap-x-3 mb-4">
          <Switch
            checked={useJsonUpload}
            onCheckedChange={setUseJsonUpload}
          />
          <Label>Use JSON file upload instead of API connection</Label>
        </div>

        {useJsonUpload ? (
          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="json-file">WooCommerce JSON Export File</Label>
              <input
                id="json-file"
                type="file"
                accept=".json"
                onChange={handleJsonFileChange}
                className="mt-1 block w-full text-sm text-ui-fg-subtle file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ui-bg-interactive file:text-ui-fg-on-color hover:file:bg-ui-bg-interactive-hover file:cursor-pointer cursor-pointer"
              />
              {jsonFile && (
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Loaded: {jsonFile.name}
                  {jsonData?.products &&
                    ` (${jsonData.products.length} products found)`}
                  {jsonData &&
                    Array.isArray(jsonData) &&
                    ` (${jsonData.length} products found)`}
                </Text>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="woo-url">WooCommerce Store URL</Label>
              <Input
                id="woo-url"
                placeholder="https://your-store.com"
                value={wooUrl}
                onChange={(e) => setWooUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <div>
                <Label htmlFor="consumer-key">Consumer Key</Label>
                <Input
                  id="consumer-key"
                  placeholder="ck_..."
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="consumer-secret">Consumer Secret</Label>
                <Input
                  id="consumer-secret"
                  type="password"
                  placeholder="cs_..."
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-x-3">
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                disabled={
                  !wooUrl ||
                  !consumerKey ||
                  !consumerSecret ||
                  connectionStatus === "testing"
                }
              >
                {connectionStatus === "testing"
                  ? "Testing..."
                  : "Test Connection"}
              </Button>
              {connectionStatus === "connected" && (
                <Badge color="green" size="small">
                  Connected
                </Badge>
              )}
              {connectionStatus === "failed" && (
                <Badge color="red" size="small">
                  Failed
                </Badge>
              )}
              {connectionMessage && (
                <Text size="small" className="text-ui-fg-subtle">
                  {connectionMessage}
                </Text>
              )}
            </div>
          </div>
        )}
      </Container>

      {/* Import Options */}
      <Container>
        <Heading level="h2" className="mb-4">
          Import Options
        </Heading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency-code">Default Currency</Label>
            <Select
              value={currencyCode}
              onValueChange={setCurrencyCode}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select currency" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="usd">USD - US Dollar</Select.Item>
                <Select.Item value="eur">EUR - Euro</Select.Item>
                <Select.Item value="gbp">GBP - British Pound</Select.Item>
                <Select.Item value="cad">CAD - Canadian Dollar</Select.Item>
                <Select.Item value="aud">AUD - Australian Dollar</Select.Item>
                <Select.Item value="jpy">JPY - Japanese Yen</Select.Item>
                <Select.Item value="zar">ZAR - South African Rand</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-3 pt-6">
            <div className="flex items-center gap-x-3">
              <Switch
                checked={importCategories}
                onCheckedChange={setImportCategories}
              />
              <Label>Import categories</Label>
            </div>
            <div className="flex items-center gap-x-3">
              <Switch
                checked={publishProducts}
                onCheckedChange={setPublishProducts}
              />
              <Label>Publish products immediately</Label>
            </div>
            <div className="flex items-center gap-x-3">
              <Switch
                checked={createPriceList}
                onCheckedChange={setCreatePriceList}
              />
              <Label>Create Price List on import</Label>
            </div>
            <div className="flex items-center gap-x-3">
              <Switch
                checked={skipVariants}
                onCheckedChange={setSkipVariants}
              />
              <div>
                <Label>Skip product variations (Fast Import)</Label>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Bypasses downloading separate variation records; imports each product with its main price, SKU & specs.
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Created At Date Filter */}
        <div className="mt-6 pt-5 border-t border-ui-border-base">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                Product Created Date Filter
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Only import products created within a specific date window in WooCommerce.
              </Text>
            </div>
            {(createdAfter || createdBefore) && (
              <Button
                variant="transparent"
                size="small"
                onClick={() => {
                  setCreatedAfter("")
                  setCreatedBefore("")
                  setDatePreset("all")
                }}
                className="text-ui-fg-interactive hover:underline text-xs"
              >
                Clear date filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-preset" className="text-ui-fg-muted mb-1 block">
                Quick Preset
              </Label>
              <Select value={datePreset} onValueChange={handleDatePresetChange}>
                <Select.Trigger id="date-preset">
                  <Select.Value placeholder="Select date range" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All Time (No date filter)</Select.Item>
                  <Select.Item value="30d">Last 30 Days</Select.Item>
                  <Select.Item value="90d">Last 90 Days</Select.Item>
                  <Select.Item value="this_year">This Year (Jan 1 to today)</Select.Item>
                  <Select.Item value="last_year">Last Year</Select.Item>
                  <Select.Item value="custom">Custom Date Range</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label htmlFor="created-after" className="text-ui-fg-muted mb-1 block">
                Created After / Start Date
              </Label>
              <Input
                id="created-after"
                type="date"
                value={createdAfter}
                onChange={(e) => {
                  setCreatedAfter(e.target.value)
                  setDatePreset("custom")
                }}
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div>
              <Label htmlFor="created-before" className="text-ui-fg-muted mb-1 block">
                Created Before / End Date
              </Label>
              <Input
                id="created-before"
                type="date"
                value={createdBefore}
                onChange={(e) => {
                  setCreatedBefore(e.target.value)
                  setDatePreset("custom")
                }}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Import Action */}
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">Run Import</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {useJsonUpload
                ? jsonData
                  ? "JSON data loaded and ready to import."
                  : "Upload a JSON file to begin import."
                : connectionStatus === "connected"
                  ? "Connection verified. Ready to import products."
                  : "Test your connection before importing."}
            </Text>
          </div>
          <Button
            onClick={handleStartImport}
            disabled={!canImport || importStatus === "importing"}
            variant="primary"
          >
            {importStatus === "importing"
              ? "Importing..."
              : "Start Import"}
          </Button>
        </div>

        {importStatus === "importing" && (
          <div className="mt-4 p-4 bg-ui-bg-subtle rounded-lg">
            <Text className="text-ui-fg-subtle">
              Migration in progress. This may take several minutes depending on
              the number of products...
            </Text>
            <div className="mt-2 h-1 bg-ui-border-base rounded-full overflow-hidden">
              <div className="h-full bg-ui-fg-interactive rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {importStatus === "error" && (
          <div className="mt-4 p-4 bg-ui-bg-subtle-hover border border-ui-border-error rounded-lg">
            <Text className="text-ui-fg-error font-medium">
              Import failed: {importError}
            </Text>
          </div>
        )}
      </Container>

      {/* Results */}
      {importResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <Container>
              <Text size="small" className="text-ui-fg-subtle">
                Total Products
              </Text>
              <Heading level="h2">{importResult.totalProducts}</Heading>
            </Container>
            <Container>
              <Text size="small" className="text-ui-fg-subtle">
                Imported
              </Text>
              <Heading level="h2" className="text-ui-fg-interactive">
                {importResult.importedProducts}
              </Heading>
            </Container>
            <Container>
              <Text size="small" className="text-ui-fg-subtle">
                Failed
              </Text>
              <Heading
                level="h2"
                className={clx(
                  importResult.failedProducts > 0
                    ? "text-ui-fg-error"
                    : "text-ui-fg-subtle"
                )}
              >
                {importResult.failedProducts}
              </Heading>
            </Container>
            <Container>
              <Text size="small" className="text-ui-fg-subtle">
                Categories / Collections
              </Text>
              <Heading level="h2">
                {importResult.importedCategories} /{" "}
                {importResult.importedCollections}
              </Heading>
            </Container>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <Container>
              <Heading level="h2" className="mb-2">
                Errors
              </Heading>
              <div className="flex flex-col gap-y-1">
                {importResult.errors.map((err, i) => (
                  <Text
                    key={i}
                    size="small"
                    className="text-ui-fg-error"
                  >
                    {err}
                  </Text>
                ))}
              </div>
            </Container>
          )}

          {/* Product Details Table */}
          {importResult.importedProductDetails.length > 0 && (
            <Container>
              <Heading level="h2" className="mb-4">
                Imported Products
              </Heading>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>WC ID</Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell>Medusa ID</Table.HeaderCell>
                    <Table.HeaderCell>Variants</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {importResult.importedProductDetails.map((product) => (
                    <Table.Row key={product.wcId}>
                      <Table.Cell>{product.wcId}</Table.Cell>
                      <Table.Cell className="font-medium">
                        {product.wcTitle}
                      </Table.Cell>
                      <Table.Cell>
                        <code className="text-xs">
                          {product.medusaId || "-"}
                        </code>
                      </Table.Cell>
                      <Table.Cell>{product.variantsCount}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            product.status === "success" ? "green" : "red"
                          }
                          size="small"
                        >
                          {product.status}
                        </Badge>
                        {product.error && (
                          <Text
                            size="small"
                            className="text-ui-fg-error mt-1"
                          >
                            {product.error}
                          </Text>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Container>
          )}
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "WooCommerce Migrator",
  icon: ArrowDownTray,
})

export default WooCommerceMigratorPage
