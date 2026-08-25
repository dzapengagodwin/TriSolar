"use client"

import React, { useState, useTransition, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { addToCart } from "@lib/data/cart"
import { getProductRecommendations } from "@lib/data/recommendations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"

type ProductDetailsTabsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  initialAccessories?: HttpTypes.StoreProduct[]
}

type TabType = "accessories" | "description" | "specification" | "reviews"

type ReviewItem = {
  id: string
  author: string
  rating: number
  date: string
  title: string
  comment: string
  verified: boolean
  helpfulCount: number
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Tinashe M.",
    rating: 5,
    date: "2 weeks ago",
    title: "Exceptional build quality & performance",
    comment:
      "Arrived quickly and in pristine condition. Exactly as described, lightning fast and battery life exceeds expectations. Highly recommend this store!",
    verified: true,
    helpfulCount: 14,
  },
  {
    id: "rev-2",
    author: "David K.",
    rating: 5,
    date: "1 month ago",
    title: "Great value for money",
    comment:
      "Setup was straightforward and seamless. Excellent customer service support when I inquired about warranty. 5 stars!",
    verified: true,
    helpfulCount: 8,
  },
  {
    id: "rev-3",
    author: "Blessing C.",
    rating: 4,
    date: "2 months ago",
    title: "Solid purchase, very satisfied",
    comment:
      "Good performance and clean aesthetic. Works smoothly for all daily tasks and heavy workload.",
    verified: true,
    helpfulCount: 5,
  },
]

