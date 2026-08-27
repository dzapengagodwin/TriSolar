import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"
import {
  LockClosedSolid,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  TruckFast,
} from "@medusajs/icons"
import { createNoIndexMetadata } from "@lib/seo/metadata"
import { Metadata } from "next"

export const metadata: Metadata = createNoIndexMetadata(
  "Secure Checkout",
  "Complete your secure order on LaptopZone."
)

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#F9FAFB] min-h-screen flex flex-col justify-between">
      {/* 1. Top Announcement Bar (Black Header) */}
      <div className="bg-black text-white text-xs py-2 text-center font-medium">
        <div className="content-container flex justify-center items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Fast & Secure Checkout • 100% Money Back Guarantee</span>
        </div>
      </div>

      {/* 2. Main White Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <nav className="flex h-16 items-center content-container justify-between gap-x-4">
          {/* Back to Cart */}
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-1.5 text-xs font-bold text-gray-700 hover:text-black transition-colors"
            data-testid="back-to-cart-link"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
            <span className="hidden sm:inline">Back to shopping cart</span>
            <span className="inline sm:hidden">Back</span>
          </LocalizedClientLink>

          {/* Laptop Zone Logo */}
          <Logo size="sm" />

          {/* 256-Bit SSL Security Badge */}
          <div className="flex items-center gap-1.5 bg-gray-100 text-black text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
            <LockClosedSolid className="w-4 h-4 text-black" />
            <span className="hidden md:inline">256-Bit SSL Encrypted</span>
            <span className="inline md:hidden">Secure</span>
          </div>
        </nav>
      </header>

      {/* 3. Main Checkout Container */}
      <main className="relative flex-1" data-testid="checkout-container">
        {children}
      </main>

      {/* 4. Laptop Zone Checkout Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="content-container flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-x-6 font-semibold">
            <div className="flex items-center gap-1.5 text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <TruckFast className="w-4 h-4 text-black" />
              <span>Fast Express Delivery</span>
            </div>
          </div>

          <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
            <Image
              src="/payment-methods.png"
              alt="Accepted Payment Methods - Visa, Mastercard, ZimSwitch, EcoCash, InnBucks"
              width={240}
              height={32}
              className="h-6 w-auto object-contain"
            />
          </div>

          <p className="text-gray-400">
            © {new Date().getFullYear()} Laptop Zone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
