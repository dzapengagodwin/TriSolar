import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      bodyParser: {
        sizeLimit: "50mb",
      },
    },
    {
      matcher: "/store/*",
      bodyParser: {
        sizeLimit: "20mb",
      },
    },
    {
      matcher: "/store/image-proxy",
      method: ["GET"],
      bodyParser: false,
    },
  ],
})
