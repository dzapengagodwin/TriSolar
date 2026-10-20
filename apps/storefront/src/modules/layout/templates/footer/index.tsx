import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { getCategoryPublicPath } from "@lib/seo/canonical"
import FooterDealsBox from "@modules/layout/components/footer-deals-box"

export default async function Footer() {
  const categories = await listCategories().catch(() => [])

  // Filter root categories for clean category navigation
  const topCategories = categories
    .filter((c) => !c.parent_category_id)
    .slice(0, 8)

  return (
    <footer
      className="bg-[#212121] text-gray-300 w-full pt-14 text-xs font-normal"
      suppressHydrationWarning
    >
      <div
        className="content-container flex flex-col w-full"
        suppressHydrationWarning
      >
        {/* Main Grid: 
            Col 1: Hotline & Contact (3 cols)
            Col 2: Categories (2 cols)
            Col 3: Customer Care (3 cols)
            Col 4: Deals, Account, App & Social Connect (4 cols) 
        */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14"
          suppressHydrationWarning
        >
          {/* Column 1: Hotline, Questions & Address (3 cols on lg) */}
          <div
            className="lg:col-span-3 space-y-6 pr-0 lg:pr-4"
            suppressHydrationWarning
          >
            <LocalizedClientLink href="/" className="block w-fit">
              <Image
                src="/white.png"
                alt="Laptopzone"
                width={150}
                height={75}
                className="h-auto w-[150px] object-contain"
              />
            </LocalizedClientLink>

            {/* Hotline Box with Headphone Icon */}
            <div className="flex items-center gap-4 pt-1">
              <div className="text-primary shrink-0">
                <svg
                  className="w-11 h-11"
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
                  Got Questions? Call us!
                </span>
                <a
                  href="tel:+2638612600600"
                  className="block text-base font-bold text-white tracking-tight mt-0.5 hover:text-primary transition-colors"
                >
                  +263 8612 600 600
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-white font-bold text-xs tracking-wide">
                Contact Info
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                64 Ridgeway, Harare, Borrowdale, Zimbabwe
              </p>
            </div>
          </div>

          {/* Column 2: Product Categories (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4" suppressHydrationWarning>
            <h3 className="text-white font-bold text-sm tracking-wide">
              Categories
            </h3>
            <ul className="space-y-2.5 text-gray-400 pt-1">
              {topCategories.map((cat) => (
                <li key={cat.id}>
                  <LocalizedClientLink
                    href={getCategoryPublicPath(cat.handle)}
                    className="hover:text-white transition-colors block truncate"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4" suppressHydrationWarning>
            <h3 className="text-white font-bold text-sm tracking-wide">
              Customer Care
            </h3>

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
                  href="/contact-us"
                  className="hover:text-white transition-colors block"
                >
                  Customer Support
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/terms-and-conditions"
                  className="hover:text-white transition-colors block"
                >
                  Terms &amp; Conditions
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/privacy-policy"
                  className="hover:text-white transition-colors block"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/returns-and-refunds"
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
                  href="/delivery-terms"
                  className="hover:text-white transition-colors block"
                >
                  Shipping
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Deals, Account, App & Social Connect Box (4 cols on lg) */}
          <div className="lg:col-span-4" suppressHydrationWarning>
            <FooterDealsBox />
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
                src="/payment-methods.webp"
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
