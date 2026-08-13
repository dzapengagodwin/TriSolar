import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const hasPesepayConfig =
  !!process.env.PESEPAY_INTEGRATION_KEY &&
  !!process.env.PESEPAY_ENCRYPTION_KEY

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: hasPesepayConfig
          ? [
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
                    'http://localhost:8000/us/order/confirmed',
                },
              },
            ]
          : [],
      },
    },
  ],
})
