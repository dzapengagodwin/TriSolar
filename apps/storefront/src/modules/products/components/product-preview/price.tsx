import { convertToLocale } from "@lib/util/money"

export type PreviewPriceProps = {
  price?: Record<string, unknown> | string | number | null
}

export default function PreviewPrice({ price }: PreviewPriceProps) {
  if (!price) {
    return null
  }

  let displayPrice = ""
  let originalPrice = ""
  let isSale = false

  if (typeof price === "string") {
    displayPrice = price
  } else if (typeof price === "number") {
    displayPrice = convertToLocale({ amount: price, currency_code: "usd" })
  } else if (typeof price.calculated_price === "string") {
    displayPrice = price.calculated_price
    if (typeof price.original_price === "string" && price.original_price !== price.calculated_price) {
      originalPrice = price.original_price
      isSale = price.price_type === "sale" || (price.percentage_diff && price.percentage_diff > 0)
    }
  } else if (typeof price.calculated_price_number === "number") {
    displayPrice = convertToLocale({
      amount: price.calculated_price_number,
      currency_code: price.currency_code || "usd",
    })
    if (typeof price.original_price_number === "number" && price.original_price_number > price.calculated_price_number) {
      originalPrice = convertToLocale({
        amount: price.original_price_number,
        currency_code: price.currency_code || "usd",
      })
      isSale = true
    }
  } else if (typeof price.calculated_amount === "number") {
    displayPrice = convertToLocale({
      amount: price.calculated_amount,
      currency_code: price.currency_code || "usd",
    })
    if (typeof price.original_amount === "number" && price.original_amount > price.calculated_amount) {
      originalPrice = convertToLocale({
        amount: price.original_amount,
        currency_code: price.currency_code || "usd",
      })
      isSale = true
    }
  } else if (typeof price.amount === "number") {
    displayPrice = convertToLocale({
      amount: price.amount,
      currency_code: price.currency_code || "usd",
    })
  } else {
    displayPrice = "$0.00"
  }

  return (
    <div className="flex items-baseline gap-x-2">
      <span className="text-xs font-bold text-gray-900" data-testid="price">
        {displayPrice}
      </span>
      {isSale && originalPrice && (
        <span
          className="text-xs line-through text-gray-400 font-normal"
          data-testid="original-price"
        >
          {originalPrice}
        </span>
      )}
    </div>
  )
}
