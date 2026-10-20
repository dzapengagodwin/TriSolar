"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const searchParams = useSearchParams()
  const selectedVariantId = searchParams.get("v_id")
  const selectedVariant = product.variants?.find(
    (variant) => variant.id === selectedVariantId
  ) || product.variants?.[0]
  const displayTitle = selectedVariant?.title || product.title

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {displayTitle}
        </Heading>

        {(product.subtitle || product.description) && (
          <Text
            className="text-medium text-ui-fg-subtle whitespace-pre-line"
            data-testid="product-description"
          >
            {product.subtitle ||
              (product.description
                ? product.description.length > 160
                  ? `${product.description.slice(0, 160).trim()}...`
                  : product.description
                : null)}
          </Text>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
