# Technology Stack

Laptopzone is built as a **Turborepo** monorepo using **npm** as the package manager (detected from `package.json` `"packageManager": "npm@10.9.3"`). The key versions are:

| Component | Version | Source |
|-----------|---------|--------|
| Node.js | `>=20` (engine constraint in both root and backend `package.json`) | `package.json` `engines.node` |
| npm | `10.9.3` (explicit in `package.json`) | `package.json` `packageManager` |
| Turborepo | `^2.0.14` | root `package.json` `devDependencies.turbo` |
| **Backend (Medusa)** | | |
| Medusa framework | `2.20.1` | `apps/backend/package.json` `dependencies.@medusajs/medusa` |
| Medusa CLI | `2.20.1` | `apps/backend/package.json` `dependencies.@medusajs/cli` |
| Medusa UI | `4.2.3` | `apps/backend/package.json` `dependencies.@medusajs/ui` |
| Medusa Dashboard | `2.20.1` | `apps/backend/package.json` `dependencies.@medusajs/dashboard` |
| Medusa JS SDK (server‑side) | `^2.20.1` | `apps/backend/package.json` `dependencies.@medusajs/js-sdk` |
| Zod (validation) | `4.2.0` | `apps/backend/package.json` `dependencies.zod` |
| **Frontend (Storefront)** | | |
| Next.js | `15.5.21` | `apps/storefront/package.json` `dependencies.next` |
| React | `19.0.5` | `apps/storefront/package.json` `dependencies.react` & `react-dom` |
| Tailwind CSS | `^3.0.23` | `apps/storefront/package.json` `devDependencies.tailwindcss` |
| @medusajs/js-sdk (client) | `^2.20.1` | `apps/storefront/package.json` `dependencies.@medusajs/js-sdk` |
| @medusajs/icons | `2.20.1` | `apps/storefront/package.json` `dependencies.@medusajs/icons` |
| @medusajs/ui-preset | `2.20.1` | `apps/storefront/package.json` `dependencies.@medusajs/ui-preset` |
| Stripe (payment UI) | `^5.3.0` (`@stripe/react-stripe-js`) and `^8.2.0` (`@stripe/stripe-js`) | `apps/storefront/package.json` |
| Google Analytics (GA4) | Integrated via a custom `GoogleAnalytics` component that reads `NEXT_PUBLIC_GA_ID` from env | `apps/storefront/src/app/layout.tsx` |
| PostgreSQL driver | `pg@^8.11.3` | `apps/storefront/package.json` `dependencies.pg` |
| TypeScript | `^5.3.2` (frontend) and `^5.6.2` (backend) | respective `devDependencies.typescript` |
| ESLint | `^9.39.4` (frontend) and `@medusajs/eslint-plugin` for backend rules | root and backend `devDependencies` |
| Prettier | `^3.2.5` (frontend) and `^2.8.8` (backend) | `devDependencies` |

**Key tooling**
- **Turborepo** orchestrates builds, dev servers, linting, and tests across the two apps.
- **Medusa framework** provides the headless commerce API, database migrations, and extensible modules.
- **Next.js App Router** (file‑based routing under `src/app`) powers the storefront UI.
- **Tailwind CSS** for styling, with the `tailwindcss-radix` plugin for radix UI components.
- **Stripe** is used for payment collection on the checkout pages.
- **Google Analytics 4** is integrated client‑side for event tracking.

---

**Other notable dependencies**
- `@aws-sdk/client-s3` – used for assets storage.
- `@sendgrid/mail` – email sending (e.g., order confirmations).
- `@alphabite/medusa-wishlist` – wishlist feature.
- `@tanstack/react-query` – data fetching/caching.
- `react-i18next` – internationalisation support.
- `zod-validation-error` – enhanced error messages for Zod validation.

All versions are taken directly from the repository's `package.json` files; no assumptions have been made about un‑present packages.
