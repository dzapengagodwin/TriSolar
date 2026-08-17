import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

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
      ? [{ id: "thumb", url: product.thumbnail }]
      : []

  return (
    <>
      <div
        className="content-container py-8 relative"
        data-testid="product-container"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side (7 columns): Product Image Gallery with Vertical Thumbnails & Modal */}
          <div className="lg:col-span-7 w-full">
            <ImageGallery images={galleryImages} />
          </div>

          {/* Right Side (5 columns): Product Info, Options & Buy Actions */}
          <div className="lg:col-span-5 flex flex-col gap-y-6 lg:sticky lg:top-28">
            <ProductInfo product={product} />

            <ProductOnboardingCta />

            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>

            <ProductTabs product={product} />
          </div>

        </div>

        {product.description && (
          <div className="mt-0 sm:mt-16 pt-6 sm:pt-10 border-t border-gray-100 max-w-4xl w-full">
            <h3 className="text-[10px] sm:text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-primary rounded-full animate-pulse" />
              Description
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed font-normal whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
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
