# Laptopzone

> Zimbabwe's premier laptop and electronics e-commerce platform. Built as a high-performance headless commerce monorepo powered by **Medusa v2** and **Next.js 15 (App Router)**.

---

## 1. Overview

Laptopzone ([laptopzone.co.zw](https://laptopzone.co.zw)) is an enterprise headless commerce system engineered for reliability, local Zimbabwean payment processing, fast catalog search, and search engine visibility.

The repository is organized as a Turborepo workspace:

- **`apps/backend`** (`@dtc/backend`): Medusa v2 headless commerce engine, REST APIs, and embedded Vite Admin panel (`/app`).
- **`apps/storefront`** (`@dtc/storefront`): Next.js 15 App Router storefront with React 19, Tailwind CSS, and on-demand ISR caching.
- **`docs/`**: Comprehensive engineering and architecture documentation suite with an interactive browser viewer.

---

## 2. Core Features & Customizations

### Zimbabwean Payment Processing (Pesepay)
- Native integration with **Pesepay** supporting EcoCash, OneMoney, Zimswitch, and Visa/Mastercard.
- Synchronous browser callback handling (`/payment-callback`) and asynchronous AES-256 encrypted webhook verification (`/store/pesepay/webhook`).

### Transactional Email Automation (SendGrid)
- Automated dispatch of responsive HTML customer order receipts and operational admin notifications.
- Event-driven subscribers handling order placements, payment captures, fulfillments, invites, and password resets.

### Specialized Hardware Catalog
- Custom **Brand Module** (`src/modules/brand`) linked to products (Lenovo, HP, Dell, Apple, etc.).
- Product specifications, options, and variant inventory tracking.
- Drag-and-drop product recommendations and customer review moderation.

### Advanced SEO & Google Merchant Center
- Polymorphic **SEO Metadata Module** (`src/modules/seo`) supporting page-level titles, descriptions, and focus keyphrases.
- Real-time Google Merchant Center product catalog feed (`/product-feed`).
- Canonical URL engine stripping regional prefixes, automated XML sitemaps, image sitemaps, and Schema.org JSON-LD structured data.

### Intelligent Cache Synchronization
- Event subscriber listening to catalog, inventory, and pricing mutations.
- Authenticated webhooks triggering targeted Next.js Incremental Static Regeneration (`revalidateTag()`).

---

## 3. Technology Stack

- **Monorepo Manager**: Turborepo (`^2.0.14`)
- **Package Manager**: npm (`10.9.3`)
- **Backend Framework**: Medusa v2 (`2.20.1`)
- **Frontend Framework**: Next.js (`15.5.21`) with React (`19.0.5`)
- **Database**: PostgreSQL 15+
- **Cache & Event Bus**: Redis
- **Object Storage**: AWS S3 (`@medusajs/medusa/file-s3`)
- **Styling**: Tailwind CSS
- **Deployment**: Ubuntu Linux VPS, systemd supervision, Caddy/Nginx reverse proxy, and GitHub Actions CI/CD.

---

## 4. Getting Started

### Prerequisites

- **Node.js**: v20+ (CI uses v22.22.1)
- **npm**: v10+
- **PostgreSQL**: v15+
- **Redis**: v6+

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd my-medusa-store
npm ci
```

### 2. Backend Configuration

Create the backend environment file:

```bash
cp apps/backend/.env.template apps/backend/.env
```

Configure your PostgreSQL database URL, Redis, and secret keys in `apps/backend/.env`:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/laptopzone_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
STORE_CORS=http://localhost:8000,https://laptopzone.co.zw
ADMIN_CORS=http://localhost:9000,http://localhost:5173
AUTH_CORS=http://localhost:9000,http://localhost:5173
```

Run database migrations and create an initial administrator account:

```bash
cd apps/backend
npx medusa db:migrate
npx medusa user -e admin@laptopzone.co.zw -p supersecret
cd ../..
```

### 3. Storefront Configuration

Create the storefront environment file:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Set the publishable API key generated in the Medusa Admin (`/app -> Settings -> Publishable API Keys`):

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=zw
REVALIDATION_SECRET=your_revalidation_secret_matching_backend
```

---

## 5. Development Commands

Run from the repository root:

```bash
# Start both Backend (:9000) and Storefront (:8000)
npm run dev

# Start Backend only (Admin dashboard at http://localhost:9000/app)
npm run backend:dev

# Start Storefront only (http://localhost:8000)
npm run storefront:dev

# Run tests
npm run test

# Run code linting
npm run lint

# Build all applications for production
npm run build

# Start the interactive documentation browser viewer (http://localhost:3333)
npm run docs:serve
```

---

## 6. Architecture & Documentation

Comprehensive architectural specifications and diagrams are maintained in the [`docs/`](./docs) directory:

- [Master Documentation Index](docs/README.md)
- [System Architecture Overview](docs/architecture/overview.md)
- [Medusa Backend Architecture](docs/medusa/architecture.md)
- [Storefront Routing & UI Components](docs/storefront/routing-and-components.md)
- [Product Architecture & Lifecycle](docs/products/architecture.md)
- [SEO Architecture & Google Merchant Feed](docs/seo/architecture.md)
- [Country & Location Architecture](docs/location/country-and-location.md)
- [API Architecture & Route Specifications](docs/api/architecture.md)
- [Data Flows & Sequence Diagrams](docs/data-flows/data-flows.md)
- [External Integrations](docs/integrations/external-integrations.md)
- [Environment Variables Reference](docs/ENVIRONMENT.md)
- [Production Deployment Architecture](docs/deployment/architecture.md)
- [CI/CD Pipelines & Automation](docs/ci-cd/pipelines.md)

To browse the documentation in your browser with live search and rendered Mermaid diagrams, run:

```bash
npm run docs:serve
```

And open `http://localhost:3333`.

---

## 7. License

Private proprietary software for Laptopzone Zimbabwe. All rights reserved.
