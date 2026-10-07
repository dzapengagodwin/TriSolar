# Environment Variables Reference

> **Security Notice**: Never commit `.env` or `.env.local` files to version control. The examples below contain sanitized placeholder values (`<secret>`, `YOUR_KEY_HERE`).

This document lists all environment variables used by the **Laptopzone** monorepo across the Medusa backend (`apps/backend`) and Next.js storefront (`apps/storefront`).

---

## 1. Medusa Backend (`apps/backend/.env`)

| Variable Name | Purpose | Required / Optional | Used By | Example Format |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **Required** | Medusa Core & Custom Modules | `postgres://user:password@localhost:5432/medusa_db` |
| `DB_NAME` | Database name | Optional | Local setup scripts | `medusa-backend` |
| `REDIS_URL` | Redis instance for event bus and caching | Optional in local dev, **Required** in prod | Medusa Core & Subscribers | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key used to sign Admin & Customer JWT auth tokens | **Required** | Medusa Core Authentication | `<secure-random-32-char-string>` |
| `COOKIE_SECRET` | Secret key used to sign HTTP cookies | **Required** | Medusa Core Cookie Handler | `<secure-random-32-char-string>` |
| `STORE_CORS` | Allowed CORS origins for Storefront API requests | **Required** | Medusa HTTP Middleware | `http://localhost:8000,https://laptopzone.co.zw` |
| `ADMIN_CORS` | Allowed CORS origins for Admin Dashboard requests | **Required** | Medusa HTTP Middleware | `http://localhost:9000,https://dev.laptopzone.co.zw` |
| `AUTH_CORS` | Allowed CORS origins for Authentication endpoints | **Required** | Medusa Auth Middleware | `http://localhost:9000,https://dev.laptopzone.co.zw` |
| `STOREFRONT_URL` | Base URL of the storefront for email links & cache hooks | **Required** | Subscribers & Email Templates | `https://laptopzone.co.zw` |
| `ADMIN_URL` | Base URL of the admin panel for staff alert links | Optional | Email Templates | `https://dev.laptopzone.co.zw/app` |
| `REVALIDATION_SECRET` | Shared secret to authorize on-demand ISR cache busting | **Required** | `storefront-cache-invalidation.ts` | `<secure-shared-secret>` |
| `S3_BUCKET` | AWS S3 bucket name for product images | Optional in dev, **Required** in prod | File S3 Provider | `laptopzone-media-bucket` |
| `S3_REGION` | AWS S3 geographic region | Optional in dev, **Required** in prod | File S3 Provider | `af-south-1` |
| `S3_ACCESS_KEY_ID` | IAM User Access Key for S3 storage | Optional in dev, **Required** in prod | File S3 Provider | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_ACCESS_KEY` | IAM User Secret Key for S3 storage | Optional in dev, **Required** in prod | File S3 Provider | `<aws-secret-access-key>` |
| `S3_FILE_URL` | Public base URL or CDN domain for uploaded images | Optional in dev, **Required** in prod | File S3 Provider | `https://cdn.laptopzone.co.zw` |
| `S3_ENDPOINT` | Custom endpoint for S3-compatible providers (R2, MinIO) | Optional | File S3 Provider | `https://s3.af-south-1.amazonaws.com` |
| `PESEPAY_INTEGRATION_KEY` | Pesepay Merchant Integration Key | Optional in dev, **Required** for payments | Pesepay Payment Provider | `<pesepay-integration-key>` |
| `PESEPAY_ENCRYPTION_KEY` | Pesepay AES-256 Encryption & Decryption Key | Optional in dev, **Required** for payments | Pesepay Provider & Webhooks | `<32-char-encryption-key>` |
| `PESEPAY_ENV` | Active Pesepay processing environment | Optional (default: `sandbox`) | Pesepay Payment Provider | `sandbox` or `live` |
| `PESEPAY_CALLBACK_URL` | Browser redirect URL after Pesepay checkout | Optional | Pesepay Payment Provider | `https://laptopzone.co.zw/zw/payment-callback` |
| `PESEPAY_WEBHOOK_SECRET` | Signature secret for Pesepay webhooks | Optional | Pesepay Webhook Endpoint | `<webhook-secret>` |
| `SENDGRID_API_KEY` | SendGrid transactional mail API key | Optional in dev, **Required** for emails | SendGrid Module & Subscribers | `SG.<sendgrid-api-key>` |
| `SENDGRID_FROM_EMAIL` | Default sender email address | Optional (default: `orders@laptopzone.co.zw`) | SendGrid Module | `orders@laptopzone.co.zw` |
| `SENDGRID_FROM_NAME` | Default sender display name | Optional (default: `Laptopzone`) | SendGrid Module | `Laptopzone Zimbabwe` |
| `SENDGRID_ORDER_FROM_EMAIL`| Sender email address for order confirmation receipts | Optional | SendGrid Module | `orders@laptopzone.co.zw` |
| `SENDGRID_ORDER_NOTIFICATION_EMAIL`| Operational recipient address for new order alerts | Optional | `order-placed.ts` Subscriber | `admin@laptopzone.co.zw` |
| `SENDGRID_ACCOUNT_FROM_EMAIL`| Sender address for password resets and invites | Optional | SendGrid Module | `noreply@laptopzone.co.zw` |
| `SENDGRID_SANDBOX` | Toggle SendGrid sandbox mode | Optional (default: `false`) | SendGrid Module | `true` or `false` |
| `SENDGRID_WEBSITE_LIST_ID` | SendGrid Marketing Contacts List ID for Newsletter Signups | Optional in dev, **Required** for newsletter | SendGrid Contacts API | `<sendgrid-list-id-uuid>` |
| `MERCHANT_COUNTRY` | Default country for Google Merchant XML feed | Optional (default: `ZW`) | Product Feed API | `ZW` |
| `MERCHANT_CURRENCY` | Default currency for Google Merchant XML feed | Optional (default: `USD`) | Product Feed API | `USD` |

