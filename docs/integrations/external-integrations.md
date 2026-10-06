# External Integrations

> **Scope**: Exhaustive inventory and architectural documentation of all third-party external services, APIs, payment gateways, file storage, email providers, and analytics integrated into Laptopzone.

---

## 1. Summary of External Services

| Service | Category | Integration Type | Active In Production |
|---|---|---|---|
| **Pesepay** | Payment Gateway | Custom Medusa Payment Provider (`src/modules/pesepay`) | Yes (Primary Zimbabwean Gateway) |
| **SendGrid** | Transactional Email | Custom Notification Provider (`src/modules/sendgrid`) | Yes (Orders, Invites, Password Resets) |
| **AWS S3 / S3-Compatible** | Cloud File Storage | `@medusajs/medusa/file-s3` | Yes (Product & Brand Media) |
| **Google Analytics 4** | Web Analytics | Next.js Client Script Component (`@modules/analytics`) | Yes (`G-XXXXXXXXXX`) |
| **Google Merchant Center** | Product Feed / Shopping | Medusa RSS/XML Feed (`/product-feed`) | Yes |
| **WooCommerce REST API** | Catalog Migration | Custom Migrator Module (`woocommerce-migrator`) | On-Demand Migration Tool |
| **Yoast SEO** | SEO Migration | Custom Migrator Module (`yoast-seo-importer`) | On-Demand Migration Tool |
| **Stripe** | Payment Gateway | Optional Storefront Key (`NEXT_PUBLIC_STRIPE_KEY`) | Configured as fallback / Optional |
| **ERP Systems** | Enterprise Resource Planning | N/A | `NOT CONFIGURED / UNKNOWN` |
| **SMS / WhatsApp** | Customer Messaging | N/A | `NOT IMPLEMENTED` |

---

## 2. Detailed Service Specifications

### 2.1 Pesepay Payment Gateway

- **Purpose**: Process payments in Zimbabwe using local mobile money (EcoCash, OneMoney, Innbucks, Zimswitch) and international Visa/Mastercard.
- **Where Configured**: `apps/backend/medusa-config.ts` (Payment module options) and database `PesepayConfig` table.
- **Environment Variables**:
  - `PESEPAY_INTEGRATION_KEY`: Merchant identification key.
  - `PESEPAY_ENCRYPTION_KEY`: AES-256 secret key for encrypting and decrypting transaction requests/webhooks.
  - `PESEPAY_ENV`: `"sandbox"` or `"live"`.
  - `PESEPAY_CALLBACK_URL`: Direct browser redirect URL upon payment completion (e.g. `https://laptopzone.co.zw/payment-callback`).
  - `PESEPAY_WEBHOOK_SECRET`: Optional signature verification key for asynchronous webhooks.
- **Used by**: Medusa backend payment module, Storefront checkout, Storefront payment callback page.
- **Data Sent**: Currency (`USD`), total amount in cents, merchant transaction reference (`cart_id`), customer phone/email, redirect URL.
- **Data Received**: Transaction reference, status (`SUCCESS`, `FAILED`, `PENDING`), payment method used, transaction fee.
- **Failure Behaviour**:
  - If a user cancels or payment fails, Pesepay redirects with `?status=failed`, displaying a clear error message and allowing the customer to retry without losing their cart.
  - If the webhook payload cannot be decrypted, a warning is logged and transaction processing falls back to polling or client return verification.

---

### 2.2 SendGrid (Twilio)

- **Purpose**: Delivery of transactional emails for customer order confirmations, admin order notifications, staff invitations, and customer password resets.
- **Where Configured**: `apps/backend/medusa-config.ts` (Notification module) and `src/modules/sendgrid`.
- **Environment Variables**:
  - `SENDGRID_API_KEY`: Secret API key (`SG.xxx...`).
  - `SENDGRID_FROM_EMAIL`: Default sender email (e.g. `orders@laptopzone.co.zw`).
  - `SENDGRID_FROM_NAME`: Sender display name (e.g. `Laptopzone`).
  - `SENDGRID_ORDER_FROM_EMAIL`: Dedicated order sender address.
  - `SENDGRID_ORDER_NOTIFICATION_EMAIL`: Operational staff inbox for new order alerts.
  - `SENDGRID_ACCOUNT_FROM_EMAIL`: Account management sender (e.g. `noreply@laptopzone.co.zw`).
  - `SENDGRID_SANDBOX`: If `"true"`, validates payloads against SendGrid without dispatching actual emails.
