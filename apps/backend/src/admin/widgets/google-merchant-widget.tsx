import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Checkbox, Container, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import googleProductTaxonomy from "../data/google-product-taxonomy.json"
import { sdk } from "../lib/sdk"

const taxonomy = googleProductTaxonomy as [string, string][]

type Product = {
  id: string
  metadata?: Record<string, unknown> | null
}

type MerchantFields = {
  google_product_category: string
  title: string
  gtin: string
  mpn: string
  identifier_exists: "" | "yes" | "no"
  excluded: boolean
}

const emptyFields: MerchantFields = {
  google_product_category: "",
  title: "",
  gtin: "",
  mpn: "",
  identifier_exists: "",
  excluded: false,
}

const selectClassName = "bg-ui-bg-field shadow-buttons-neutral text-ui-fg-base focus-visible:shadow-borders-interactive-with-active flex h-8 w-full rounded-md border border-ui-border-base px-2 text-sm outline-none"

const GoogleMerchantWidget = ({ data }: { data: { id: string } }) => {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<MerchantFields>(emptyFields)
  const [categorySearch, setCategorySearch] = useState("")
  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["google-merchant-product", data.id],
    queryFn: () => sdk.admin.product.retrieve(data.id, { fields: "+metadata" }),
  })

  const product = response?.product as Product | undefined
  useEffect(() => {
    if (!product || hasInitialized) return

    const metadata = product?.metadata || {}
    const merchant = (metadata.google_merchant || {}) as Partial<MerchantFields>
    const savedCategory =
      merchant.google_product_category || (metadata.google_product_category as string) || ""
    const taxonomyCategory = taxonomy.find(
      ([id, path]) => id === savedCategory || path === savedCategory
    )

    setFields({
      google_product_category: taxonomyCategory?.[0] || savedCategory,
      title: merchant.title || "",
      gtin: merchant.gtin || (metadata.gtin as string) || "",
      mpn: merchant.mpn || (metadata.manufacturer_mpn as string) || (metadata.mpn as string) || "",
      identifier_exists:
        merchant.identifier_exists === "yes" || merchant.identifier_exists === "no"
          ? merchant.identifier_exists
          : "",
      excluded: merchant.excluded === true,
    })
    setHasInitialized(true)
  }, [product, hasInitialized])

  const selectedCategory = taxonomy.find(
    ([id]) => id === fields.google_product_category
  )
  const categoryResults = useMemo(() => {
    const search = categorySearch.trim().toLocaleLowerCase()
    if (search.length === 0) return []

    return taxonomy
      .filter(([id, path]) => `${id} ${path}`.toLocaleLowerCase().includes(search))
      .slice(0, 50)
  }, [categorySearch])

  const save = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("Product data is not loaded")
      const existing = product.metadata || {}
      const remaining = Object.fromEntries(
        Object.entries(existing).filter(
          ([key]) =>
            ![
              "google_product_category",
              "manufacturer_mpn",
              "manufacturer_mpn_verified",
              "mpn",
              "gtin",
            ].includes(key)
        )
      )

      const trimmedGtin = fields.gtin ? fields.gtin.trim() : ""
      const trimmedMpn = fields.mpn ? fields.mpn.trim() : ""
      const cleanFields = {
        ...fields,
        gtin: trimmedGtin,
        mpn: trimmedMpn,
        title: fields.title ? fields.title.trim() : "",
      }

      const google_merchant = Object.fromEntries(
        Object.entries(cleanFields).filter(([, value]) => value !== "" && value !== false)
      )

      const metadataToUpdate: Record<string, unknown> = {
        ...remaining,
        google_merchant,
      }

      if (trimmedGtin) {
        metadataToUpdate.gtin = trimmedGtin
      }
      if (trimmedMpn) {
        metadataToUpdate.mpn = trimmedMpn
        metadataToUpdate.manufacturer_mpn = trimmedMpn
      }

      return sdk.admin.product.update(data.id, {
        metadata: metadataToUpdate,
      })
    },
    onSuccess: async () => {
      setHasInitialized(false)
      await queryClient.invalidateQueries({ queryKey: ["google-merchant-product", data.id] })
      await queryClient.invalidateQueries({ queryKey: ["product", data.id] })
      toast.success("Google Merchant settings saved")
    },
    onError: (error) => toast.error(error.message || "Could not save Google Merchant settings"),
  })

  const set = <K extends keyof MerchantFields>(key: K, value: MerchantFields[K]) =>
    setFields((current) => ({ ...current, [key]: value }))

  if (isLoading) return <Container><Text>Loading Google Merchant settings…</Text></Container>
  if (isError || !product) return <Container><Text>Google Merchant settings could not be loaded.</Text></Container>

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Text size="small" leading="compact" weight="plus">Google Merchant</Text>
        <Text size="small" className="text-ui-fg-subtle">Set a predefined Google category for this product. Unset categories are omitted from the feed.</Text>
      </div>
      <div className="grid gap-4 px-6 py-4">
        <div className="grid gap-2">
          <Label size="small">Google product category</Label>
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
            {selectedCategory ? (
              <div className="flex flex-col gap-1">
                <Text size="small" leading="normal" className="break-words whitespace-normal text-ui-fg-base">
                  {selectedCategory[1]}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Google category ID: {selectedCategory[0]}
                </Text>
              </div>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                {fields.google_product_category || "No category selected"}
              </Text>
            )}
          </div>
          <Input
            value={categorySearch}
            placeholder={`Search all ${taxonomy.length.toLocaleString()} Google categories by name or ID`}
            onFocus={() => setCategorySearchOpen(true)}
            onChange={(event) => {
              setCategorySearch(event.target.value)
              setCategorySearchOpen(true)
            }}
          />
          {categorySearchOpen && categorySearch.trim().length > 0 && (
            <div
              className="max-h-64 overflow-y-auto rounded-md border border-ui-border-base bg-ui-bg-base"
              role="listbox"
              aria-label="Google product categories"
            >
              {categoryResults.length > 0 ? (
                categoryResults.map(([id, path]) => (
                  <button
                    key={id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-ui-bg-base-hover"
                    onClick={() => {
                      set("google_product_category", id)
                      setCategorySearch("")
                      setCategorySearchOpen(false)
                    }}
                    role="option"
                    aria-selected={fields.google_product_category === id}
                  >
                    {path} <span className="text-ui-fg-subtle">({id})</span>
                  </button>
                ))
              ) : (
                <Text size="small" className="block px-3 py-2 text-ui-fg-subtle">
                  No matching Google categories
                </Text>
              )}
            </div>
          )}
          {fields.google_product_category && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => set("google_product_category", "")}
            >
              Clear category
            </Button>
          )}
        </div>
        <div className="grid gap-2"><Label size="small">Feed title override</Label><Input value={fields.title} placeholder="Uses product and variant title" onChange={(event) => set("title", event.target.value)} /></div>
        <div className="grid gap-2">
          <Label size="small">Global Trade Item Number (GTIN)</Label>
          <Input
            value={fields.gtin}
            placeholder="Enter the manufacturer-assigned GTIN (e.g. 12 or 13 digits)"
            onChange={(event) => set("gtin", event.target.value)}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Maps to &lt;g:gtin&gt; in the product feed. Overrides variant barcode.
          </Text>
        </div>
        <div className="grid gap-2">
          <Label size="small">Manufacturer part number (MPN)</Label>
          <Input
            value={fields.mpn}
            placeholder="Enter manufacturer part number (e.g. 15-FD0153WM)"
            onChange={(event) => set("mpn", event.target.value)}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Maps to &lt;g:mpn&gt; in the product feed. Overrides variant SKU and title part numbers.
          </Text>
        </div>
        <div className="grid gap-2">
          <Label size="small">Identifier exists</Label>
          <select className={selectClassName} value={fields.identifier_exists} onChange={(event) => set("identifier_exists", event.target.value as MerchantFields["identifier_exists"])}>
            <option value="">Determine automatically</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="google-merchant-excluded"
            checked={fields.excluded}
            onCheckedChange={(checked) => set("excluded", checked === true)}
          />
          <Label
            htmlFor="google-merchant-excluded"
            className="cursor-pointer text-sm font-normal"
          >
            Exclude this product from the Google feed
          </Label>
        </div>
        <div className="flex justify-end"><Button size="small" onClick={() => save.mutate()} isLoading={save.isPending} disabled={save.isPending}>Save Merchant settings</Button></div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "product.details.after" })

export default GoogleMerchantWidget
