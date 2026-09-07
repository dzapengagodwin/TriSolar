import Image from "next/image"

export default function ProductTrustBadge() {
  return (
    <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
      {/* 1. Free Delivery Banner */}
      <p className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug flex items-center gap-2">
        <span>Free Nationwide Delivery</span>
        <svg className="w-5 h-5 text-gray-700 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
        <span>on all orders over USD $ 500.00</span>
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
