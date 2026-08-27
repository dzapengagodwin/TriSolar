import { MetadataRoute } from "next"
import { STORE_URL } from "@lib/seo/constants"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = STORE_URL.replace(/\/+$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/search",
          "/wishlist",
          "/api/",
          "/*?*v_id=",
          "/*?*sortBy=",
          "/*?*page=",
          "/*?*price=",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
