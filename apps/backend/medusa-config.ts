import path from 'path'
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

// __dirname in the compiled build is .medusa/server/ — go up two levels to reach apps/backend/
// where the actual .env file lives
const backendDir = path.resolve(__dirname, '..', '..')
loadEnv(process.env.NODE_ENV || 'development', backendDir)
// Fallback: if still missing (e.g. launched from monorepo root), try cwd
if (!process.env.SENDGRID_API_KEY) {
  loadEnv(process.env.NODE_ENV || 'development', process.cwd())
}

const hasPesepayConfig =
  !!process.env.PESEPAY_INTEGRATION_KEY &&
  !!process.env.PESEPAY_ENCRYPTION_KEY

export default defineConfig({
  plugins: [
    {
      resolve: "@alphabite/medusa-wishlist",
      options: {
        includeWishlistItems: true,
        includeWishlistItemsTake: 50,
        allowGuestWishlist: true,
      },
    },

  ],
  featureFlags: {
    view_configurations: true,
  },
  admin: {
    disable: false,
    vite: () => {
      let reactPath: string
      let reactDomPath: string
      let reactRouterDomPath: string
      let reactRouterPath: string
      let reactRouterDomExportPath: string
      try {
        reactPath = path.dirname(require.resolve("react/package.json", { paths: [path.resolve(process.cwd(), "apps/backend"), process.cwd(), __dirname] }))
        reactDomPath = path.dirname(require.resolve("react-dom/package.json", { paths: [path.resolve(process.cwd(), "apps/backend"), process.cwd(), __dirname] }))
        reactRouterDomPath = path.dirname(require.resolve("react-router-dom/package.json", { paths: [path.resolve(process.cwd(), "apps/backend"), process.cwd(), __dirname] }))
        reactRouterPath = path.dirname(require.resolve("react-router/package.json", { paths: [path.resolve(process.cwd(), "apps/backend"), process.cwd(), __dirname] }))
        reactRouterDomExportPath = require.resolve("react-router/dom", { paths: [path.resolve(process.cwd(), "apps/backend"), process.cwd(), __dirname] })
      } catch {
        reactPath = path.resolve(process.cwd(), "node_modules/react")
        reactDomPath = path.resolve(process.cwd(), "node_modules/react-dom")
        reactRouterDomPath = path.resolve(process.cwd(), "node_modules/react-router-dom")
        reactRouterPath = path.resolve(process.cwd(), "node_modules/react-router")
        reactRouterDomExportPath = path.resolve(process.cwd(), "node_modules/react-router/dist/development/dom-export.mjs")
      }

      return {
        resolve: {
          alias: [
            { find: /^react$/, replacement: reactPath },
            { find: /^react-dom$/, replacement: reactDomPath },
            { find: /^react\/(.*)$/, replacement: `${reactPath}/$1` },
            { find: /^react-dom\/(.*)$/, replacement: `${reactDomPath}/$1` },
            { find: /^react-router-dom$/, replacement: reactRouterDomPath },
            { find: /^react-router\/dom$/, replacement: reactRouterDomExportPath },
            { find: /^react-router$/, replacement: reactRouterPath },
          ],
          dedupe: ["react", "react-dom", "react-router-dom", "react-router"],
        },
        optimizeDeps: {
          exclude: ["@alphabite/medusa-wishlist"],
        },
      }
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "./src/modules/bulk-operation",
    },
    {
      resolve: "./src/modules/brand",
    },
    {
      resolve: "./src/modules/pesepay-config",
    },
    {
      resolve: "./src/modules/product-recommendation",
    },
    {
      resolve: "./src/modules/product-review",
    },
    {
      resolve: "./src/modules/seo",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/pesepay",
            id: "pesepay",
            options: {
              integrationKey: process.env.PESEPAY_INTEGRATION_KEY,
              encryptionKey: process.env.PESEPAY_ENCRYPTION_KEY,
              environment: process.env.PESEPAY_ENV || 'sandbox',
              webhookSecret: process.env.PESEPAY_WEBHOOK_SECRET,
              callbackUrl:
                process.env.PESEPAY_CALLBACK_URL ||
                'http://localhost:8000/zw/payment-callback',
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM_EMAIL || "orders@laptopzone.co.zw",
              order_from_email: process.env.SENDGRID_ORDER_FROM_EMAIL || "orders@laptopzone.co.zw",
              order_cc_email: process.env.SENDGRID_ORDER_CC_EMAIL || "laptops@laptopzone.co.zw",
              account_from_email: process.env.SENDGRID_ACCOUNT_FROM_EMAIL || "noreply@laptopzone.co.zw",
              from_name: process.env.SENDGRID_FROM_NAME || "LaptopZone",
              sandbox: process.env.SENDGRID_SANDBOX === "true",
              storefront_url: process.env.STOREFRONT_URL || "http://localhost:8000",
              admin_url: process.env.ADMIN_URL || "http://localhost:9000/app",
            },
          },
        ],
      },
    },
  ],
})
