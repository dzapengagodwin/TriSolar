"use client"

import { useState, useMemo, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import QuickAddToCart from "@modules/products/components/quick-add-to-cart"

// -- Helpers ------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/** Returns true when Medusa 2.x pricing signals a genuine sale / price-list discount. */
function isVariantOnSale(variant: HttpTypes.StoreProductVariant): boolean {
  const calc = variant?.calculated_price as Record<string, unknown> | undefined
  if (!calc) return false

  const calculatedAmount = (calc.calculated_amount ?? calc.amount ?? 0) as number
  const originalAmount = (calc.original_amount ?? calculatedAmount) as number

  // Primary signal: original price is higher than the calculated (discounted) price
  if (typeof originalAmount === "number" && typeof calculatedAmount === "number" && originalAmount > calculatedAmount) {
    return true
  }

  // Secondary signal: Medusa explicitly flags the price list type
  if (calc.price_list_type === "sale") return true

  return false
}

/** Returns the best (highest) discount percentage across a product's variants. */
function getProductDiscountPct(product: HttpTypes.StoreProduct): number {
  let best = 0
  for (const variant of (product.variants ?? []) as HttpTypes.StoreProductVariant[]) {
    const calc = variant?.calculated_price as Record<string, unknown> | undefined
    if (!calc) continue
    const orig = (calc.original_amount ?? 0) as number
    const curr = (calc.calculated_amount ?? calc.amount ?? orig) as number
    if (orig > curr && orig > 0) {
      best = Math.max(best, Math.round(((orig - curr) / orig) * 100))
    }
  }
  return best
}

/** Deterministic month-seeded shuffle so the "featured" order rotates each month. */
function monthShuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  const seed = new Date().getMonth() + new Date().getFullYear() * 12
  for (let i = copy.length - 1; i > 0; i--) {
    const j = ((seed * (i + 1) * 2654435761) >>> 0) % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Calculates remaining time until end of current month. */
function getTimeUntilEndOfMonth(): { days: number; hours: number; mins: number; secs: number; total: number } {
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
  const diff = Math.max(0, endOfMonth.getTime() - now.getTime())
  const totalSecs = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    mins: Math.floor((totalSecs % 3600) / 60),
    secs: totalSecs % 60,
    total: totalSecs,
  }
}

// -- Sub-components -----------------------------------------------------------

function CountdownTimer() {
  const [time, setTime] = useState(getTimeUntilEndOfMonth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTime(getTimeUntilEndOfMonth()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) {
    // SSR / hydration placeholder - avoids mismatch
    return (
      <div className="flex items-center gap-1.5" aria-label="Countdown timer loading">
        {["--", "--", "--", "--"].map((v, i) => (
          <span key={i} className="bg-primary text-white w-10 text-center py-1.5 rounded-lg font-mono text-sm font-bold shadow-lg shadow-orange-900/30">{v}</span>
        ))}
      </div>
    )
  }

  const segments = [
    { value: time.days, label: "D" },
    { value: time.hours, label: "H" },
    { value: time.mins, label: "M" },
    { value: time.secs, label: "S" },
  ]

  return (
    <div className="flex items-center gap-1.5" aria-label={`Ends in ${time.days} days ${time.hours} hours ${time.mins} minutes ${time.secs} seconds`}>
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="bg-primary text-white w-10 text-center py-1.5 rounded-lg font-mono text-sm font-bold shadow-lg shadow-orange-900/30 tabular-nums transition-all duration-300">
              {String(seg.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-gray-500 mt-0.5 font-medium">{seg.label}</span>
          </div>
          {i < segments.length - 1 && (
            <span className="text-gray-500 font-bold text-sm mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

function DealProductCard({
  product,
  region: _region,
  discountPct,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  discountPct: number
}) {
  const priceInfo = useMemo(() => {
    if (!product.variants?.length) return null
    const saleVariant = (product.variants as HttpTypes.StoreProductVariant[])
      .filter((v) => !!v.calculated_price)
      .sort((a, b) => {
        const aCalc = a.calculated_price as Record<string, unknown> | undefined
        const bCalc = b.calculated_price as Record<string, unknown> | undefined
        const aAmt = (aCalc?.calculated_amount ?? aCalc?.amount ?? 0) as number
        const bAmt = (bCalc?.calculated_amount ?? bCalc?.amount ?? 0) as number
        return aAmt - bAmt
      })[0]
    return saleVariant ? getPricesForVariant(saleVariant) : null
  }, [product.variants])

  const categoryLabel = product.categories?.length
    ? product.categories.map((c: HttpTypes.StoreProductCategory) => c.name).join(", ")
    : null

  return (
    <div className="group bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 flex flex-col justify-between h-full relative hover:shadow-md transition-all duration-200">
      {/* Discount badge */}
      {discountPct > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          -{discountPct}%
        </span>
      )}

      {/* Product image */}
      <LocalizedClientLink href={`/product/${product.handle}`} className="block mb-3">
        <div className="relative overflow-hidden bg-gray-50/50 flex items-center justify-center h-36 sm:h-44 rounded-xl">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            className="w-full h-full !bg-transparent !shadow-none !border-none !p-0 !aspect-auto"
            objectFit="cover"
          />
        </div>
      </LocalizedClientLink>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          {categoryLabel && (
            <div className="text-[11px] font-medium text-gray-400 line-clamp-1">{categoryLabel}</div>
          )}
          <LocalizedClientLink href={`/product/${product.handle}`}>
            <h3 className="text-[13px] sm:text-sm font-normal text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug mt-0.5">
              {product.title}
            </h3>
          </LocalizedClientLink>
        </div>

        {/* Price + CTA */}
        <div className="pt-2 border-t border-gray-50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {priceInfo && (
              <div className="flex items-baseline gap-x-1.5">
                <span className="text-[15px] sm:text-base font-bold text-gray-900">{priceInfo.calculated_price}</span>
                {priceInfo.original_price_number > priceInfo.calculated_price_number && (
                  <span className="text-xs line-through text-gray-400">{priceInfo.original_price}</span>
                )}
              </div>
            )}
          </div>
          <QuickAddToCart
            product={product}
            size="sm"
            viewMode="deals"
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

// -- Main component -----------------------------------------------------------

export default function MonthlyDeals({
  products = [],
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const currentMonth = MONTH_NAMES[new Date().getMonth()]

  // 1. Filter to genuinely discounted products only
  const promoProducts = useMemo(() => {
    const onSale = products.filter((p) =>
      p.variants?.some((v: HttpTypes.StoreProductVariant) => isVariantOnSale(v))
    )
    return monthShuffle(onSale)
  }, [products])

  // 2. Build category tabs from the categories that discounted products belong to
  const categoryTabs = useMemo(() => {
    const catMap = new Map<string, { id: string; name: string; count: number }>()
    for (const product of promoProducts) {
      for (const cat of (product.categories ?? []) as HttpTypes.StoreProductCategory[]) {
        if (!cat?.id || !cat?.name) continue
        const existing = catMap.get(cat.id)
        if (existing) existing.count++
        else catMap.set(cat.id, { id: cat.id, name: cat.name, count: 1 })
      }
    }
    return Array.from(catMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [promoProducts])

  const tabs = useMemo(() => {
    const list: { id: string; label: string }[] = [
      { id: "all", label: "All Deals" },
    ]
    for (const cat of categoryTabs) {
      list.push({ id: `cat-${cat.id}`, label: cat.name })
    }
    return list
  }, [categoryTabs])

  const [activeTabId, setActiveTabId] = useState("all")

  // 3. Filter by selected tab
  const filteredProducts = useMemo(() => {
    if (activeTabId === "all") return promoProducts

    const catId = activeTabId.replace("cat-", "")
    const filtered = promoProducts.filter((p) =>
      (p.categories as HttpTypes.StoreProductCategory[])?.some(
        (c: HttpTypes.StoreProductCategory) => c.id === catId
      )
    )
    return filtered
  }, [activeTabId, promoProducts])

  // Don't render if there are no genuine deals
  if (promoProducts.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-b from-gray-950 to-black text-white py-12 sm:py-16 my-8 w-full border-y border-gray-800">
      <div className="content-container space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentMonth} Best Deals
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Exclusive discounts on top-rated tech. These prices won&apos;t last.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              Offers end in
            </span>
            <CountdownTimer />
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTabId === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-orange-900/30 scale-105"
                        : "bg-gray-900/80 hover:bg-gray-800 text-gray-400 border border-gray-800 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            {/* Gradient fade edges for scroll */}
            <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none sm:hidden" />
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {filteredProducts.slice(0, 10).map((product) => (
              <DealProductCard
                key={product.id}
                product={product}
                region={region}
                discountPct={getProductDiscountPct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No deals in this category right now.</p>
          </div>
        )}

        {/* View all link */}
        {filteredProducts.length > 10 && (
          <div className="text-center pt-2">
            <LocalizedClientLink
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              View all deals
              <span className="text-lg">&#8594;</span>
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </section>
  )
}
