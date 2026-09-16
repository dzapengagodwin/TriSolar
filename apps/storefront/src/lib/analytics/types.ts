export type GA4ConsentMode = "granted" | "denied"

export interface GA4ConsentParams {
  analytics_storage: GA4ConsentMode
  ad_storage: GA4ConsentMode
  ad_user_data: GA4ConsentMode
  ad_personalization: GA4ConsentMode
}

export interface GA4Item {
  item_id: string
  item_name: string
  affiliation?: string
  coupon?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string
  item_list_name?: string
  item_variant?: string
  location_id?: string
  price?: number
  quantity?: number
}

export interface GA4EcommerceParameters {
  currency?: string
  value?: number
  coupon?: string
  payment_type?: string
  shipping_tier?: string
  transaction_id?: string
  tax?: number
  shipping?: number
  items?: GA4Item[]
  item_list_id?: string
  item_list_name?: string
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (
      command: "config" | "event" | "consent" | "js" | "set",
      targetOrAction: string | Date | Record<string, unknown>,
      parameters?: Record<string, unknown> | string
    ) => void
  }
}

