import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/woocommerce-migrator/*",
      method: ["POST"],
      bodyParser: {
        sizeLimit: "50mb",
      },
    },
  ],
})
