import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { getWishlist } from "@lib/data/wishlist"
import { StoreRegion, HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"
import CategoryDropdown from "@modules/layout/components/category-dropdown"
import Logo from "@modules/common/components/logo"
import User from "@modules/common/icons/user"
import {
  Sparkles,
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowsPointingOut,
} from "@medusajs/icons"

import MegaMenuNav from "@modules/layout/components/mega-menu-nav"

export default async function Nav({ cart }: { cart?: HttpTypes.StoreCart | null }) {
  const [regions, locales, currentLocale, categories, wishlist] = await Promise.all([
    listRegions()
      .then((regions: StoreRegion[]) => regions)
      .catch(() => []),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
    getWishlist().catch(() => null),
  ])

  const wishlistCount = wishlist?.items?.length || 0

  return (
    <div className="relative w-full" suppressHydrationWarning>
      {/* Row 1: Top Announcement Bar (Scrolls away on scroll) */}
      <div className="bg-white text-gray-700 text-[11px] py-1.5 border-b border-gray-200" suppressHydrationWarning>
        <div className="content-container flex flex-col sm:flex-row justify-between items-center gap-2 font-normal text-[#333333]" suppressHydrationWarning>
          {/* Left: Call Us */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Call us :</span>
            <a href="tel:+2638612600600" className="text-[#0066cc] hover:underline font-medium">
              +263 8612 600 600
            </a>
          </div>

          {/* Center: Free Nationwide Delivery */}
          <div className="flex items-center gap-1.5 text-center font-medium">
            <span>Free Nationwide Delivery</span>
            <svg
              className="w-4 h-4 text-primary inline-block shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.175V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v10.875m12 0H2.25"
              />
            </svg>
            <span>on all orders over USD $ 500.00</span>
          </div>

          {/* Right: Chat on WhatsApp */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Chat on WhatsApp</span>
            <a
              href="https://wa.me/263772953946"
              target="_blank"
              rel="noreferrer"
              className="text-[#0066cc] hover:underline font-medium"
            >
              +263772953946
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Container (Row 2 & Row 3 remain sticky on scroll) */}
      <div className="sticky top-0 inset-x-0 z-50 bg-white" suppressHydrationWarning>
        {/* Row 2: Main White Search Header */}
        <header className="bg-white py-3.5 border-b border-gray-100 shadow-sm">
          <div className="content-container flex items-center justify-between gap-x-6">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-x-3">
              <div className="small:hidden">
                <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
              </div>

              <Logo size="md" />
            </div>

            {/* Search Box with Interactive Autocomplete & Filter */}
            <div className="flex-1 max-w-2xl mx-4 hidden small:flex items-center">
              <Suspense fallback={<div className="w-full h-10 bg-gray-50 rounded-full animate-pulse" />}>
                <SearchBar categories={categories} />
              </Suspense>
            </div>

            {/* Right Action Icons: Wishlist, Compare, Cart Dropdown */}
            <div className="flex items-center gap-x-5 text-xs text-gray-700 font-semibold">
              
              {/* Wishlist Icon */}
              <LocalizedClientLink href="/wishlist" className="flex items-center gap-1.5 hover:text-black transition-colors relative" aria-label="Wishlist">
                <div className="relative">
                  <Heart className="w-6 h-6 text-gray-800" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                </div>
              </LocalizedClientLink>

              {/* User Account Link */}
              <LocalizedClientLink href="/account" className="flex items-center gap-1.5 hover:text-black transition-colors" aria-label="User Account">
                <User size="24" className="text-gray-800" />
              </LocalizedClientLink>

              {/* Compare Icon */}
              <LocalizedClientLink href="/store" className="flex items-center gap-1.5 hover:text-black transition-colors hidden sm:flex" aria-label="Compare products">
                <ArrowsPointingOut className="w-6 h-6 text-gray-800" />
              </LocalizedClientLink>

              {/* Cart Dropdown */}
              <div className="flex items-center">
                <Suspense
                  fallback={
                    <LocalizedClientLink href="/cart" className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-xs transition-colors">
                      <span>{convertToLocale({ amount: 0, currency_code: "usd" })}</span>
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </LocalizedClientLink>
                  }
                >
                  <CartButton cart={cart} />
                </Suspense>
              </div>

            </div>

          </div>
        </header>

        {/* Row 3: Sub-Navigation Bar with Category Dropdown and Mega Menu */}
        <nav className="bg-black border-b border-black-300 hidden small:block text-white">
          <div className="content-container flex items-center justify-between text-xs font-bold py-1 relative">
            <div className="flex items-center gap-x-2">
              {/* Browse All Categories Button */}
              <CategoryDropdown categories={categories} />

              {/* Top Navigation Items with Mega Menu Dropdown */}
              <MegaMenuNav categories={categories} />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-black text-gray-900 pr-2">
              <span>Free Delivery Over $50</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
