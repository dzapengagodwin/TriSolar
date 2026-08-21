import { HttpTypes } from "@medusajs/types"

export const OPTION_VALUE_QUERY_KEY = "optionValueIds"

export type OptionValueIds = string[]

export type ScopedOptionValue = {
  id: string
  valueIds: string[]
  label: string
  count: number
}

export type ScopedProductOption = {
  id: string
  title: string
  values: ScopedOptionValue[]
}

export const parseOptionValueIds = (
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): OptionValueIds => {
  if (typeof (searchParams as URLSearchParams).getAll === "function") {
    const values = (searchParams as URLSearchParams).getAll(OPTION_VALUE_QUERY_KEY)
    return Array.from(new Set(values.filter(Boolean)))
  }

  const paramValue = (
    searchParams as Record<string, string | string[] | undefined>
  )[OPTION_VALUE_QUERY_KEY]

  if (Array.isArray(paramValue)) {
    return Array.from(new Set(paramValue.filter(Boolean)))
  }

  if (typeof paramValue === "string" && paramValue.length > 0) {
    return paramValue.split(",").filter(Boolean)
  }

  return []
}

/**
 * Determines whether a product option is a meaningful configurable option
 * rather than a Medusa placeholder (e.g. "Default Option" with "Default Value").
 */
export const isMeaningfulOption = (
  title?: string | null,
  values?: { value?: string }[]
): boolean => {
  if (!title) return false
  const cleanTitle = title.trim().toLowerCase()
  if (
    cleanTitle === "default option" ||
    cleanTitle === "default" ||
    cleanTitle === "title"
  ) {
    return false
  }

  if (!values || values.length === 0) return false

  // If the only value is "Default Value" or "Default", it is a placeholder option
  if (
    values.length === 1 &&
    (values[0].value?.toLowerCase() === "default value" ||
      values[0].value?.toLowerCase() === "default")
  ) {
    return false
  }

  return true
}

/**
 * Dynamically extracts and aggregates product options exclusively from the
 * provided scoped product list (e.g., products in the current category, search results, or collection).
 *
 * Scoped behavior:
 * - A Laptop category with RAM & Storage options will only extract RAM & Storage.
 * - A Clothing category with Size & Color options will only extract Size & Color.
 * - Empty/placeholder options are filtered out.
 */
export const extractScopedProductOptions = (
  products: HttpTypes.StoreProduct[]
): ScopedProductOption[] => {
  if (!products || products.length === 0) {
    return []
  }

  // Map of normalized option title -> ScopedProductOption
  const optionGroups = new Map<
    string,
    {
      title: string
      valuesMap: Map<
        string,
        { label: string; valueIds: Set<string>; productIds: Set<string> }
      >
    }
  >()

  for (const product of products) {
    if (!product.options || product.options.length === 0) {
      continue
    }

    for (const option of product.options) {
      if (!isMeaningfulOption(option.title, option.values)) {
        continue
      }

      const rawTitle = (option.title || "").trim()
      const normalizedTitleKey = rawTitle.toLowerCase()

      if (!optionGroups.has(normalizedTitleKey)) {
        optionGroups.set(normalizedTitleKey, {
          title: rawTitle,
          valuesMap: new Map(),
        })
      }

      const group = optionGroups.get(normalizedTitleKey)!

      for (const val of option.values || []) {
        if (!val || !val.value) continue
        const rawValue = val.value.trim()
        const normalizedValKey = rawValue.toLowerCase()

        if (!group.valuesMap.has(normalizedValKey)) {
          group.valuesMap.set(normalizedValKey, {
            label: rawValue,
            valueIds: new Set(),
            productIds: new Set(),
          })
        }

        const valueEntry = group.valuesMap.get(normalizedValKey)!
        if (val.id) {
          valueEntry.valueIds.add(val.id)
        }
        if (product.id) {
          valueEntry.productIds.add(product.id)
        }
      }
    }
  }

  const result: ScopedProductOption[] = []

  for (const [key, group] of optionGroups.entries()) {
    const values: ScopedOptionValue[] = []

    for (const [, entry] of group.valuesMap.entries()) {
      const valueIdsArray = Array.from(entry.valueIds)
      if (valueIdsArray.length === 0) continue

      values.push({
        id: valueIdsArray[0],
        valueIds: valueIdsArray,
        label: entry.label,
        count: entry.productIds.size,
      })
    }

    if (values.length > 0) {
      // Sort values naturally (e.g. 8GB before 16GB before 32GB, or S before M before L)
      values.sort((a, b) => {
        const numA = parseFloat(a.label.replace(/[^0-9.]/g, ""))
        const numB = parseFloat(b.label.replace(/[^0-9.]/g, ""))
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return numA - numB
        }
        return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
      })

      // Capitalize or format title cleanly
      const formattedTitle =
        group.title.length > 0
          ? group.title
          : key.charAt(0).toUpperCase() + key.slice(1)

      result.push({
        id: key,
        title: formattedTitle,
        values,
      })
    }
  }

  return result
}

/**
 * Filters a list of products by selected option value IDs using multi-facet logic:
 * - AND across different option groups (e.g., must match RAM selection AND Storage selection)
 * - OR within the same option group (e.g., matching 16GB OR 32GB RAM)
 */
export const filterProductsByOptionValues = (
  products: HttpTypes.StoreProduct[],
  selectedOptionValueIds: string[],
  scopedOptions: ScopedProductOption[]
): HttpTypes.StoreProduct[] => {
  if (
    !selectedOptionValueIds ||
    selectedOptionValueIds.length === 0 ||
    !products ||
    products.length === 0
  ) {
    return products
  }

  const selectedSet = new Set(selectedOptionValueIds)

  // Map each selected value ID to its option group ID (title key)
  const activeGroups = new Map<string, Set<string>>()

  for (const option of scopedOptions) {
    for (const val of option.values) {
      const hasSelection = val.valueIds.some((id) => selectedSet.has(id))
      if (hasSelection) {
        if (!activeGroups.has(option.id)) {
          activeGroups.set(option.id, new Set())
        }
        val.valueIds.forEach((id) => activeGroups.get(option.id)!.add(id))
      }
    }
  }

  if (activeGroups.size === 0) {
    // If none of the selected IDs matched the scoped options, fallback to direct ID matching
    return products.filter((p) =>
      p.options?.some((opt) =>
        opt.values?.some((val) => selectedSet.has(val.id))
      )
    )
  }

  // Filter products: product must satisfy every active option group
  return products.filter((product) => {
    if (!product.options || product.options.length === 0) {
      return false
    }

    for (const [groupId, allowedValueIds] of activeGroups.entries()) {
      const productOption = product.options.find(
        (opt) => (opt.title || "").trim().toLowerCase() === groupId
      )

      if (!productOption || !productOption.values) {
        return false
      }

      const hasMatchingValue = productOption.values.some((val) =>
        allowedValueIds.has(val.id)
      )

      if (!hasMatchingValue) {
        return false
      }
    }

    return true
  })
}
