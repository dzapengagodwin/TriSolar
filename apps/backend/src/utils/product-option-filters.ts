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

  if (
    values.length === 1 &&
    (values[0].value?.toLowerCase() === "default value" ||
      values[0].value?.toLowerCase() === "default")
  ) {
    return false
  }

  return true
}

export const extractScopedProductOptions = (
  products: any[]
): ScopedProductOption[] => {
  if (!products || products.length === 0) {
    return []
  }

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
      values.sort((a, b) => {
        const numA = parseFloat(a.label.replace(/[^0-9.]/g, ""))
        const numB = parseFloat(b.label.replace(/[^0-9.]/g, ""))
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
          return numA - numB
        }
        return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
      })

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

export const filterProductsByOptionValues = (
  products: any[],
  selectedOptionValueIds: string[],
  scopedOptions: ScopedProductOption[]
): any[] => {
  if (
    !selectedOptionValueIds ||
    selectedOptionValueIds.length === 0 ||
    !products ||
    products.length === 0
  ) {
    return products
  }

  const selectedSet = new Set(selectedOptionValueIds)
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
    return products.filter((p) =>
      p.options?.some((opt: any) =>
        opt.values?.some((val: any) => selectedSet.has(val.id))
      )
    )
  }

  return products.filter((product) => {
    if (!product.options || product.options.length === 0) {
      return false
    }

    for (const [groupId, allowedValueIds] of activeGroups.entries()) {
      const productOption = product.options.find(
        (opt: any) => (opt.title || "").trim().toLowerCase() === groupId
      )

      if (!productOption || !productOption.values) {
        return false
      }

      const hasMatchingValue = productOption.values.some((val: any) =>
        allowedValueIds.has(val.id)
      )

      if (!hasMatchingValue) {
        return false
      }
    }

    return true
  })
}
