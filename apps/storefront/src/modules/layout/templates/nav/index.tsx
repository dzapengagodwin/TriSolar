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
    <div className="sticky top-0 inset-x-0 z-50 bg-white" suppressHydrationWarning>
      {/* Row 1: Top Announcement Bar (Black Header) */}
      <div className="bg-black text-white text-xs py-2 text-center font-medium" suppressHydrationWarning>
        <div className="content-container flex justify-center items-center gap-2" suppressHydrationWarning>
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Introducing Our Fastest Express Delivery Service In Your City!</span>
          <LocalizedClientLink href="/store" className="text-primary font-bold underline hover:text-orange-400 flex items-center gap-1">
            <span>Order Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </LocalizedClientLink>
        </div>
      </div>

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
      <nav className="bg-primary border-b border-orange-300 hidden small:block text-white">
        <div className="content-container flex items-center justify-between text-xs font-bold py-1">
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
  )
}
