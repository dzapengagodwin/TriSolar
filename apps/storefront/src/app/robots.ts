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
          "/shop",
          "/products/",
          "/product/",
          "/categories/",
          "/brands/",
          "/brand/",
          "/collections/",
          "/store",
          "/*/shop",
          "/*/products/",
          "/*/categories/",
          "/*/brands/",
          "/*/collections/",
          "/*/store",
          "/_next/static/",
          "/_next/image",
        ],
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/order",
          "/order/",
          "/payment-callback",
          "/verify-account",
          "/search",
          "/wishlist",
          "/api/",
          "/*/cart",
          "/*/checkout",
          "/*/account",
          "/*/order",
          "/*/order/",
          "/*/payment-callback",
          "/*/verify-account",
          "/*/wishlist",
        ],
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "Facebot",
        allow: "/",
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "Pinterestbot",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
      {
        userAgent: "TelegramBot",
        allow: "/",
      },
      {
        userAgent: "Storebot-Google",
        allow: "/",
      },
      {
        userAgent: "Google-InspectionTool",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/product-sitemap.xml`,
      `${baseUrl}/category-sitemap.xml`,
      `${baseUrl}/brand-sitemap.xml`,
      `${baseUrl}/pages-sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  }
}
