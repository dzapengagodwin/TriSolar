"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type SavedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  price?: string
  brand?: string
  category?: string
  description?: string
}

const COMPARE_KEY = "tritech-compare-products"
const RECENT_KEY = "tritech-recently-viewed"
const CHANGE_EVENT = "tritech-discovery-updated"

function readItems(key: string): SavedProduct[] {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as SavedProduct[]) : []
  } catch {
    return []
  }
}

function saveItems(key: string, items: SavedProduct[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Storage may be unavailable in private browsing; the storefront remains usable.
  }
}

function useSavedItems(key: string) {
  const [items, setItems] = useState<SavedProduct[]>([])

  useEffect(() => {
    const refresh = () => setItems(readItems(key))
    refresh()
    window.addEventListener(CHANGE_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [key])

  return items
}

export function CompareProductButton({ product }: { product: SavedProduct }) {
  const items = useSavedItems(COMPARE_KEY)
  const selected = items.some((item) => item.id === product.id)

  const toggle = () => {
    const current = readItems(COMPARE_KEY)
    if (current.some((item) => item.id === product.id)) {
      saveItems(COMPARE_KEY, current.filter((item) => item.id !== product.id))
      return
    }
    if (current.length >= 4) {
      return
    }
    saveItems(COMPARE_KEY, [...current, product])
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={selected}
      title={selected ? "Remove from comparison" : "Add to comparison"}
      className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-bold transition ${selected ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"}`}
    >
      {selected ? "✓ Added to compare" : "＋ Compare"}
    </button>
  )
}

export function CompareDock() {
  const items = useSavedItems(COMPARE_KEY)
  if (!items.length) return null

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-slate-900">Compare products <span className="ml-1 text-blue-700">({items.length}/4)</span></p>
        <p className="mt-0.5 truncate text-[10px] text-slate-500">{items.map((item) => item.title).join(" · ")}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => saveItems(COMPARE_KEY, [])} className="rounded-lg px-3 py-2 text-[10px] font-semibold text-slate-500 hover:bg-slate-100">Clear</button>
        <LocalizedClientLink href="/compare" className="rounded-lg bg-blue-700 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-blue-800">Compare now →</LocalizedClientLink>
      </div>
    </aside>
  )
}

export function ComparePageContent() {
  const items = useSavedItems(COMPARE_KEY)

  const remove = (id: string) =>
    saveItems(COMPARE_KEY, items.filter((item) => item.id !== id))

  if (!items.length) {
    return (
      <section className="content-container py-16 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Compare products</h1>
        <p className="mt-2 text-sm text-slate-500">Add up to four products using the Compare option on product cards.</p>
        <LocalizedClientLink href="/shop" className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-xs font-bold text-white hover:bg-blue-800">Browse products</LocalizedClientLink>
      </section>
    )
  }

  const rows: { label: string; value: (item: SavedProduct) => string }[] = [
    { label: "Price", value: (item) => item.price || "Check product page" },
    { label: "Brand", value: (item) => item.brand || "Not specified" },
    { label: "Category", value: (item) => item.category || "Not specified" },
    { label: "Overview", value: (item) => item.description || "See product page for details" },
  ]

  return (
    <section className="content-container py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Make a confident choice</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950">Compare products</h1>
          <p className="mt-1 text-xs text-slate-500">A side-by-side view of your selected products.</p>
        </div>
        <button type="button" onClick={() => saveItems(COMPARE_KEY, [])} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Clear comparison</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[640px] w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-36 p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Details</th>
              {items.map((item) => (
                <th key={item.id} className="min-w-48 border-l border-slate-200 p-4 align-top">
                  <p className="line-clamp-2 text-xs font-bold text-slate-900">{item.title}</p>
                  <LocalizedClientLink href={`/products/${item.handle}`} className="mt-2 inline-block text-[10px] font-bold text-blue-700 hover:text-blue-900">View product →</LocalizedClientLink>
                  <button type="button" onClick={() => remove(item.id)} className="ml-3 text-[10px] font-semibold text-slate-400 hover:text-red-600">Remove</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <th className="bg-slate-50/70 p-4 text-[10px] font-bold text-slate-600">{row.label}</th>
                {items.map((item) => <td key={item.id} className="border-l border-slate-100 p-4 text-xs leading-relaxed text-slate-700">{row.value(item)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-slate-400">Specifications depend on the information supplied for each product. Open a product page for full technical details.</p>
    </section>
  )
}

export function RecentlyViewedTracker({ product }: { product: SavedProduct }) {
  useEffect(() => {
    const current = readItems(RECENT_KEY).filter((item) => item.id !== product.id)
    saveItems(RECENT_KEY, [product, ...current].slice(0, 6))
  }, [product])

  return null
}

export function RecentlyViewedProducts() {
  const items = useSavedItems(RECENT_KEY)
  if (!items.length) return null

  return (
    <section className="content-container py-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">Recently viewed</h2>
        <span className="text-[10px] text-slate-400">Pick up where you left off</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <LocalizedClientLink key={item.id} href={`/products/${item.handle}`} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm">
            <span className="line-clamp-2 text-xs font-bold text-slate-800">{item.title}</span>
            {item.price && <span className="mt-2 block text-[11px] font-semibold text-blue-700">{item.price}</span>}
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
