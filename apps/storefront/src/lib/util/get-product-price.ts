import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-percentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any) => {
  if (!variant) {
    return null
  }

  const calcObj = variant.calculated_price
  if (!calcObj) {
    return null
  }

  // Handle both Medusa 2.0 price structure & standard amounts
  const amount =
    typeof calcObj.calculated_amount === "number"
      ? calcObj.calculated_amount
      : typeof calcObj.amount === "number"
      ? calcObj.amount
      : typeof calcObj === "number"
      ? calcObj
      : 0

  const originalAmount =
    typeof calcObj.original_amount === "number"
      ? calcObj.original_amount
      : amount

  const currencyCode =
    calcObj.currency_code || variant.currency_code || "usd"

  const priceType =
    typeof calcObj.price_list_type === "string"
      ? calcObj.price_list_type
      : calcObj.price_type || "default"

  return {
    calculated_price_number: amount,
    calculated_price: convertToLocale({
      amount,
      currency_code: currencyCode,
    }),
    original_price_number: originalAmount,
    original_price: convertToLocale({
      amount: originalAmount,
      currency_code: currencyCode,
    }),
    currency_code: currencyCode,
    price_type: priceType,
    percentage_diff: getPercentageDiff(originalAmount, amount),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant = (product.variants as any[])
      .filter((v) => !!v.calculated_price)
      .sort((a, b) => {
        const aAmount = a.calculated_price?.calculated_amount ?? a.calculated_price?.amount ?? 0
        const bAmount = b.calculated_price?.calculated_amount ?? b.calculated_price?.amount ?? 0
        return aAmount - bAmount
      })[0]

    return getPricesForVariant(cheapestVariant || product.variants[0])
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant)
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}
