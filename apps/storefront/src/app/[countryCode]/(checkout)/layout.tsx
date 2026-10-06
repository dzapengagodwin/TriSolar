import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"
import { ChevronLeft } from "@medusajs/icons"
import { createNoIndexMetadata } from "@lib/seo/metadata"
import { Metadata } from "next"

export const metadata: Metadata = createNoIndexMetadata(
  "Secure Checkout",
  "Complete your secure order on Laptopzone."
)

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#F9FAFB] min-h-screen flex flex-col justify-between">
      {/* Main White Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <nav className="flex h-16 items-center content-container justify-between gap-x-4">
          {/* Back to Cart */}
          <div className="flex-1 flex justify-start">
            <LocalizedClientLink
              href="/cart"
              className="flex items-center gap-x-1.5 text-xs font-bold text-gray-700 hover:text-black transition-colors"
              data-testid="back-to-cart-link"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
              <span className="hidden sm:inline">Back to shopping cart</span>
              <span className="inline sm:hidden">Back</span>
            </LocalizedClientLink>
          </div>

          {/* Laptopzone Logo */}
          <Logo size="sm" />

          {/* Right spacer to keep logo centered */}
          <div className="flex-1" aria-hidden="true" />
        </nav>
      </header>

      {/* Main Checkout Container */}
      <main className="relative flex-1" data-testid="checkout-container">
        {children}
      </main>

      {/* Minimalist Checkout Footer */}
      <footer className="border-t border-gray-100 py-6 mt-12 bg-white text-xs text-gray-500">
        <div className="content-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-x-6 text-gray-500 font-medium">
            <LocalizedClientLink href="/terms-and-conditions" className="hover:text-black transition-colors">
              Terms &amp; Conditions
            </LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/returns-and-refunds" className="hover:text-black transition-colors">
              Returns Policy
            </LocalizedClientLink>
          </div>

          <p className="text-gray-400">
            © {new Date().getFullYear()} Laptopzone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
