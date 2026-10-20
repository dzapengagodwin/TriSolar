import { HttpTypes } from "@medusajs/types"

export const getDistinguishingVariantOptions = (
  product: Pick<HttpTypes.StoreProduct, "options" | "variants">
) => {
  const options = product.options || []
  const variants = product.variants

  if (!variants?.length) {
    return options
  }

  return options.filter((option) => {
    const values = variants.map(
      (variant) =>
        variant.options?.find(
          (variantOption) => variantOption.option_id === option.id
        )?.value
    )

    if (values.some((value) => value === undefined)) {
      return true
    }

    return new Set(values).size > 1
  })
}
