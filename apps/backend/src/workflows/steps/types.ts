export type ProductFeedAvailability =
  | "in_stock"
  | "out_of_stock"
  | "preorder"
  | "backorder"
export type ProductFeedCondition = "new" | "refurbished" | "used"

export interface ProductFeedItem {
  id: string
  title: string
  description: string
  link: string
  image_link: string
  additional_image_link?: string[]
  availability: ProductFeedAvailability
  availability_date?: string
  price: string
  sale_price?: string
  item_group_id?: string
  condition: ProductFeedCondition
  brand?: string
  gtin?: string
  mpn?: string
  identifier_exists: "yes" | "no"
  google_product_category?: string
  custom_label_0?: string
  custom_label_1?: string
  custom_label_2?: string
}

export interface ProductFeedConfig {
  country_code: string
  currency_code: string
  storefront_url: string
  feed_title?: string
  feed_description?: string
}

export interface ProductFeedDiagnostic {
  variant_id: string
  product_id: string
  title: string
  valid: boolean
  errors: string[]
  warnings: string[]
}
