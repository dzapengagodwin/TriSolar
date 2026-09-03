"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { MagnifyingGlass, XMark, ArrowRight } from "@medusajs/icons"

type SearchBarProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

export default function SearchBar({ categories: _categories }: SearchBarProps) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const countryCode = (params?.countryCode as string) || "zw"
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)

  // Sync state with URL params
  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  // Click outside listener to close autocomplete popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Live autocomplete search effect with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&countryCode=${countryCode}`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
          setIsOpen(true)
        }
      } catch (err) {
        console.error("Search fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, countryCode])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)

    if (!query.trim()) {
      router.push(`/${countryCode}/store`)
      return
    }

    const searchUrlParams = new URLSearchParams()
    searchUrlParams.set("q", query.trim())
    router.push(`/${countryCode}/store?${searchUrlParams.toString()}`)
  }

  return (
    <div ref={searchRef} className="w-full relative">
      <form
        onSubmit={handleSearchSubmit}
        className="w-full relative flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-gray-50 focus-within:border-black focus-within:bg-white transition-all shadow-xs"
      >
        {/* Text Input with Search Icon */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true)
            }}
            placeholder="Search products, brands and categories..."
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-xs px-4 sm:px-5 py-2.5 focus:outline-none"
          />

          {/* Clear Button with XMark Icon */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
                setIsOpen(false)
              }}
              className="text-gray-400 hover:text-gray-600 px-2 flex items-center cursor-pointer"
              aria-label="Clear search"
            >
              <XMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit Button with MagnifyingGlass Icon */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <MagnifyingGlass className="w-4 h-4" />
        </button>
      </form>

      {/* Live Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Searching products...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Matching Products ({results.length})
              </div>
              {results.map((product) => {
                const thumbnail = product.thumbnail || product.images?.[0]?.url
                return (
                  <LocalizedClientLink
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={product.title}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">
                        {product.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">
                        {product.subtitle || product.collection?.title || "Product"}
                      </p>
                    </div>
                  </LocalizedClientLink>
                )
              })}
              <button
                onClick={handleSearchSubmit}
                className="w-full text-center py-2.5 text-xs font-bold text-black hover:bg-gray-100 transition-colors border-t border-gray-100 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View all results for &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-500">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
