import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { getWishlist } from "@lib/data/wishlist"
import { StoreRegion, HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"
import StickyNav from "@modules/layout/components/sticky-nav"
import CategoryDropdown from "@modules/layout/components/category-dropdown"
import Logo from "@modules/common/components/logo"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import {
  Heart,
  ShoppingBag,
} from "@medusajs/icons"

import MegaMenuNav from "@modules/layout/components/mega-menu-nav"

export default async function Nav({
  cart,
  shippingOptions,
}: {
  cart?: HttpTypes.StoreCart | null
  shippingOptions?: HttpTypes.StoreCartShippingOption[]
}) {
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
      <StickyNav
        announcement={
          <div className="hidden small:block bg-slate-900 text-slate-300 text-[11px] py-2 border-b border-slate-800" suppressHydrationWarning>
            <div className="content-container flex justify-between items-center gap-x-4 font-medium" suppressHydrationWarning>
              {/* Left: Brand Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="font-semibold text-white">Laptops &amp; Enterprise Networking</span>
              </div>

              {/* Center: Quick Notice */}
              <div className="text-slate-400 text-xs hidden md:block">
                ⚡ Same-Day Dispatch on In-Stock Hardware &bull; Tier-1 Warranty
              </div>

              {/* Right: Quick Links */}
              <div className="flex items-center gap-x-4 shrink-0 text-xs text-slate-300">
                <LocalizedClientLink
                  href="/it-solutions#request-quote"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                >
                  Request a Quote
                </LocalizedClientLink>

                <span className="text-slate-700">|</span>

                <LocalizedClientLink
                  href="/account/orders"
                  className="hover:text-white transition-colors"
                >
                  Track Order
                </LocalizedClientLink>

                <span className="text-slate-700">|</span>

                <LocalizedClientLink href="/contact-us" className="hover:text-white transition-colors">
                  Contact
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        }
        topRow={
          <>
        {/* Row 2: Main White Search Header */}
        <header className="bg-white py-2.5 sm:py-3.5 border-b border-gray-100 shadow-sm">
          <div className="content-container flex items-center justify-between gap-x-2 sm:gap-x-6">
            
            {/* Left: Brand Logo & Mobile Menu */}
            <div className="flex items-center gap-x-1 sm:gap-x-3 shrink-0">
              <div className="small:hidden flex items-center">
                <SideMenu
                  regions={regions}
                  locales={locales}
                  currentLocale={currentLocale}
                  categories={categories}
                />
              </div>

              <div className="max-w-[105px] sm:max-w-none">
                <Logo size="md" />
              </div>
            </div>

            {/* Search Box with Interactive Autocomplete & Filter (Desktop / Tablet) */}
            <div className="flex-1 max-w-2xl mx-4 hidden small:flex items-center">
              <Suspense fallback={<div className="w-full h-10 bg-gray-50 rounded-md animate-pulse" />}>
                <SearchBar categories={categories} />
              </Suspense>
            </div>

            {/* Right Action Icons: Wishlist, Account, Cart Dropdown */}
            <div className="flex items-center gap-x-2.5 sm:gap-x-4 text-xs text-gray-700 font-semibold shrink-0">
              
              {/* Wishlist Icon */}
              <LocalizedClientLink href="/wishlist" className="p-1 hover:text-black transition-colors relative" aria-label="Wishlist">
                <div className="relative">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                </div>
              </LocalizedClientLink>

              {/* User Account Link */}
              <LocalizedClientLink href="/account" className="p-1 hover:text-black transition-colors" aria-label="User Account">
                <User size="22" className="text-gray-800" />
              </LocalizedClientLink>

              {/* Cart Dropdown */}
              <div className="flex items-center">
                <Suspense
                  fallback={
                    <LocalizedClientLink href="/cart" className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-2.5 sm:px-4 py-2 rounded-full font-bold text-xs transition-colors">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </LocalizedClientLink>
                  }
                >
                  <CartButton cart={cart} shippingOptions={shippingOptions} />
                </Suspense>
              </div>

            </div>

          </div>
        </header>
          </>
        }
        mobileSearch={
          <div className="content-container pb-2">
            <Suspense fallback={<div className="w-full h-10 bg-gray-50 rounded-md animate-pulse" />}>
              <SearchBar categories={categories} />
            </Suspense>
          </div>
        }
        desktopNavigation={
          <>

        {/* Row 3: Sub-Navigation Bar with Category Dropdown and Mega Menu */}
        <nav className="bg-[#07152E] border-[#07152E] hidden small:block text-white">
          <div className="content-container flex items-center justify-between text-xs font-semibold py-1 relative">
            <div className="flex items-center gap-x-2 flex-1">
              {/* Browse All Categories Button */}
              <CategoryDropdown categories={categories} />

              {/* Top Navigation Items with Mega Menu Dropdown */}
              <MegaMenuNav />
            </div>
          </div>
        </nav>
          </>
        }
      />
    </div>
  )
}