- **Used by**: Event subscribers (`order-placed.ts`, `customer-created.ts`, `auth-password-reset.ts`, `invite-created.ts`, `order-fulfillment-created.ts`).
- **Data Sent**: Recipient email address, order details, line item breakdown, pricing, shipping address, store URLs.
- **Data Received**: SendGrid response status (HTTP 202 Accepted) or error message.
- **Failure Behaviour**: Network errors and delivery exceptions are trapped and logged using Medusa's internal logger without halting the transaction or dropping the order in the database.

---

### 2.3 AWS S3 / Cloud Storage

- **Purpose**: Scalable cloud object storage for product photography, variant images, brand logos, and store banners.
- **Where Configured**: `apps/backend/medusa-config.ts` (File module with `@medusajs/medusa/file-s3`).
- **Environment Variables**:
  - `S3_BUCKET`: Target S3 bucket name.
  - `S3_REGION`: AWS region code (e.g. `af-south-1`, `eu-west-1`, or `us-east-1`).
  - `S3_ACCESS_KEY_ID`: IAM user access key.
  - `S3_SECRET_ACCESS_KEY`: IAM user secret key.
  - `S3_FILE_URL`: Public base URL for uploaded assets (S3 direct or CloudFront CDN domain).
  - `S3_ENDPOINT`: Custom S3 endpoint URL (if using MinIO, Cloudflare R2, or DigitalOcean Spaces).
- **Used by**: Medusa Admin media picker, Product ingestion workflows, WooCommerce media importer.
- **Data Sent**: Binary image files (JPEG, PNG, WebP) up to 50MB.
- **Data Received**: Publicly accessible asset URL.
- **Failure Behaviour**: Upload exceptions are propagated back to the admin UI with a descriptive toast notification; broken uploads prevent saving orphaned image records.

---

### 2.4 Google Analytics 4

- **Purpose**: Monitor web traffic, page views, and user engagement on the Next.js storefront.
- **Where Configured**: Storefront root layout (`apps/storefront/src/app/layout.tsx`) via `@modules/analytics/components/google-analytics`.
- **Environment Variables**:
  - `NEXT_PUBLIC_GA_ID`: GA4 Measurement ID (`G-XXXXXXXXXX`).
- **Used by**: Next.js client-side scripts.
- **Data Sent**: Anonymized user events, route changes, page views, and screen resolutions.
- **Failure Behaviour**: If `NEXT_PUBLIC_GA_ID` is omitted or ad-blockers block the script, the storefront continues rendering normally with zero impact on commerce functionality.

---

### 2.5 Google Merchant Center

- **Purpose**: Synchronize live laptop and electronics inventory with Google Shopping ads and organic product listings.
- **Where Configured**: `apps/backend/src/api/product-feed/route.ts` and `apps/backend/src/workflows/generate-product-feed.ts`.
- **Environment Variables**:
  - `MERCHANT_COUNTRY`: ISO country code (default: `ZW`).
  - `MERCHANT_CURRENCY`: Currency code (default: `USD`).
  - `STOREFRONT_URL`: Base storefront domain for product canonical links.
- **Used by**: Google Merchant Center automated periodic HTTP crawler.
- **Data Sent**: XML feed containing item titles, pricing, stock availability, condition, brand, and product image links.
- **Failure Behaviour**: Validations flag missing variants or unmapped attributes in JSON mode (`?format=json`), preventing feed sync crashes.

---

### 2.6 WooCommerce & Yoast SEO Importers

- **Purpose**: One-time or batch migration of legacy product catalog, categories, image attachments, and Yoast SEO metadata from WordPress.
- **Where Configured**: Admin UI (`/app/woocommerce-migrator` & `/app/yoast-seo-importer`).
- **Environment Variables (Optional overrides)**:
  - `WP_URL`: WordPress base domain.
  - `WC_CONSUMER_KEY`: WooCommerce REST API Consumer Key (`ck_...`).
  - `WC_CONSUMER_SECRET`: WooCommerce REST API Consumer Secret (`cs_...`).
- **Used by**: Admin operations during catalog synchronization.
- **Data Sent**: API credentials and query parameters.
- **Data Received**: Product records, categories, featured image URLs, Yoast meta title and description tags.
- **Failure Behaviour**: Connection tester provides explicit error diagnostic messages before launching full import jobs.
