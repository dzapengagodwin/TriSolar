"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
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
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
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

  const next = {
    ...(await getCacheOptions("products")),
  }

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
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,*categories,*options,*options.values,",
          ...queryParams,
        },
        headers,
        next,
        cache: "no-store",
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
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  minPrice?: number
  maxPrice?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
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

  // Apply price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    const { getPricesForVariant } = await import("@lib/util/get-product-price")
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

  const next = {
    ...(await getCacheOptions("products")),
  }

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
        next,
        cache: "no-store",
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

