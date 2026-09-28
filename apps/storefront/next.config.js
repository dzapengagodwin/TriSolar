const path = require("path")
const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Cloud storage and storefront environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [60, 75, 85],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "laptopzone.co.zw",
      },
      {
        protocol: "https",
        hostname: "*.laptopzone.co.zw",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  async redirects() {
    return [
      {
        source: "/:countryCode/terms-and-conditions",
        destination: "/:countryCode/terms",
        permanent: true,
      },
      {
        source: "/:countryCode/content/terms-of-use",
        destination: "/:countryCode/terms",
        permanent: true,
      },
      {
        source: "/:countryCode/privacy-policy",
        destination: "/:countryCode/privacy",
        permanent: true,
      },
      {
        source: "/:countryCode/content/privacy-policy",
        destination: "/:countryCode/privacy",
        permanent: true,
      },
      {
        source: "/:countryCode/warranty-policy",
        destination: "/:countryCode/warranty",
        permanent: true,
      },
      {
        source: "/:countryCode/shipping-policy",
        destination: "/:countryCode/shipping",
        permanent: true,
      },
      {
        source: "/:countryCode/delivery-and-shipping",
        destination: "/:countryCode/shipping",
        permanent: true,
      },
      {
        source: "/:countryCode/cookie-policy",
        destination: "/:countryCode/cookies",
        permanent: true,
      },
      {
        source: "/:countryCode/returns-and-refunds",
        destination: "/:countryCode/returns",
        permanent: true,
      },
      {
        source: "/:countryCode/refund-policy",
        destination: "/:countryCode/returns",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
