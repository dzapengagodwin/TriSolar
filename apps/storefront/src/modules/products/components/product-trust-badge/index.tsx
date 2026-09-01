import Image from "next/image"

export default function ProductTrustBadge() {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
      {/* 1. Free Delivery Banner */}
      <p className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug">
        Free Nationwide Delivery 🚚 on all orders over USD $ 500.00
      </p>

      {/* 2. Key Guarantee Checklist */}
      <div className="space-y-2 text-xs sm:text-sm text-gray-800 font-medium">
        <div className="flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-gray-800 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>14 days easy returns</span>
        </div>

        <div className="flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-gray-800 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Order yours before 11.30pm for same day dispatch</span>
        </div>
      </div>

      {/* 3. Guaranteed Safe Checkout Divider & Payment Badges */}
      <div className="pt-2">
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-gray-200 absolute" />
          <span className="relative bg-white px-3 text-xs sm:text-sm font-bold text-gray-900">
            Guaranteed Safe Checkout
          </span>
        </div>

        <div className="border border-gray-200 bg-white rounded-lg p-3 sm:p-4 flex items-center justify-center shadow-2xs">
          <Image
            src="/payment-methods.png"
            alt="Guaranteed Safe Checkout - Visa, Mastercard, ZimSwitch, EcoCash, InnBucks"
            width={400}
            height={50}
            className="w-full max-w-[360px] h-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}
