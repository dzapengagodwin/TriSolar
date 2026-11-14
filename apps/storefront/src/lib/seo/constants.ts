import { getBaseURL } from "@lib/util/env"

export const SITE_NAME = "TRITECH"
export const SITE_TAGLINE = "Enterprise Networking & High-Performance Laptops"
export const SITE_DEFAULT_TITLE = `${SITE_NAME} | Enterprise Networking, Laptops & IT Hardware`
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`

export const DEFAULT_SITE_DESCRIPTION =
  "TRITECH is the premier destination for enterprise networking switches, WiFi 7 access points, business laptops, rackmount servers, and turnkey IT solutions. Tier-1 authorized hardware backed by official warranty."

export const DEFAULT_LOCALE = "en_ZW"
export const DEFAULT_COUNTRY_CODE = "zw"
export const DEFAULT_CURRENCY_CODE = "USD"

export const STORE_URL = getBaseURL()

export const ORGANIZATION_INFO = {
  name: "TRITECH",
  legalName: "TRITECH Technology & Networking Solutions",
  url: STORE_URL,
  logo: `${STORE_URL}/favicon.png`,
  description: DEFAULT_SITE_DESCRIPTION,
  email: "support@tritech.co.zw",
  telephone: "+263770000000",
  address: {
    streetAddress: "Harare",
    addressLocality: "Harare",
    addressCountry: "ZW",
  },
  sameAs: [
    // Real Laptopzone verified social links
  ],
}
