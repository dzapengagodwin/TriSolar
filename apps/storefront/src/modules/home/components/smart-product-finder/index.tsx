"use client"

import { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"

type Need = "laptops" | "networking" | "phones" | "accessories" | "storage" | "any"
type Budget = "any" | "under-100" | "100-300" | "300-600" | "over-600"
type Priority = "any" | "performance" | "battery" | "reliability" | "value"

const needs: { value: Need; label: string; keywords: string[] }[] = [
  { value: "laptops", label: "Laptops", keywords: ["laptop", "notebook", "workstation", "macbook", "thinkpad"] },
  { value: "networking", label: "Networking", keywords: ["network", "router", "switch", "wifi", "wi-fi", "access point", "firewall"] },
  { value: "phones", label: "Phones", keywords: ["phone", "smartphone", "mobile", "iphone", "android"] },
  { value: "accessories", label: "Accessories", keywords: ["mouse", "keyboard", "cable", "adapter", "headset", "dock", "charger"] },
  { value: "storage", label: "Storage", keywords: ["ssd", "hdd", "hard drive", "storage", "nas", "flash", "memory"] },
]

const priorities: { value: Priority; label: string; keywords: string[] }[] = [
  { value: "performance", label: "Performance", keywords: ["i7", "i9", "ryzen 7", "ryzen 9", "core ultra", "16gb", "32gb", "gaming", "10gb", "10gbe"] },
  { value: "battery", label: "Battery life", keywords: ["battery", "portable", "ultrabook", "efficient", "power bank"] },
  { value: "reliability", label: "Reliability", keywords: ["business", "enterprise", "thinkpad", "pro", "managed", "warranty"] },
  { value: "value", label: "Best value", keywords: ["refurbished", "value", "budget", "essential", "entry"] },
]

function searchableText(product: HttpTypes.StoreProduct) {
  return [
    product.title,
    product.subtitle,
    product.description,
    ...(product.categories || []).map((category) => category.name),
    ...(product.tags || []).map((tag) => tag.value),
    product.metadata?.brand,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function priceFor(product: HttpTypes.StoreProduct) {
  try {
    return getProductPrice({ product }).cheapestPrice?.calculated_price_number ?? null
  } catch {
    return null
  }
}

export default function SmartProductFinder({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) {
  const [need, setNeed] = useState<Need>("any")
  const [budget, setBudget] = useState<Budget>("any")
  const [priority, setPriority] = useState<Priority>("any")
  const [showResults, setShowResults] = useState(false)

  const matches = useMemo(() => {
    const selectedNeed = needs.find((item) => item.value === need)
    const selectedPriority = priorities.find((item) => item.value === priority)

    return products
      .map((product) => {
        const text = searchableText(product)
        const needMatch = !selectedNeed || selectedNeed.keywords.some((word) => text.includes(word))
        const price = priceFor(product)
        const budgetMatch =
          budget === "any" ||
          price === null ||
          (budget === "under-100" && price < 100) ||
          (budget === "100-300" && price >= 100 && price <= 300) ||
          (budget === "300-600" && price > 300 && price <= 600) ||
          (budget === "over-600" && price > 600)

        const priorityScore = selectedPriority
          ? selectedPriority.keywords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0)
          : 0

        return { product, text, needMatch, budgetMatch, priorityScore }
      })
      .filter((item) => item.needMatch && item.budgetMatch)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 4)
  }, [products, need, budget, priority])

  const selectedNeedLabel = needs.find((item) => item.value === need)?.label

  return (
    <section className="content-container py-7 sm:py-10" aria-labelledby="smart-finder-title">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">TRITECH product finder</span>
            <h2 id="smart-finder-title" className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
              Not sure what you need?
            </h2>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300 sm:text-sm">
              Choose a few options. We’ll narrow down products from our store for you.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-300">I need</span>
              <select value={need} onChange={(event) => { setNeed(event.target.value as Need); setShowResults(true) }} className="h-11 w-full rounded-lg border border-white/15 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-400">
                <option value="any">Anything</option>
                {needs.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-300">Budget (USD)</span>
              <select value={budget} onChange={(event) => { setBudget(event.target.value as Budget); setShowResults(true) }} className="h-11 w-full rounded-lg border border-white/15 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-400">
                <option value="any">Any budget</option>
                <option value="under-100">Under $100</option>
                <option value="100-300">$100–$300</option>
                <option value="300-600">$300–$600</option>
                <option value="over-600">$600+</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-300">Priority</span>
              <select value={priority} onChange={(event) => { setPriority(event.target.value as Priority); setShowResults(true) }} className="h-11 w-full rounded-lg border border-white/15 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-400">
                <option value="any">No preference</option>
                {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-xs text-slate-500">
            {showResults
              ? matches.length
                ? <>Showing {matches.length} suggestions{selectedNeedLabel ? ` for ${selectedNeedLabel.toLowerCase()}` : ""}.</>
                : "No exact matches in the products currently loaded. Try widening your choices."
              : "Three quick choices. No long product descriptions to read."}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowResults(true)} className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-5 text-xs font-bold text-white transition hover:bg-blue-800">
              Find my products <span className="ml-2" aria-hidden="true">→</span>
            </button>
            <button type="button" onClick={() => { setNeed("any"); setBudget("any"); setPriority("any"); setShowResults(false) }} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              Reset
            </button>
          </div>
        </div>

        {showResults && (
          <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
            {matches.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {matches.map(({ product }) => {
                  const price = priceFor(product)
                  return (
                    <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                      <span className="line-clamp-2 min-h-10 text-xs font-bold text-slate-900 group-hover:text-blue-700">{product.title}</span>
                      <span className="mt-2 block text-sm font-extrabold text-slate-950">
                        {price !== null ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.variants?.[0]?.calculated_price?.currency_code || "USD", maximumFractionDigits: 2 }).format(price) : "View price"}
                      </span>
                      <span className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-wider text-blue-700">View product →</span>
                    </LocalizedClientLink>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-600">We couldn’t find a close match in the current catalogue selection.</p>
                <LocalizedClientLink href="/shop" className="text-xs font-bold text-blue-700 hover:text-blue-900">Browse the full store →</LocalizedClientLink>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
