import { HttpTypes } from "@medusajs/types"
import { isMeaningfulOption } from "./product-option-filters"

export const getDistinctVariantOptions = (
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProductOption[] => {
  const variants = product.variants || []

  return (product.options || []).filter((option) => {
    if (!isMeaningfulOption(option.title, option.values)) {
      return false
    }

    if (variants.length === 0) {
      return true
    }

    const values = variants.map((variant) =>
      variant.options?.find(
        (variantOption) => variantOption.option_id === option.id
      )?.value
    )

    if (values.some((value) => value === undefined)) {
      return true
    }

    return new Set(values.map((value) => value.trim().toLowerCase())).size > 1
  })
}

export const getDistinguishingVariantOptions = getDistinctVariantOptions

export const getVariantOptionSummary = (
  product: HttpTypes.StoreProduct,
  variant?: HttpTypes.StoreProductVariant,
  optionGroups?: HttpTypes.StoreProductOption[]
): string => {
  if (!variant) {
    return ""
  }

  return (optionGroups || getDistinctVariantOptions(product))
    .map((option) => {
      const value = variant.options?.find(
        (variantOption) => variantOption.option_id === option.id
      )?.value

      return value ? `${option.title}: ${value}` : null
    })
    .filter((value): value is string => Boolean(value))
    .join(", ")
}