import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-white">
      {/* Row 1: Top Announcement Bar (#063A34 Deep Forest Green) */}
      <div className="bg-[#063A34] text-white text-xs py-2 text-center font-medium">
        <div className="content-container flex justify-center items-center gap-2">
          <span>🚀 Introducing Our Fastest Delivery Service In Your City!</span>
          <LocalizedClientLink href="/store" className="text-[#FF9F0D] font-bold underline hover:text-amber-300">
            Order Now ⚡
          </LocalizedClientLink>
        </div>
      </div>

      {/* Row 2: Main White Search Header */}
      <header className="bg-white py-3.5 border-b border-gray-100 shadow-sm">
        <div className="content-container flex items-center justify-between gap-x-6">
          
          {/* Logo */}
          <div className="flex items-center gap-x-3">
            <div className="small:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-x-2 group"
              data-testid="nav-store-link"
            >
              <div className="w-10 h-10 bg-[#FF9F0D] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                N
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-black tracking-tight text-[#063A34] font-sans">
                  Nex
                </span>
                <span className="text-2xl font-black tracking-tight text-gray-800 font-sans">
                  Cart
                </span>
                <span className="w-2 h-2 bg-[#FF9F0D] rounded-full ml-0.5"></span>
              </div>
            </LocalizedClientLink>
          </div>

          {/* Search Box with Live Medusa Category Selector */}
          <div className="flex-1 max-w-2xl mx-4 hidden small:flex items-center">
            <div className="w-full relative flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-gray-50 focus-within:border-[#063A34] transition-colors">
              <select className="bg-transparent text-xs text-gray-700 font-semibold px-4 py-2.5 outline-none border-r border-gray-200 cursor-pointer max-w-[150px]">
                <option value="">All Categories</option>
                {categories && categories.map((cat) => (
                  <option key={cat.id} value={cat.handle}>{cat.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-xs px-4 py-2.5 focus:outline-none"
              />

              <button className="bg-[#FF9F0D] hover:bg-[#E58B00] text-white px-6 py-2.5 font-bold text-xs transition-colors flex items-center gap-1">
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons: Wishlist, Compare, Cart Dropdown */}
          <div className="flex items-center gap-x-5 text-xs text-gray-700 font-semibold">
            
            {/* Wishlist */}
            <LocalizedClientLink href="/account" className="flex items-center gap-1.5 hover:text-[#063A34] transition-colors relative">
              <div className="relative">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#FF9F0D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
              </div>
            </LocalizedClientLink>

            {/* Compare */}
            <LocalizedClientLink href="/store" className="flex items-center gap-1.5 hover:text-[#063A34] transition-colors hidden sm:flex">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </LocalizedClientLink>

            {/* Cart Dropdown */}
            <div className="flex items-center">
              <Suspense
                fallback={
                  <LocalizedClientLink href="/cart" className="flex items-center gap-2 bg-[#063A34] text-white px-4 py-2 rounded-full font-bold text-xs">
                    <span>$ 0.00</span>
                    <div className="relative">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>

          </div>

        </div>
      </header>

      {/* Row 3: Sub-Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 hidden small:block">
        <div className="content-container flex items-center justify-between text-xs font-bold py-2.5">
          
          <div className="flex items-center gap-x-8">
            {/* Browse Categories Pill Button */}
            <div className="relative group">
              <div className="bg-[#063A34] text-white px-5 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-[#042723] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Browse Categories ˅</span>
              </div>

              {/* Categories Dropdown Menu */}
              {categories && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                  {categories.map((cat) => (
                    <LocalizedClientLink
                      key={cat.id}
                      href={`/categories/${cat.handle}`}
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#063A34] transition-colors"
                    >
                      {cat.name}
                    </LocalizedClientLink>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <LocalizedClientLink href="/store" className="text-gray-800 hover:text-[#063A34] transition-colors">
              Store Catalog
            </LocalizedClientLink>

            {categories && categories.slice(0, 4).map((c) => (
              <LocalizedClientLink
                key={c.id}
                href={`/categories/${c.handle}`}
                className="text-gray-800 hover:text-[#063A34] transition-colors"
              >
                {c.name}
              </LocalizedClientLink>
            ))}
          </div>

        </div>
      </nav>
    </div>
  )
}
