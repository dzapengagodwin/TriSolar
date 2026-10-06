import { MetadataRoute } from "next"
import { STORE_URL } from "@lib/seo/constants"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = STORE_URL.replace(/\/+$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/*/products/",
          "/*/categories/",
          "/*/brands/",
          "/*/collections/",
          "/*/store",
          "/products/",
          "/product/",
          "/brand/",
          "/categories/",
          "/brands/",
          "/collections/",
          "/store",
        ],
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/search",
          "/wishlist",
          "/api/",
          "/*/cart",
          "/*/checkout",
          "/*/account",
          "/*/wishlist",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  }
}
