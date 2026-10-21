"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { getDistinctVariantOptions } from "@lib/util/product-variants"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  CACHE_TAGS,
  productTag,
  productHandleTag,
  categoryTag,
  collectionTag,
} from "@lib/cache-tags"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  region: passedRegion,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
  region?: HttpTypes.StoreRegion
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!passedRegion && !countryCode && !regionId) {
    throw new Error("Country code, region ID, or region object is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null = passedRegion

  if (!region) {
    if (countryCode) {
      region = await getRegion(countryCode)
    } else {
      region = await retrieveRegion(regionId!)
    }
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const extraTags: string[] = []
  if (queryParams?.category_id) {
    const catIds = Array.isArray(queryParams.category_id)
      ? queryParams.category_id
      : [queryParams.category_id]
    catIds.forEach((id) => extraTags.push(categoryTag(id)))
  }
  if (queryParams?.collection_id) {
    const colIds = Array.isArray(queryParams.collection_id)
      ? queryParams.collection_id
      : [queryParams.collection_id]
    colIds.forEach((id) => extraTags.push(collectionTag(id)))
  }
  if (queryParams?.handle) {
    extraTags.push(productHandleTag(queryParams.handle))
  }
  if (queryParams?.id) {
    const ids = Array.isArray(queryParams.id) ? queryParams.id : [queryParams.id]
    ids.forEach((id) => extraTags.push(productTag(id)))
  }

  const tags = Array.from(
    new Set([
      CACHE_TAGS.products,
      ...extraTags,
    ])
  )

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+variants.thumbnail,*variants.images,*variants.options,+metadata,+tags,*categories,*options,*options.values,",
          ...queryParams,
        },
        headers,
        next: {
          tags,
          revalidate: 300,
        },
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch products for the given category/collection/query and sort and filter them based on
 * dynamic scoped product options.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
  minPrice,
  maxPrice,
  showVariantsAsProducts = false,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
  showVariantsAsProducts?: boolean
}): Promise<{
  response: {
    products: HttpTypes.StoreProduct[]
    count: number
    variantOptionsByProductId: Record<string, HttpTypes.StoreProductOption[]>
  }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  // Fetch candidate products without passing option_value_id directly to backend,
  // so we have the full product set for accurate multi-facet filtering and scoped options extraction.
  const {
    response: { products: allProducts },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  // Apply scoped faceted filtering if option filters are active
  let filteredProducts = allProducts
  if (optionFilters.length > 0) {
    const { extractScopedProductOptions, filterProductsByOptionValues } = await import(
      "@lib/util/product-option-filters"
    )
    const scopedOptions = extractScopedProductOptions(allProducts)
    filteredProducts = filterProductsByOptionValues(
      allProducts,
      optionFilters,
      scopedOptions
    )
  }

  // Expand variants before price filtering so each displayed variant uses its own price.
  const variantOptionsByProductId: Record<
    string,
    HttpTypes.StoreProductOption[]
  > = {}

  if (showVariantsAsProducts) {
    filteredProducts = filteredProducts.flatMap((product) => {
      if (!product.variants?.length) {
        return [product]
      }

      if (product.id && product.variants.length > 1) {
        variantOptionsByProductId[product.id] =
          getDistinctVariantOptions(product)
      }

      const matchingOptionGroups = (product.options || [])
        .map((option) => ({
          optionId: option.id,
          values: (option.values || [])
            .filter((value) => optionFilters.includes(value.id))
            .map((value) => value.value?.trim().toLowerCase())
            .filter((value): value is string => Boolean(value)),
        }))
        .filter((group) => group.values.length > 0)

      const matchingVariants = product.variants.filter((variant) => {
        const matchesOptions = matchingOptionGroups.every((group) => {
          const variantOption = variant.options?.find(
            (option) => option.option_id === group.optionId
          )
          return group.values.includes(variantOption?.value?.trim().toLowerCase() || "")
        })

        if (!matchesOptions) {
          return false
        }

        if (minPrice === undefined && maxPrice === undefined) {
          return true
        }

        const price = getPricesForVariant(variant)
        if (!price) {
          return false
        }

        return (
          (minPrice === undefined || price.calculated_price_number >= minPrice) &&
          (maxPrice === undefined || price.calculated_price_number <= maxPrice)
        )
      })

      if (product.variants.length === 1) {
        return matchingVariants.length > 0 ? [product] : []
      }

      return matchingVariants.map((variant) => ({
        ...product,
        variants: [variant],
      }))
    })
  }

  // Apply product-level price filtering for standard product listings.
  if (
    !showVariantsAsProducts &&
    (minPrice !== undefined || maxPrice !== undefined)
  ) {
    filteredProducts = filteredProducts.filter((product) => {
      if (!product.variants || product.variants.length === 0) return true
      return product.variants.some((v) => {
        const price = getPricesForVariant(v)
        if (!price) return false
        const amount = price.calculated_price_number
        if (minPrice !== undefined && amount < minPrice) return false
        if (maxPrice !== undefined && amount > maxPrice) return false
        return true
      })
    })
  }

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = filteredProducts.length

  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
      variantOptionsByProductId,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Fetch recommendation products for a specific product and type from the custom backend module
 */
export async function getProductRecommendations({
  productId,
  type = "accessory",
  limit = 4,
}: {
  productId: string
  type?: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> {
  if (!productId) return []

  const headers = {
    ...(await getAuthHeaders()),
  }

  const tags = [CACHE_TAGS.products, productTag(productId)]

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products/${productId}/recommendations`,
      {
        method: "GET",
        query: {
          type,
          limit,
        },
        headers,
        next: {
          tags,
          revalidate: 300,
        },
      }
    )
    .then(({ products }) => products || [])
    .catch(() => [])
}

/**
 * Retrieve accessory recommendations for products currently in the cart
 */
export async function getCartAccessoryRecommendations(
  productIds: string[]
): Promise<HttpTypes.StoreProduct[]> {
  const seenIds = new Set<string>(productIds || [])
  const accessories: HttpTypes.StoreProduct[] = []

  if (!productIds || productIds.length === 0) {
    return []
  }

  for (const productId of productIds) {
    if (!productId) continue
    try {
      const recs = await getProductRecommendations({
        productId,
        type: "accessory",
        limit: 3,
      })

      for (const item of recs) {
        if (item && !seenIds.has(item.id)) {
          seenIds.add(item.id)
          accessories.push(item)
          if (accessories.length >= 3) {
            return accessories
          }
        }
      }
    } catch {
      // continue
    }
  }

  return accessories
}
