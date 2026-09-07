export type SendgridOptions = {
  api_key?: string
  from: string
  order_from_email?: string
  account_from_email?: string
  from_name?: string
  sandbox?: boolean
  storefront_url?: string
  admin_url?: string
}

export type OrderConfirmationItem = {
  title: string
  variant_title?: string
  quantity: number
  unit_price: number | string
  total_price: number | string
  thumbnail?: string
}

export type OrderConfirmationAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export type OrderConfirmationData = {
  order_id: string
  display_id: number | string
  date: string
  customer_name: string
  customer_email: string
  currency_code: string
  items: OrderConfirmationItem[]
  subtotal: number | string
  discount_total?: number | string
  gift_card_total?: number | string
  shipping_total: number | string
  tax_total?: number | string
  tax_rate?: number | string
  tax_label?: string
  total: number | string
  payment_method?: string
  payment_status?: string
  delivery_method?: string
  shipping_address?: OrderConfirmationAddress | null
  view_order_url?: string
}

export type PaymentConfirmationData = {
  order_id: string
  display_id: number | string
  customer_name: string
  customer_email: string
  amount: number | string
  currency_code: string
  payment_date: string
  payment_method?: string
  status: string
  view_order_url?: string
}

export type ShipmentConfirmationItem = {
  title: string
  quantity: number
}

export type ShipmentConfirmationData = {
  order_id: string
  display_id: number | string
  customer_name: string
  customer_email: string
  fulfillment_status: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  items: ShipmentConfirmationItem[]
  view_order_url?: string
}

export type PasswordResetData = {
  customer_name?: string
  email: string
  token: string
  reset_url: string
  expires_in_hours?: number
}

export type WelcomeData = {
  customer_name: string
  email: string
  storefront_url?: string
}

export type InviteData = {
  email: string
  token: string
  invite_url: string
  role?: string
}

export type SendgridTemplateResult = {
  subject: string
  html: string
  text: string
}
