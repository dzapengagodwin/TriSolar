# ERPNext Integration Guide for Laptopzone Medusa

## 1. Overview & Architecture

The ERPNext Integration in Laptopzone Medusa is designed for safe, deterministic, and audited inventory synchronization between ERPNext and Medusa v2 (`@medusajs/medusa@2.20.1`).

### Core Design Principles

1. **SKU-First Exact Matching:** Matches ERPNext `Item.item_code` to Medusa product variant `sku` using exact, case-sensitive equality after trimming accidental surrounding whitespace. No fuzzy matching or case normalization.
2. **Read-Only SKU Audit First:** Auditing runs without database writes. It surfaces duplicate SKUs, missing SKUs, disabled items, and unmatched variants before any sync can be attempted.
3. **Inventory & Price Synchronization:** 
   - Inventory quantities (`stocked_quantity`) are updated exclusively for exact SKU matches.
   - Prices can be synchronized with ERPNext as the single source of truth (from `Item Price` DocType, e.g. "Standard Selling", or fallback `standard_rate`), matching currency codes and applying updates via Medusa's `upsertVariantPricesWorkflow`.
   - The sync **never** creates products or variants automatically, and **never** modifies titles, descriptions, handles, SEO metadata, categories, or brands.
4. **Explicit Approval Gate:** Synchronization cannot execute without an administrator reviewing a planned diff preview (showing both stock diffs and price diffs) and confirming execution with an approval token.
5. **Medusa Core Flows Integration:** Stock levels are adjusted exclusively via Medusa v2 workflows (`updateInventoryLevelsWorkflow`, `createInventoryLevelsWorkflow`). Direct SQL writes to inventory tables are strictly forbidden. Customer reservations (`reserved_quantity`) remain intact.
6. **ERPNext Sales Orders & Official Invoices (PDF):** When a Medusa order is placed, an automated subscriber creates the corresponding Sales Order in ERPNext, maps line items to ERP SKUs, downloads the official Frappe print format PDF, caches it locally (`public/sales-orders/{orderId}.pdf`), and attaches the reference to the Medusa order metadata.
7. **Admin Extensions & Order Widget:** 
   - A dedicated **ERPNext Sync** dashboard section at `/app/erpnext-sync` for auditing, mappings, previewing, and approving syncs.
   - An Order Details widget injected into the Medusa Admin (`order.details.side.after`) displaying ERPNext Sales Order reference, status badge, re-sync button, and direct "Download Sales Order PDF" action.
8. **Concurrency Mutex Lock:** Only one synchronization run can execute at a time. A durable lease with a 10-minute timeout prevents race conditions.
9. **Complete Auditability:** Every synchronization run creates durable run logs (`ErpnextSyncLog`) and item-level before-and-after audit logs (`ErpnextSyncItemLog`) tracking previous and new quantities and prices.

---

## 2. Environment Configuration

Add the following variables to `apps/backend/.env` (documented in `apps/backend/.env.template`):

```env
# ERPNext Integration
ERPNEXT_BASE_URL=https://erp.laptopzone.co.zw
ERPNEXT_API_KEY=your_frappe_api_key
ERPNEXT_API_SECRET=your_frappe_api_secret
ERPNEXT_DEFAULT_COMPANY=Laptopzone
ERPNEXT_DEFAULT_WAREHOUSE=Stores - LZ
```

> **Security Note:** Secrets are strictly loaded server-side. The Medusa Admin UI only displays whether environment variables are set and never receives or stores raw API keys or secrets.

---

## 3. Operational Workflow

### Step 1: Access ERPNext Sync in Medusa Admin
Navigate to the Medusa Admin dashboard (`/app`) and select **ERPNext Sync** in the sidebar.

### Step 2: Test Connection & Configure Mappings
1. In **Overview & Settings**, click **Test Connection** to verify API connectivity and credentials.
2. Under **Warehouse to Stock Location Mapping**, select which Medusa Stock Location corresponds to each active ERPNext Warehouse.
3. Under **Price Synchronization & Sales Orders**, configure:
   - **Sync Prices from ERPNext:** Toggle pricing synchronization on/off.
   - **ERPNext Price List:** Specify price list (e.g. `Standard Selling`).
   - **Sync Currency:** Set currency ISO code (e.g. `USD`).
   - **Auto-create Sales Order & Download PDF:** Toggle order checkout synchronization.
   - **ERPNext Print Format:** Specify Frappe print format (e.g. `Standard`).
