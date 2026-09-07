"use client"

import React, { useState, useTransition, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { addToCart } from "@lib/data/cart"
import { getProductRecommendations } from "@lib/data/recommendations"
import {
  listProductReviews,
  checkCanReview,
  submitReview,
  deleteReview,
  StoreReview,
  ReviewEligibility,
} from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"

type ProductDetailsTabsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  initialAccessories?: HttpTypes.StoreProduct[]
}

type TabType = "accessories" | "description" | "specification" | "reviews"

function StarIcon({ filled, className = "w-4 h-4" }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={`${className} ${filled ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(rating)} className="w-4 h-4" />
      ))}
    </span>
  )
}

function RatingSummary({
  reviews,
  averageRating,
}: {
  reviews: StoreReview[]
  averageRating: number
}) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }))
  const total = reviews.length

  return (
    <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10">
      {/* Average score */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-5xl font-black text-gray-900">
          {averageRating > 0 ? averageRating.toFixed(1) : "\u2014"}
        </div>
        <div className="space-y-1">
          <StarRow rating={averageRating} />
          <p className="text-xs text-gray-500 font-medium">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      {total > 0 && (
        <div className="flex-1 space-y-1.5">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 text-right font-semibold">{star}</span>
              <StarIcon filled={true} className="w-3 h-3 shrink-0" />
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [reviews, setReviews] = useState<StoreReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false)
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  // Form state
  const [newRating, setNewRating] = useState(5)
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  // Load accessories
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
        if (isMounted) setAccessories(recs || [])
      } catch {
        if (isMounted) setAccessories([])
      } finally {
        if (isMounted) setIsLoadingAccessories(false)
      }
    }

    loadAccessories()
    return () => { isMounted = false }
  }, [product?.id, initialAccessories.length])

  // Load reviews when tab is activated
  useEffect(() => {
    if (activeTab !== "reviews" || !product?.id) return

    let isMounted = true
    const load = async () => {
      setIsLoadingReviews(true)
      setIsLoadingEligibility(true)
      try {
        const [reviewsData, eligibilityData] = await Promise.all([
          listProductReviews(product.id),
          checkCanReview(product.id),
        ])
        if (isMounted) {
          setReviews(reviewsData.reviews)
          setAverageRating(reviewsData.average_rating)
          setReviewCount(reviewsData.count)
          setEligibility(eligibilityData)
        }
      } catch {
        // silently fail â€” empty state is fine
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false)
          setIsLoadingEligibility(false)
        }
      }
    }

    load()
    return () => { isMounted = false }
  }, [activeTab, product?.id])

  // Handle Add to Cart for an accessory
  const handleAddAccessory = (accessory: HttpTypes.StoreProduct) => {
    const variantId = accessory.variants?.[0]?.id
    if (!variantId) return

    setAddingAccessoryId(accessory.id)
    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
        setAddedAccessoryId(accessory.id)
        setTimeout(() => setAddedAccessoryId(null), 2500)
      } finally {
        setAddingAccessoryId(null)
      }
    })
  }

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmittingReview(true)

    try {
      const { review } = await submitReview(product.id, {
        rating: newRating,
        title: newTitle.trim() || undefined,
        content: newContent.trim(),
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
      })

      setReviews((prev) => [review, ...prev])
      setReviewCount((c) => c + 1)
      setEligibility({ canReview: false, reason: "already_reviewed", existingReview: review })
      setIsWritingReview(false)
      setNewFirstName("")
      setNewLastName("")
      setNewTitle("")
      setNewContent("")
      setNewRating(5)
      setReviewSubmitted(true)
      setTimeout(() => setReviewSubmitted(false), 5000)
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        "Failed to submit review. Please try again."
      setSubmitError(msg)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId)
    try {
      await deleteReview(product.id, reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setReviewCount((c) => Math.max(0, c - 1))
      setEligibility({ canReview: true })
    } catch {
      // ignore
    } finally {
      setDeletingReviewId(null)
    }
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
    { id: "reviews" as TabType, label: `Reviews (${reviewCount})` },
  ]

  return (
    <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 w-full">
      {/* 1. Tabs Navigation Bar */}
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
                      <LocalizedClientLink
                        href={`/products/${accessory.handle}`}
                        className="block aspect-square w-full bg-gray-50/50 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2.5"
                      >
                        {accessory.thumbnail ? (
                          <img
                            src={accessory.thumbnail}
                            alt={accessory.title}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                      </LocalizedClientLink>

                      <div className="space-y-2">
                        <LocalizedClientLink href={`/products/${accessory.handle}`}>
                          <p className="text-[11px] sm:text-xs font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-primary transition-colors">
                            {accessory.title}
                          </p>
                        </LocalizedClientLink>
                        <p className="text-xs font-black text-gray-900">{formattedPrice}</p>

                        <button
                          type="button"
                          onClick={() => handleAddAccessory(accessory)}
                          disabled={isAdding || isAdded}
                          className={`w-full text-[10px] sm:text-xs font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                            isAdded
                              ? "bg-green-500 text-white"
                              : "bg-gray-900 hover:bg-black text-white"
                          } disabled:opacity-60`}
                        >
                          {isAdding ? (
                            <Spinner className="w-3.5 h-3.5 mx-auto animate-spin" />
                          ) : isAdded ? (
                            "Added!"
                          ) : (
                            "Add to Cart"
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm font-medium">
                No accessories found for this product.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DESCRIPTION */}
        {activeTab === "description" && (
          <div className="max-w-3xl space-y-6">
            {product.description ? (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm space-y-4">
                {product.description.split("\n").map((para, i) =>
                  para.trim() ? (
                    <p key={i}>{para.trim()}</p>
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-medium">
                No description available for this product.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: SPECIFICATION */}
        {activeTab === "specification" && (
          <div className="max-w-3xl">
            <div className="overflow-hidden border border-gray-200 rounded-2xl">
              <table className="w-full text-xs sm:text-sm">
                <tbody>
                  {brandName && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">Brand</td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">{brandName}</td>
                    </tr>
                  )}
                  {sku && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">SKU</td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700 font-mono">{sku}</td>
                    </tr>
                  )}
                  {categoriesList && (
                    <tr className="border-b border-gray-100 even:bg-gray-50/50">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3">Category</td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">{categoriesList}</td>
                    </tr>
                  )}
                  {Object.entries(rawAttributes).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-gray-100 last:border-b-0 even:bg-gray-50/50"
                    >
                      <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900 w-1/3 capitalize">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-gray-700">
                        {Array.isArray(value) ? value.join(", ") : value}
                      </td>
                    </tr>
                  ))}
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
            {/* Success banner */}
            {reviewSubmitted && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Thank you! Your review has been published.</span>
              </div>
            )}

            {/* Ratings summary + CTA */}
            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500 text-sm">
                <Spinner className="w-5 h-5 animate-spin text-primary" />
                <span>Loading reviews...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <RatingSummary reviews={reviews} averageRating={averageRating} />

                  {/* Write review CTA â€” only for eligible customers */}
                  <div className="shrink-0">
                    {isLoadingEligibility ? (
                      <Spinner className="w-5 h-5 animate-spin text-gray-400" />
                    ) : eligibility?.canReview ? (
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(!isWritingReview)}
                        className="bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        {isWritingReview ? "Cancel" : "Write a Review"}
                      </button>
                    ) : eligibility?.reason === "unauthenticated" ? (
                      <LocalizedClientLink
                        href="/account"
                        className="inline-block border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
                      >
                        Sign in to review
                      </LocalizedClientLink>
                    ) : eligibility?.reason === "not_purchased" ? (
                      <span className="text-xs text-gray-500 font-medium max-w-[180px] text-right leading-relaxed">
                        Purchase this product to leave a review
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Write review form */}
                {isWritingReview && eligibility?.canReview && (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
                  >
                    <h4 className="text-base font-bold text-gray-900">Write a Review</h4>

                    {submitError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg font-medium">
                        {submitError}
                      </p>
                    )}

                    {/* Star rating picker */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                            aria-label={`Rate ${star} stars`}
                          >
                            <StarIcon filled={star <= newRating} className="w-6 h-6" />
                          </button>
                        ))}
                        <span className="text-xs font-semibold text-gray-600 ml-2">
                          {newRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Review Headline
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Excellent build and fast shipping!"
                        className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Tell us what you liked about this product..."
                        className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsWritingReview(false); setSubmitError(null) }}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                      >
                        {isSubmittingReview && <Spinner className="w-3.5 h-3.5 animate-spin" />}
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Your own review (if already reviewed) */}
                {eligibility?.reason === "already_reviewed" && eligibility.existingReview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Your Review</p>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <StarRow rating={eligibility.existingReview.rating} />
                    </div>
                    {eligibility.existingReview.title && (
                      <p className="text-sm font-bold text-gray-900">{eligibility.existingReview.title}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{eligibility.existingReview.content}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(eligibility.existingReview!.id)}
                      disabled={deletingReviewId === eligibility.existingReview.id}
                      className="text-xs text-red-500 hover:text-red-700 font-medium underline cursor-pointer disabled:opacity-50"
                    >
                      {deletingReviewId === eligibility.existingReview.id ? "Deleting..." : "Delete my review"}
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((rev) => {
                      const displayName = `${rev.first_name} ${rev.last_name ? rev.last_name.charAt(0) + "." : ""}`.trim()
                      const date = new Date(rev.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      return (
                        <div
                          key={rev.id}
                          className="border border-gray-100 bg-white rounded-xl p-5 sm:p-6 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-gray-900">
                                {displayName}
                              </span>
                              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                Verified Purchaser
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">{date}</span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400 text-sm">
                            <StarRow rating={rev.rating} />
                          </div>

                          {rev.title && (
                            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                              {rev.title}
                            </h5>
                          )}

                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {rev.content}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  !isLoadingReviews && (
                    <div className="py-12 text-center text-gray-400 text-sm font-medium">
                      No reviews yet. Be the first to review this product!
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

