"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { XMark, ArrowRight } from "@medusajs/icons"

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
      router.push(`/${countryCode}/shop`)
      return
    }

    const searchUrlParams = new URLSearchParams()
    searchUrlParams.set("q", query.trim())
    router.push(`/${countryCode}/shop?${searchUrlParams.toString()}`)
  }

  return (
    <div ref={searchRef} className="w-full relative">
      <form
        onSubmit={handleSearchSubmit}
        className="w-full relative flex items-stretch border border-gray-200 rounded-md overflow-hidden bg-white focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-2xs h-10 sm:h-11"
      >
        {/* Text Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true)
            }}
            placeholder="I'm searching for..."
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm px-4 sm:px-5 py-2 focus:outline-none"
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
              className="text-gray-400 hover:text-gray-600 px-2.5 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <XMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit Button with MagnifyingGlass Icon */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-5 sm:px-6 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </form>

      {/* Live Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[420px] overflow-y-auto">
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
                    href={`/product/${product.handle}`}
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
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        {product.title}
                      </span>
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
