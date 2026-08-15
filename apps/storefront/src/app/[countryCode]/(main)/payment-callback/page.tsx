import { placeOrder } from "@lib/data/cart"
import Link from "next/link"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ referenceNumber?: string; status?: string; error?: string }>
}

export default async function PaymentCallbackPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const countryCode = params.countryCode || "us"

  let errorMessage: string | null = searchParams.error || null

  // If status is explicit failure or cancelled
  if (
    searchParams.status &&
    (searchParams.status.toLowerCase() === "failed" ||
      searchParams.status.toLowerCase() === "cancelled" ||
      searchParams.status.toLowerCase() === "canceled")
  ) {
    errorMessage = `Payment was ${searchParams.status.toLowerCase()}. Please try again.`
  }

  // Attempt to complete order if not in explicit failed state
  if (!errorMessage) {
    try {
      await placeOrder()
      // placeOrder internally redirects to /${countryCode}/order/${orderId}/confirmed on success
    } catch (err: unknown) {
      const redirectErr = err as { digest?: string; message?: string }
      // If error is a redirect from Next.js, let it throw
      if (redirectErr?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err
      }
      errorMessage = redirectErr?.message || "Failed to finalize order after payment."
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Payment Finalization
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {errorMessage || "We are processing your payment verification..."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/${countryCode}/checkout?step=payment`}
            className="w-full bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold py-3 px-6 rounded-full text-sm transition-all"
          >
            Return to Checkout
          </Link>
          <Link
            href={`/${countryCode}/cart`}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  )
}
