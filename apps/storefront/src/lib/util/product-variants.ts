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

    const values = new Set(
      variants
        .map((variant) =>
          variant.options
            ?.find((variantOption) => variantOption.option_id === option.id)
            ?.value?.trim()
            .toLowerCase()
        )
        .filter((value): value is string => Boolean(value))
    )

    return values.size > 1
  })
}

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
