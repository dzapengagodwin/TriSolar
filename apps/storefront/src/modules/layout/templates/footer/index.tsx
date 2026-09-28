import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

export default async function Footer() {
  const [categories, { collections }] = await Promise.all([
    listCategories().catch(() => []),
    listCollections({ limit: "10" }).catch(() => ({ collections: [] })),
  ])

  // Filter root categories for clean category navigation
  const topCategories = categories
    .filter((c) => !c.parent_category_id)
    .slice(0, 8)

  const topCollections = collections.slice(0, 6)

  return (
    <footer
      className="bg-[#212121] text-gray-300 w-full pt-14 text-xs font-normal"
      suppressHydrationWarning
    >
      <div
        className="content-container flex flex-col w-full"
        suppressHydrationWarning
      >
        {/* Main Grid: Left Brand/Contact Info | Middle "Find It Fast" (2 cols) | Right "Customer Care" */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-14"
          suppressHydrationWarning
        >
          {/* Column 1: Brand, 24/7 Hotline, Address & Socials (5 cols on lg) */}
          <div
            className="lg:col-span-5 space-y-6 pr-0 lg:pr-6"
            suppressHydrationWarning
          >
           

            {/* Hotline Box with Headphone Icon */}
            <div className="flex items-center gap-4 pt-2">
              <div className="text-primary shrink-0">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Headband */}
                  <path
                    d="M13 30C13 18.5 21.5 10 32 10C42.5 10 51 18.5 51 30"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Left Ear Cushion */}
                  <rect
                    x="8"
                    y="27"
                    width="9"
                    height="18"
                    rx="4.5"
                    fill="currentColor"
                  />
                  {/* Right Ear Cushion */}
                  <rect
                    x="47"
                    y="27"
                    width="9"
                    height="18"
                    rx="4.5"
                    fill="currentColor"
                  />
                  {/* Microphone Boom */}
                  <path
                    d="M13 44C13 50.5 18 53 25 53H34"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Microphone Capsule */}
                  <rect
                    x="33"
                    y="50.5"
                    width="8"
                    height="5"
                    rx="2.5"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <span className="block text-[11px] text-gray-400 font-medium tracking-wide">
                  Got Questions ? Call us!
                </span>
                <a
                  href="tel:+2638612600600"
                  className="block text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 hover:text-primary transition-colors"
                >
                  +263 8612 600 600
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-white font-bold text-xs tracking-wide">
                Contact Info
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                64 Ridgeway, Harare, Borrowdale, Zimbabwe
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 pt-2 text-gray-400">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 & 3: Categories & Featured (4 cols on lg) */}
          <div className="lg:col-span-4" suppressHydrationWarning>
            <div
              className="grid grid-cols-2 gap-6 sm:gap-8"
              suppressHydrationWarning
            >
              {/* Product Categories Sub-column */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm tracking-wide">
                  Categories
                </h4>
                <ul className="space-y-2.5 text-gray-400 pt-1">
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <LocalizedClientLink
                        href={`/categories/${cat.handle}`}
                        className="hover:text-white transition-colors block truncate"
                      >
                        {cat.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collections & Store Links Sub-column */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm tracking-wide">
                  Featured
                </h4>
                <ul className="space-y-2.5 text-gray-400 pt-1">
                  {topCollections.map((col) => (
                    <li key={col.id}>
                      <LocalizedClientLink
                        href={`/collections/${col.handle}`}
                        className="hover:text-white transition-colors block truncate"
                      >
                        {col.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                  <li>
                    <LocalizedClientLink
                      href="/wishlist"
                      className="hover:text-white transition-colors block"
                    >
                      Wishlist
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/contact"
                      className="hover:text-white transition-colors block"
                    >
                      Contact Us
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 4: "Customer Care" (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4" suppressHydrationWarning>
            <h4 className="text-white font-bold text-sm tracking-wide">
              Customer Care
            </h4>

            <ul className="space-y-2.5 text-gray-400 pt-1">
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="hover:text-white transition-colors block"
                >
                  My Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account/orders"
                  className="hover:text-white transition-colors block"
                >
                  Track your Order
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contact"
                  className="hover:text-white transition-colors block"
                >
                  Customer Support
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/terms"
                  className="hover:text-white transition-colors block"
                >
                  Terms &amp; Conditions
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/privacy"
                  className="hover:text-white transition-colors block"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/returns"
                  className="hover:text-white transition-colors block"
                >
                  Returns &amp; Refunds
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/warranty"
                  className="hover:text-white transition-colors block"
                >
                  Warranty
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/shipping"
                  className="hover:text-white transition-colors block"
                >
                  Shipping
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/cookies"
                  className="hover:text-white transition-colors block"
                >
                  Cookies
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div
        className="bg-[#181818] border-t border-[#2d2d2d] py-5"
        suppressHydrationWarning
      >
        <div
          className="content-container flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-gray-400"
          suppressHydrationWarning
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div>
              &copy; <span className="text-white font-semibold">Laptopzone</span>{" "}
              - All Rights Reserved
            </div>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 flex items-center justify-center">
              <Image
                src="/payment-methods.png"
                alt="Accepted Payment Methods - Visa, Mastercard, PayPal, EcoCash, Pesepay"
                width={280}
                height={32}
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
