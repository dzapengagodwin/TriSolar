import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductDetailsTabs from "@modules/products/components/product-details-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductViewTracker from "@modules/products/components/product-view-tracker"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Ensure images array includes product thumbnail if images array is empty
  const galleryImages =
    images && images.length > 0
      ? images
      : product.thumbnail
      ? [
          {
            id: "thumb",
            url: product.thumbnail,
            rank: 0,
          } as HttpTypes.StoreProductImage,
        ]
      : []

  return (
    <>
      <ProductViewTracker product={product} region={region} />
      <div
        className="content-container py-8 relative"
        data-testid="product-container"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side (7 columns): Product Image Gallery with Vertical Thumbnails & Modal */}
          <div className="lg:col-span-7 w-full">
            <Suspense fallback={null}>
              <ImageGallery
                images={galleryImages}
                variants={product.variants}
                productTitle={product.title}
                brand={
                  (
                    (product as unknown as Record<string, unknown>).brand as
                      | { name?: string }
                      | undefined
                  )?.name || (product.metadata?.brand as string)
                }
              />
            </Suspense>
          </div>

          {/* Right Side (5 columns): Product Info, Options & Buy Actions */}
          <div className="lg:col-span-5 flex flex-col gap-y-6 lg:sticky lg:top-28">
            <Suspense fallback={null}>
              <ProductInfo product={product} />
            </Suspense>

            <ProductOnboardingCta />

            <Suspense
              fallback={<div className="h-32 animate-pulse bg-gray-50" />}
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            {/* In sidebar, keep Buy actions clean */}
          </div>
        </div>

        {/* Product Details Tabs (Accessories | Description | Specification | Reviews) */}
        <ProductDetailsTabs
          product={product}
          region={region}
          countryCode={countryCode}
        />
      </div>

      <div
        className="content-container my-16 small:my-24"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
