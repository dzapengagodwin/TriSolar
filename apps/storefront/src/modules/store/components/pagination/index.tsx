"use client"

import { ChevronDown } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) {
      return
    }

    const params = new URLSearchParams(searchParams)
    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      type="button"
      key={p}
      aria-current={isCurrent ? "page" : undefined}
      aria-label={`Go to page ${p}`}
      className={`flex h-10 min-w-10 items-center justify-center border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isCurrent
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
      }`}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      aria-hidden="true"
      className="flex h-10 min-w-6 items-center justify-center px-1 text-sm text-gray-400"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  const renderBoundaryButton = (direction: "previous" | "next") => {
    const isPrevious = direction === "previous"
    const isDisabled = isPrevious ? page === 1 : page === totalPages

    return (
      <button
        type="button"
        aria-label={isPrevious ? "Go to previous page" : "Go to next page"}
        disabled={isDisabled}
        onClick={() => handlePageChange(page + (isPrevious ? -1 : 1))}
        className="flex h-10 items-center gap-2 border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPrevious && <ChevronDown className="h-4 w-4 rotate-90" />}
        <span className="hidden sm:inline">
          {isPrevious ? "Previous" : "Next"}
        </span>
        {!isPrevious && <ChevronDown className="h-4 w-4 -rotate-90" />}
      </button>
    )
  }

  return (
    <nav
      aria-label="Product pages"
      className="mt-12 flex w-full justify-center border-t border-gray-100 pt-6"
    >
      <div
        className="flex w-full max-w-2xl items-center justify-between gap-2"
        data-testid={dataTestid}
      >
        {renderBoundaryButton("previous")}
        <div className="flex items-center gap-1 overflow-x-auto px-1 sm:gap-2">
          {renderPageButtons()}
        </div>
        {renderBoundaryButton("next")}
      </div>
    </nav>
  )
}
