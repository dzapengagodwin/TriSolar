import { getBaseURL } from "@lib/util/env"

export const SITE_NAME = "Laptopzone"
export const SITE_TAGLINE = "Laptops, Computers & Tech Store in Zimbabwe"
export const SITE_DEFAULT_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`

export const DEFAULT_SITE_DESCRIPTION =
  "Laptopzone is Zimbabwe's leading destination for premium laptops, computers, accessories, and tech hardware. Authentic warranty-backed devices with fast delivery."

export const DEFAULT_LOCALE = "en_ZW"
export const DEFAULT_COUNTRY_CODE = "zw"
export const DEFAULT_CURRENCY_CODE = "USD"

export const STORE_URL = getBaseURL()

export const ORGANIZATION_INFO = {
  name: "Laptopzone",
  legalName: "Laptopzone Zimbabwe",
  url: STORE_URL,
  logo: `${STORE_URL}/favicon.png`,
  description: DEFAULT_SITE_DESCRIPTION,
  email: "support@laptopzone.co.zw",
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
