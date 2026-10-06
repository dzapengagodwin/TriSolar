# API Architecture

> **Scope**: Complete specification of all REST endpoints, file-based API routes, authentication mechanisms, and external webhooks in Laptopzone.

---

## 1. API Architecture & Routing Conventions

Medusa v2 uses file-based routing located under `apps/backend/src/api`:
- **Storefront Endpoints**: `src/api/store/*` (accessible via `Publishable API Key`)
- **Admin Endpoints**: `src/api/admin/*` (authenticated via Admin JWT bearer token / session)
- **Public / Unauthenticated Routes**: Configured with `export const AUTHENTICATE = false` (e.g. webhooks, public feed, branding)

---

## 2. Storefront APIs

### 2.1 Catalog & Product Endpoints

#### `GET /store/products`
- **Purpose**: Retrieve paginated list of catalog products with variant pricing and option filters.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Input (Query Params)**: `fields`, `limit`, `offset`, `category_id[]`, `collection_id[]`, `order`, `q`
- **Output**: `{ products: StoreProduct[], count: number, offset: number, limit: number }`
- **Used by**: Next.js Store page (`/[countryCode]/store`), Home page showcase, Search.

#### `GET /store/products/:id/seo`
- **Purpose**: Fetch custom SEO metadata and social graph configuration for a product.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Input**: Route param `id` (Product ID or handle)
- **Output**: `{ seo: SeoMetadataDTO | null }`
- **Dependencies**: `seo` module (`SeoMetadata` table)
- **Used by**: Next.js product page `generateMetadata()` and `ProductJsonLd`.

#### `GET /store/products/:id/reviews`
- **Purpose**: Retrieve approved customer reviews and aggregate rating score for a product.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Input**: Route param `id`
- **Output**: `{ reviews: Review[], average_rating: number, total_reviews: number }`
- **Used by**: Product Detail Page (Reviews tab).

#### `POST /store/products/:id/reviews`
- **Purpose**: Submit a new customer review for moderation.
- **Authentication**: Optional customer auth; validates verified buyer status.
- **Input (JSON Body)**: `{ rating: number, title: string, content: string, customer_name: string }`
- **Output**: `{ review: Review, success: true }`
- **Used by**: Product Detail Page review submission modal.

#### `GET /store/products/:id/recommendations`
- **Purpose**: Retrieve curated accessories and upsell products.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Input**: Route param `id`
- **Output**: `{ recommendations: StoreProduct[] }`
- **Used by**: Product Detail Page "Frequently Bought Together" & "Related Accessories".

---

### 2.2 Brand Endpoints

#### `GET /store/brands`
- **Purpose**: List all active brands with logos and product counts.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Output**: `{ brands: Brand[] }`
- **Dependencies**: `brand` module
- **Used by**: Navigation header brand dropdown, Brands index page (`/brands`).

#### `GET /store/brands/:handle`
- **Purpose**: Retrieve detailed brand info and metadata by slug.
- **Authentication**: `x-publishable-api-key: <pk_...>`
- **Output**: `{ brand: Brand }`
- **Used by**: Brand landing page (`/brands/[handle]`).

---

### 2.3 Payment & Webhook Endpoints

#### `POST /store/pesepay/webhook`
- **Purpose**: Handle asynchronous transaction notifications from Pesepay gateway.
- **Authentication**: None (`export const AUTHENTICATE = false`). Secured via AES-256 decryption using `PESEPAY_ENCRYPTION_KEY`.
- **Input (JSON Body)**: `{ payload: "<base64-encrypted-string>" }` or raw `{ referenceNumber, transactionStatus }`
- **Output**: `{ received: true, status: "SUCCESS" | "FAILED" }`
- **Dependencies**: `processPesepayWebhookWorkflow`
- **Used by**: Pesepay Payment Gateway.

#### `GET /product-feed` & `GET /store/product-feed`
- **Purpose**: Serve real-time Google Merchant Center RSS/XML product feed.
- **Authentication**: None (`export const AUTHENTICATE = false`).
- **Input (Query Params)**: `country` (default `ZW`), `currency` (default `USD`), `format` (`xml` or `json`)
- **Output**: `application/xml` RSS 2.0 product catalog or `application/json` diagnostics.
- **Dependencies**: `generateProductFeedWorkflow`
- **Used by**: Google Merchant Center automated fetcher.

---

## 3. Admin APIs

### 3.1 Brand Management
- **`GET /admin/brands`**: Paginated list of brands for admin table.
- **`POST /admin/brands`**: Create a new brand (`{ name, handle, description, logo_url }`).
- **`PUT /admin/brands/:id`**: Update brand properties.
- **`DELETE /admin/brands/:id`**: Delete a brand.

### 3.2 Product Bulk Actions & Links
- **`POST /admin/products/batch-actions`**:
  - Purpose: Batch update multiple products in a single transaction.
  - Input: `{ product_ids: string[], action: "update_status" | "assign_brand" | "assign_category" | "update_prices", payload: Record<string, unknown> }`
  - Used by: Admin Bulk Products page (`/app/bulk-products`).
- **`PUT /admin/products/:id/brand`**:
  - Purpose: Link or unlink a product to a brand.
  - Input: `{ brand_id: string | null }`
  - Dependencies: `link-product-brand` workflow.

### 3.3 Pesepay & Notification Settings
- **`GET/POST /admin/pesepay/settings`**: Read or update runtime Pesepay merchant keys and mode.
- **`POST /admin/pesepay/test-connection`**: Send an test handshake to Pesepay API to verify credentials.
- **`GET/POST /admin/notification-settings`**: Configure notification recipients for new orders.
- **`POST /admin/notification-settings/send-test`**: Trigger an immediate test email via SendGrid.

### 3.4 Migration & Import APIs
- **`POST /admin/woocommerce-migrator/test-connection`**: Test WooCommerce REST API credentials.
- **`POST /admin/woocommerce-migrator/import`**: Trigger background import of products, images, and categories.
- **`POST /admin/yoast-seo-importer/import`**: Import meta tags and keywords from WordPress into `seo_metadata`.

---

## 4. Next.js Storefront Server Routes

Located under `apps/storefront/src/app/api`:

#### `POST /api/revalidate`
- **Purpose**: On-demand ISR revalidation endpoint triggered by Medusa backend event subscribers.
- **Authentication**: Requires header `x-revalidation-secret` or query param `?secret=` matching `REVALIDATION_SECRET`.
- **Input (JSON Body)**: `{ event: string, product_id?: string, handle?: string, category_id?: string, collection_id?: string }`
- **Output**: `{ revalidated: true, tags: string[], count: number, timestamp: number }`
- **Used by**: Medusa backend `storefront-cache-invalidation.ts` subscriber.

#### `GET /api/search`
- **Purpose**: Server-side proxy for product search queries with debounce and sanitized parameters.
- **Authentication**: None.
- **Output**: `{ results: StoreProduct[] }`
- **Used by**: Storefront header search input.

#### `GET /api/image-proxy`
- **Purpose**: Proxy remote images safely to ensure valid HTTPS OpenGraph images and bypass hotlink restrictions.
- **Authentication**: None.
