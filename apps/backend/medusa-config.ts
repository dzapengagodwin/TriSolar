
import path from "path"
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

// Resolve the backend directory so environment variables load correctly.
const backendDir = path.resolve(__dirname, "..", "..")

loadEnv(process.env.NODE_ENV || "development", backendDir)

// Fallback when running from the monorepo root.
if (!process.env.SENDGRID_API_KEY) {
  loadEnv(process.env.NODE_ENV || "development", process.cwd())
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
    maxUploadFileSize: 50 * 1024 * 1024,

    vite: () => {
      let reactPath: string
      let reactDomPath: string
      let reactRouterDomPath: string
      let reactRouterPath: string
      let reactRouterDomExportPath: string

      try {
        const resolvePaths = [
          path.resolve(process.cwd(), "apps/backend"),
          process.cwd(),
          __dirname,
        ]

        reactPath = path.dirname(
          require.resolve("react/package.json", { paths: resolvePaths })
        )

        reactDomPath = path.dirname(
          require.resolve("react-dom/package.json", {
            paths: resolvePaths,
          })
        )

        reactRouterDomPath = path.dirname(
          require.resolve("react-router-dom/package.json", {
            paths: resolvePaths,
          })
        )

        reactRouterPath = path.dirname(
          require.resolve("react-router/package.json", {
            paths: resolvePaths,
          })
        )

        reactRouterDomExportPath = require.resolve("react-router/dom", {
          paths: resolvePaths,
        })
      } catch {
        reactPath = path.resolve(process.cwd(), "node_modules/react")
        reactDomPath = path.resolve(process.cwd(), "node_modules/react-dom")
        reactRouterDomPath = path.resolve(
          process.cwd(),
          "node_modules/react-router-dom"
        )
        reactRouterPath = path.resolve(
          process.cwd(),
          "node_modules/react-router"
        )
        reactRouterDomExportPath = path.resolve(
          process.cwd(),
          "node_modules/react-router/dist/development/dom-export.mjs"
        )
      }

      return {
        define: {
          __MAX_UPLOAD_FILE_SIZE__: JSON.stringify(50 * 1024 * 1024),
        },

        resolve: {
          alias: [
            { find: /^react$/, replacement: reactPath },
            { find: /^react-dom$/, replacement: reactDomPath },
            {
              find: /^react\/(.*)$/,
              replacement: `${reactPath}/$1`,
            },
            {
              find: /^react-dom\/(.*)$/,
              replacement: `${reactDomPath}/$1`,
            },
            {
              find: /^react-router-dom$/,
              replacement: reactRouterDomPath,
            },
            {
              find: /^react-router-dom\/$/,
              replacement: reactRouterDomExportPath,
            },
            {
              find: /^react-router$/,
              replacement: reactRouterPath,
            },
          ],

          dedupe: [
            "react",
            "react-dom",
            "react-router-dom",
            "react-router",
          ],
        },

        optimizeDeps: {
          exclude: ["@alphabite/medusa-wishlist"],
        },
      }
    },
  },

  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    databaseDriverOptions: {
      connection: {
        ssl: false,
      },
    },

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
      resolve: "./src/modules/brand",
    },
    {
      resolve: "./src/modules/erpnext",
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
      resolve: "./src/modules/store-settings",
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
              environment: process.env.PESEPAY_ENV || "sandbox",
              webhookSecret: process.env.PESEPAY_WEBHOOK_SECRET,
              callbackUrl:
                process.env.PESEPAY_CALLBACK_URL ||
                "http://localhost:8000/zw/payment-callback",
            },
          },
        ],
      },
    },

    // Local file storage instead of S3.
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: "http://localhost:9000/static",
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
              from:
                process.env.SENDGRID_FROM_EMAIL ||
                "orders@laptopzone.co.zw",
              order_from_email:
                process.env.SENDGRID_ORDER_FROM_EMAIL ||
                "orders@laptopzone.co.zw",
              order_cc_email: process.env.SENDGRID_ORDER_CC_EMAIL,
              account_from_email:
                process.env.SENDGRID_ACCOUNT_FROM_EMAIL ||
                "noreply@laptopzone.co.zw",
              from_name: process.env.SENDGRID_FROM_NAME || "Laptopzone",
              sandbox: process.env.SENDGRID_SANDBOX === "true",
              storefront_url:
                process.env.STOREFRONT_URL || "http://localhost:8000",
              admin_url:
                process.env.ADMIN_URL || "http://localhost:9000/app",
            },
          },
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local-notification-feed",
            options: {
              channels: ["feed"],
            },
          },
        ],
      },
    },
  ],
})