---

## 2. Next.js Storefront (`apps/storefront/.env`)

> **Note**: Variables prefixed with `NEXT_PUBLIC_` are inlined into the client-side JavaScript bundle during the build step. Never store private secrets in `NEXT_PUBLIC_` variables.

| Variable Name | Purpose | Required / Optional | Used By | Example Format |
|---|---|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Base HTTP URL of the Medusa backend server | **Required** | Storefront SDK & Data Fetchers | `http://localhost:9000` or `https://dev.laptopzone.co.zw` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa publishable API key for store endpoints | **Required** | Storefront Client & Middleware | `pk_<medusa-publishable-key>` |
| `NEXT_PUBLIC_BASE_URL` | Public canonical website domain for SEO and schema | **Required** | SEO canonical engine & Sitemaps | `https://laptopzone.co.zw` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Fallback ISO country code for region resolution | Optional (default: `zw`) | Storefront Middleware & Data Layer | `zw` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID | Optional | GA4 Tracking Component | `G-XXXXXXXXXX` |
| `REVALIDATION_SECRET` | Server-only shared secret for Next.js ISR tag revalidation | **Required** | `apps/storefront/src/app/api/revalidate` | `<same-secret-as-backend>` |
| `NEXT_PUBLIC_STRIPE_KEY` | Optional public Stripe publishable key | Optional | Stripe Payment Element | `pk_test_...` |
| `MEDUSA_CLOUD_S3_HOSTNAME` | Hostname filter for remote Next.js image optimization | Optional | `next.config.js` | `laptopzone-media.s3.amazonaws.com` |
| `MEDUSA_CLOUD_S3_PATHNAME` | Pathname filter for remote Next.js image optimization | Optional | `next.config.js` | `/**` |

> **Note**: SendGrid configuration (`SENDGRID_API_KEY`, `SENDGRID_WEBSITE_LIST_ID`) is maintained securely on the Medusa backend in `apps/backend/.env`. The storefront delegates newsletter subscriptions to the backend.

---

## 3. GitHub Actions CI/CD Secrets

Configured in GitHub Repository Settings -> Secrets and variables -> Actions:

| Secret / Variable Name | Category | Purpose | Example |
|---|---|---|---|
| `SERVER_HOST` | Secret | Production server IP or hostname for SSH deployment | `192.0.2.1` or `ssh.laptopzone.co.zw` |
| `SERVER_USER` | Secret | SSH login user on the host machine | `root` or `deploy` |
| `SERVER_SSH_KEY` | Secret | Private SSH key for host authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Repository Variable | Injected into the CI build step to compile Next.js static pages | `pk_01...` |
