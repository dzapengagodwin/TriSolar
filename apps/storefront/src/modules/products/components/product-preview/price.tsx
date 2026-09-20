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
  } else if (typeof price === "object") {
    const p = price as Record<string, unknown>
    if (typeof p.calculated_price === "string") {
      displayPrice = p.calculated_price
      if (
        typeof p.original_price === "string" &&
        p.original_price !== p.calculated_price
      ) {
        originalPrice = p.original_price
        const diff = Number(p.percentage_diff) || 0
        isSale = p.price_type === "sale" || diff > 0
      }
    } else if (typeof p.calculated_price_number === "number") {
      const curr = (p.currency_code as string) || "usd"
      displayPrice = convertToLocale({
        amount: p.calculated_price_number,
        currency_code: curr,
      })
      if (
        typeof p.original_price_number === "number" &&
        p.original_price_number > p.calculated_price_number
      ) {
        originalPrice = convertToLocale({
          amount: p.original_price_number,
          currency_code: curr,
        })
        isSale = true
      }
    } else if (typeof p.calculated_amount === "number") {
      const curr = (p.currency_code as string) || "usd"
      displayPrice = convertToLocale({
        amount: p.calculated_amount,
        currency_code: curr,
      })
      if (
        typeof p.original_amount === "number" &&
        p.original_amount > p.calculated_amount
      ) {
        originalPrice = convertToLocale({
          amount: p.original_amount,
          currency_code: curr,
        })
        isSale = true
      }
    } else if (typeof p.amount === "number") {
      const curr = (p.currency_code as string) || "usd"
      displayPrice = convertToLocale({
        amount: p.amount,
        currency_code: curr,
      })
    } else {
      displayPrice = "$0.00"
    }
  } else {
    displayPrice = "$0.00"
  }

  return (
    <div className="flex items-baseline gap-x-2">
      <span className="text-[15px] sm:text-base font-bold text-gray-900" data-testid="price">
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