4. Click **Save Settings**.

### Step 3: Run SKU Audit (Read-Only)
1. Navigate to the **SKU Audit** tab.
2. Click **Run SKU Audit**.
3. Review the summary metrics:
   - **Matched:** Exact 1-to-1 match between eligible ERP item and Medusa variant.
   - **ERP Only:** Item exists in ERPNext but does not exist in Medusa.
   - **Medusa Only:** Variant exists in Medusa but does not exist in ERPNext.
   - **Duplicates:** Duplicate SKUs identified in ERPNext or Medusa.
   - **Missing SKU:** Products/items with blank or missing SKU codes.
   - **Ineligible:** ERP items marked disabled or non-stock.
4. Inspect the price comparison columns (**ERP Price**, **Medusa Price**, **Price Diff**).
5. Filter by status or search by SKU/title.
6. Click **Download CSV** for an exportable report protected against spreadsheet formula injection.

### Step 4: Preview & Execute Inventory & Price Synchronization
1. Navigate to the **Inventory Sync** tab.
2. Click **Generate Preview**.
3. Inspect the planned adjustments table:
   - `UPDATE`: Stock difference exists ($Old \rightarrow New$).
   - `CREATE`: Inventory level will be created at stock location.
   - `NO_CHANGE`: Stock is already in sync; will be skipped (idempotent).
   - `UPDATE_PRICE` / `CREATE_PRICE`: Planned price rate adjustments from ERPNext.
4. Click **Approve & Execute Sync**.
5. In the confirmation dialog, review total stock and price adjustment counts and type `CONFIRM` to execute.
6. The system batches updates in chunks of 50 items and records before-and-after quantities and prices for each item.

### Step 5: Sales Order PDF Generation & Order Management
1. When a customer places an order, an event subscriber automatically creates the Sales Order in ERPNext and saves the official PDF.
2. Store administrators viewing an order in Medusa Admin will see the **ERPNext Sales Order** widget in the side panel.
3. Administrators can click **Download Sales Order PDF** to view/print the official ERP invoice, or **Re-sync** if needed.

### Step 6: Review Sync Logs
1. Navigate to the **Sync History** tab.
2. View historical execution status, timestamps, and operator.
3. Click **Inspect Items** on any run to inspect the item-level audit trail, including before-and-after quantities and prices.

---

## 4. API Endpoints Reference

All endpoints require Medusa Admin authentication:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/erpnext/test-connection` | Validates ERPNext credentials |
| `GET` | `/admin/erpnext/warehouses` | Discovers ERP warehouses and Medusa stock locations |
| `GET` | `/admin/erpnext/settings` | Retrieves current configuration and mapping (no secrets exposed) |
| `POST` | `/admin/erpnext/settings` | Updates warehouse mappings, pricing, and sales order settings |
| `POST` | `/admin/erpnext/audit` | Triggers read-only SKU audit analysis |
| `GET` | `/admin/erpnext/audit/export` | Downloads sanitized audit CSV |
| `POST` | `/admin/erpnext/sync` | Generates preview (`action: "preview"`) or executes sync (`action: "execute"`) |
| `GET` | `/admin/erpnext/logs` | Retrieves historical sync runs and item-level details |
| `GET` | `/admin/erpnext/orders/:id/sales-order-pdf` | Streams or fetches on-demand ERPNext Sales Order PDF |
| `POST` | `/admin/erpnext/orders/:id/sync-sales-order` | Manually syncs / re-syncs a Medusa order with ERPNext |

---

## 5. Security Safeguards

- **SSRF Protection:** External URLs are validated against private network addresses and cloud metadata endpoints (`169.254.169.254`).
- **Secret Redaction:** Authorization headers, tokens, and secrets are scrubbed before logging.
- **CSV Injection Protection:** Cells starting with formula characters (`=`, `+`, `-`, `@`) are prefixed with single quotes in accordance with OWASP recommendations.

