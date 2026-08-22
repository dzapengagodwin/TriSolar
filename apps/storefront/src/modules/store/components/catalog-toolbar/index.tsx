"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clsx from "clsx"

type CatalogToolbarProps = {
  totalCount: number
  currentPage: number
  pageSize: number
  sortBy?: SortOptions
  viewMode?: "grid" | "list"
  breadcrumbs?: { name: string; href?: string }[]
  title?: string
}

export default function CatalogToolbar({
  totalCount,
  currentPage,
  pageSize,
  sortBy = "created_at",
  viewMode = "grid",
  breadcrumbs = [],
  title,
}: CatalogToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sortBy", newSort)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleViewChange = (newView: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", newView)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="w-full mb-6 border-b border-gray-200 pb-4">
      {/* Top Header Title */}
      {title && (
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">
          {title}
        </h1>
      )}

      {/* Main Status & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Result Count & Breadcrumb */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 font-medium">
          {totalCount > 0 ? (
            <span className="text-gray-900 font-bold">
              {startItem}-{endItem} of {totalCount}
            </span>
          ) : (
            <span className="text-gray-500">0 products</span>
          )}

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <LocalizedClientLink
              href="/"
              className="hover:text-black transition-colors"
            >
              Home
            </LocalizedClientLink>

            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span>:</span>
                {crumb.href ? (
                  <LocalizedClientLink
                    href={crumb.href}
                    className="hover:text-black transition-colors"
                  >
                    &quot;{crumb.name}&quot;
                  </LocalizedClientLink>
                ) : (
                  <span className="text-gray-800 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                    &quot;{crumb.name}&quot;
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Sort Dropdown & Grid/List View Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium whitespace-nowrap">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-800 px-2.5 py-1.5 outline-none focus:border-black cursor-pointer shadow-2xs"
            >
              <option value="created_at">Popularity / Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-50 p-0.5">
            {/* List Mode Button */}
            <button
              type="button"
              onClick={() => handleViewChange("list")}
              aria-label="List View"
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer",
                {
                  "bg-white text-gray-900 shadow-2xs border border-gray-200":
                    viewMode === "list",
                  "text-gray-500 hover:text-gray-900": viewMode !== "list",
                }
              )}
            >
              {/* List Icon */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
              <span>List</span>
            </button>

            {/* Grid Mode Button */}
            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              aria-label="Grid View"
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer",
                {
                  "bg-white text-gray-900 shadow-2xs border border-gray-200":
                    viewMode === "grid",
                  "text-gray-500 hover:text-gray-900": viewMode !== "grid",
                }
              )}
            >
              {/* Grid Icon */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
              </svg>
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
