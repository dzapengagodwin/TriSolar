import { HttpTypes } from "@medusajs/types"
import Link from "next/link"
import ProductPreview from "@modules/products/components/product-preview"
import NotFoundIllustration from "../components/not-found-illustration"
import { getCategoryPublicPath } from "@lib/seo/canonical"

type NotFoundTemplateProps = {
  recommendedProducts?: HttpTypes.StoreProduct[]
  region?: HttpTypes.StoreRegion | null
  countryCode?: string
}

const POPULAR_CATEGORIES = [
  { name: "Laptops", handle: "laptops" },
  { name: "Gaming Laptops", handle: "gaming-laptops" },
  { name: "Monitors", handle: "monitors" },
  { name: "Keyboards & Mice", handle: "keyboard_-mouse" },
  { name: "Accessories", handle: "computer-accessories" },
]

export default function NotFoundTemplate({
  recommendedProducts = [],
  region,
}: NotFoundTemplateProps) {
  return (
    <div className="bg-white min-h-[calc(100vh-140px)] py-12 sm:py-16 md:py-20">
      <div className="content-container max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Minimal Illustration */}
        <div className="mb-6 flex justify-center">
          <NotFoundIllustration className="w-full max-w-[240px] sm:max-w-[280px] h-auto" />
        </div>

        {/* Minimal Error Tag */}
        <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">
          404 Error
        </p>

        {/* Headline & Explanation */}
        <div className="max-w-md mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or no longer exists.
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm flex items-center justify-center transition-colors"
          >
            Back to homepage
          </Link>

          <Link
            href="/shop"
            className="h-10 px-5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-medium text-sm flex items-center justify-center transition-colors"
          >
            Explore store
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-lg">
          <p className="text-xs font-medium text-gray-400 mb-3">
            Popular Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.handle}
                href={getCategoryPublicPath(cat.handle)}
                className="px-3 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-100 text-xs transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended Products Grid */}
        {recommendedProducts.length > 0 && region && (
          <div className="mt-16 w-full text-left">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Recommended products
              </h2>
              <Link
                href="/shop"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <li key={product.id}>
                  <ProductPreview product={product} region={region} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