export default function ProductDetailsTabs({
  product,
  region,
  countryCode,
  initialAccessories = [],
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("accessories")
  const [accessories, setAccessories] = useState<HttpTypes.StoreProduct[]>(
    initialAccessories
  )
  const [isLoadingAccessories, setIsLoadingAccessories] = useState(false)
  const [addingAccessoryId, setAddingAccessoryId] = useState<string | null>(null)
  const [addedAccessoryId, setAddedAccessoryId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newAuthor, setNewAuthor] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newComment, setNewComment] = useState("")
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Fetch accessories dynamically if not provided initially
  useEffect(() => {
    let isMounted = true
    if (initialAccessories.length > 0) return

    const loadAccessories = async () => {
      if (!product?.id) return
      setIsLoadingAccessories(true)
      try {
        const recs = await getProductRecommendations({
          productId: product.id,
          type: "accessory",
          limit: 6,
        })
        if (isMounted) {
          setAccessories(recs || [])
        }
      } catch {
        if (isMounted) setAccessories([])
      } finally {
        if (isMounted) setIsLoadingAccessories(false)
      }
    }

    loadAccessories()
    return () => {
      isMounted = false
    }
  }, [product?.id, initialAccessories.length])

  // Handle Add to Cart for an accessory
  const handleAddAccessory = (accessory: HttpTypes.StoreProduct) => {
    const variantId = accessory.variants?.[0]?.id
    if (!variantId) return

    setAddingAccessoryId(accessory.id)
    startTransition(async () => {
      try {
        await addToCart({
          variantId,
          quantity: 1,
          countryCode,
        })
        setAddedAccessoryId(accessory.id)
        setTimeout(() => setAddedAccessoryId(null), 2500)
      } finally {
        setAddingAccessoryId(null)
      }
    })
  }

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.trim() || !newTitle.trim() || !newComment.trim()) return

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: "Just now",
      title: newTitle.trim(),
      comment: newComment.trim(),
      verified: true,
      helpfulCount: 0,
    }

    setReviews([newRev, ...reviews])
    setIsWritingReview(false)
    setNewAuthor("")
    setNewTitle("")
    setNewComment("")
    setReviewSubmitted(true)
    setTimeout(() => setReviewSubmitted(false), 4000)
  }

  // Extract specs & attributes
  const rawAttributes = (product.metadata?.woo_attributes as Record<
    string,
    string[] | string
  >) || {}
  const brandName =
    (product.metadata?.brand_name as string) ||
    (product as unknown as Record<string, { name?: string }>).brand?.name ||
    ""
  const sku =
    product.variants?.[0]?.sku ||
    (product.metadata?.woo_sku as string) ||
    ""
  const categoriesList =
    product.categories?.map((c) => c.name).filter(Boolean).join(", ") || ""

  const tabsConfig = [
    { id: "accessories" as TabType, label: "Accessories" },
    { id: "description" as TabType, label: "Description" },
    { id: "specification" as TabType, label: "Specification" },
    { id: "reviews" as TabType, label: `Reviews (${reviews.length})` },
  ]

  return (
    <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 w-full">
      {/* 1. Tabs Navigation Bar matching uploaded image design */}
      <div className="border-b border-gray-200">
        <div
          className="flex items-center gap-8 sm:gap-12 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Product Details Tabs"
        >
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 -mb-[1px] text-sm sm:text-base transition-colors relative font-semibold whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-gray-900 font-bold"
                    : "text-gray-500 hover:text-gray-800 font-medium"
                }`}
              >
                <span>{tab.label}</span>
                {/* Yellow active indicator bar under active tab */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Tab Content Panels */}
      <div className="pt-6 sm:pt-8 min-h-[220px]">
        {/* TAB 1: ACCESSORIES */}
        {activeTab === "accessories" && (
          <div className="space-y-6">
            {isLoadingAccessories ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500 text-sm font-medium">
                <Spinner className="w-5 h-5 animate-spin text-primary" />
                <span>Loading recommended accessories...</span>
              </div>
            ) : accessories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {accessories.map((accessory) => {
                  const variant = accessory.variants?.[0]
                  const price = getPricesForVariant(variant)
                  const variantCalc = variant?.calculated_price as Record<string, unknown> | undefined
                  const formattedPrice =
                    price?.calculated_price ||
                    (variantCalc
                      ? convertToLocale({
                          amount:
                            (variantCalc.calculated_amount as number) ??
                            (variantCalc.amount as number) ??
                            0,
                          currency_code: region.currency_code,
                        })
                      : "$0.00")

                  const isAdding = addingAccessoryId === accessory.id
                  const isAdded = addedAccessoryId === accessory.id

                  return (
                    <div
                      key={accessory.id}
                      className="group bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:border-gray-300 hover:shadow-xs transition-all relative"
                    >
                      {/* Accessory Image */}
                      <LocalizedClientLink
                        href={`/products/${accessory.handle}`}
                        className="block aspect-square w-full bg-gray-50/50 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2.5"
                      >
                        {accessory.thumbnail ? (
                          <img
                            src={accessory.thumbnail}
                            alt={accessory.title || "Accessory"}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="text-gray-300 text-xs font-bold">
                            Image
                          </div>
                        )}
                      </LocalizedClientLink>

                      {/* Title & Price */}
                      <div className="space-y-1 mb-3">
                        <LocalizedClientLink
                          href={`/products/${accessory.handle}`}
                          className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                        >
                          {accessory.title}
                        </LocalizedClientLink>
                        <p className="text-xs sm:text-sm font-bold text-amber-600">
                          {formattedPrice}
                        </p>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => handleAddAccessory(accessory)}
                        disabled={isAdding || !accessory.variants?.length}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          isAdded
                            ? "bg-green-600 text-white"
                            : "bg-gray-900 hover:bg-black text-white disabled:opacity-50"
                        }`}
                      >
                        {isAdding ? (
                          <Spinner className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : isAdded ? (
                          <span>Added to cart</span>
                        ) : (
                          <span>+ Add to cart</span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-8 sm:p-12 text-center space-y-3 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  Accessories for this device
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Browse our complete hardware catalog for compatible chargers, cables, protective cases, and adapters.
                </p>
                <div className="pt-2">
                  <LocalizedClientLink
                    href="/store"
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Browse All Accessories</span>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DESCRIPTION */}
        {activeTab === "description" && (
          <div className="max-w-4xl space-y-4">
            {product.description ? (
              <div
                className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed font-normal whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm text-gray-500 italic">
                No extended description available for this item.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: SPECIFICATION */}
        {activeTab === "specification" && (
          <div className="max-w-4xl space-y-6">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  {brandName && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Brand
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {brandName}
                      </td>
                    </tr>
                  )}
                  {sku && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Model / SKU
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">{sku}</td>
                    </tr>
                  )}
                  {categoriesList && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Category
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {categoriesList}
                      </td>
                    </tr>
                  )}
                  {product.type?.value && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Product Type
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {product.type.value}
                      </td>
                    </tr>
                  )}
                  {product.weight && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Weight
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {product.weight} g
                      </td>
                    </tr>
                  )}
                  {product.length && product.width && product.height && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Dimensions
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {product.length}L x {product.width}W x {product.height}H cm
                      </td>
                    </tr>
                  )}
                  {product.material && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Material
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {product.material}
                      </td>
                    </tr>
                  )}
                  {product.origin_country && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                        Country of Origin
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700 uppercase">
                        {product.origin_country}
                      </td>
                    </tr>
                  )}

                  {/* Render Custom WooCommerce Attributes dynamically */}
                  {Object.entries(rawAttributes).map(([attrName, val]) => {
                    const displayVal = Array.isArray(val)
                      ? val.join(", ")
                      : String(val)
                    if (!displayVal) return null

                    return (
                      <tr
                        key={attrName}
                        className="border-b border-gray-100 even:bg-gray-50/50"
                      >
                        <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                          {attrName}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-gray-700">
                          {displayVal}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Options */}
                  {product.options &&
                    product.options.map((opt) => (
                      <tr
                        key={opt.id}
                        className="border-b border-gray-100 last:border-b-0 even:bg-gray-50/50"
                      >
                        <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">
                          {opt.title}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-gray-700">
                          {opt.values?.map((v) => v.value).join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="max-w-4xl space-y-8">
            {reviewSubmitted && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Thank you! Your review has been published.</span>
              </div>
            )}

            {/* Ratings Summary Header */}
            <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center sm:text-left">
                <div className="text-4xl sm:text-5xl font-black text-gray-900">
                  4.9
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start text-amber-400 gap-1 text-base sm:text-lg">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Based on {reviews.length} customer reviews
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWritingReview(!isWritingReview)}
                className="bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isWritingReview ? "Cancel Review" : "Write a Review"}
              </button>
            </div>

            {/* Write Review Form */}
            {isWritingReview && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
              >
                <h4 className="text-base font-bold text-gray-900">
                  Write a Customer Review
                </h4>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`text-2xl cursor-pointer transition-colors ${
                          star <= newRating ? "text-amber-400" : "text-gray-200"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-gray-600 ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Excellent build and fast shipping!"
                      className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you liked about this product..."
                    className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border border-gray-100 bg-white rounded-xl p-5 sm:p-6 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {rev.author}
                      </span>
                      {rev.verified && (
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ Verified Purchaser
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                    {rev.title}
                  </h5>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
