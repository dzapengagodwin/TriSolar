"use client"

import { useState, useEffect, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type PriceFilterSliderProps = {
  minBound?: number
  maxBound?: number
  currencySymbol?: string
}

export default function PriceFilterSlider({
  minBound = 0,
  maxBound = 3000,
  currencySymbol = "$",
}: PriceFilterSliderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentMin = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : minBound
  const currentMax = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : maxBound

  const [minPrice, setMinPrice] = useState<number>(currentMin)
  const [maxPrice, setMaxPrice] = useState<number>(currentMax)

  // Sync state when URL params change
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : minBound)
    setMaxPrice(searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : maxBound)
  }, [searchParams, minBound, maxBound])

  const applyPriceFilter = (newMin?: number, newMax?: number) => {
    const finalMin = newMin !== undefined ? newMin : minPrice
    const finalMax = newMax !== undefined ? newMax : maxPrice

    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")

    if (finalMin > minBound) {
      params.set("minPrice", finalMin.toString())
    } else {
      params.delete("minPrice")
    }

    if (finalMax < maxBound) {
      params.set("maxPrice", finalMax.toString())
    } else {
      params.delete("maxPrice")
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - 10)
    setMinPrice(val)
  }

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + 10)
    setMaxPrice(val)
  }

  const handleReset = () => {
    setMinPrice(minBound)
    setMaxPrice(maxBound)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const isFiltered =
    searchParams.has("minPrice") || searchParams.has("maxPrice")

  const minPercent = Math.min(Math.max(((minPrice - minBound) / (maxBound - minBound)) * 100, 0), 100)
  const maxPercent = Math.min(Math.max(((maxPrice - minBound) / (maxBound - minBound)) * 100, 0), 100)

  return (
    <div className="flex flex-col gap-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider">
          Price Range
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Dual Range Track */}
      <div className="relative w-full py-4 px-1">
        {/* Background Track */}
        <div className="h-1.5 w-full bg-gray-200 rounded-full relative">
          {/* Active Highlighted Range Track */}
          <div
            className="absolute h-1.5 bg-primary rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min Range Input */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={10}
          value={minPrice}
          onChange={handleMinSlider}
          onMouseUp={() => applyPriceFilter()}
          onTouchEnd={() => applyPriceFilter()}
          className="absolute inset-x-0 top-3 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
          aria-label="Minimum price"
        />

        {/* Max Range Input */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={10}
          value={maxPrice}
          onChange={handleMaxSlider}
          onMouseUp={() => applyPriceFilter()}
          onTouchEnd={() => applyPriceFilter()}
          className="absolute inset-x-0 top-3 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
          aria-label="Maximum price"
        />
      </div>

      {/* Numeric Min & Max Input Boxes + Apply Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-white text-xs text-gray-700">
          <span className="text-gray-400 mr-1 text-[11px] font-semibold">{currencySymbol}</span>
          <input
            type="number"
            min={minBound}
            max={maxPrice}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
            className="w-full bg-transparent outline-none text-xs font-bold text-gray-800"
          />
        </div>

        <span className="text-gray-400 text-xs font-bold">—</span>

        <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-white text-xs text-gray-700">
          <span className="text-gray-400 mr-1 text-[11px] font-semibold">{currencySymbol}</span>
          <input
            type="number"
            min={minPrice}
            max={maxBound}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
            className="w-full bg-transparent outline-none text-xs font-bold text-gray-800"
          />
        </div>

        <button
          type="button"
          onClick={() => applyPriceFilter()}
          disabled={isPending}
          className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {isPending ? "..." : "Go"}
        </button>
      </div>
    </div>
  )
}
