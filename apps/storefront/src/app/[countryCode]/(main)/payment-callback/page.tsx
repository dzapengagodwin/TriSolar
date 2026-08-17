"use client"

import { placeOrder } from "@lib/data/cart"
import Spinner from "@modules/common/icons/spinner"
import Link from "next/link"
import { useSearchParams, useParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

export default function PaymentCallbackPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const countryCode = (params?.countryCode as string) || "us"

  const cartId = searchParams.get("cart_id") || searchParams.get("cartId") || undefined
  const status = searchParams.get("status")
  const urlError = searchParams.get("error")

  const [errorMessage, setErrorMessage] = useState<string | null>(urlError)
  const [isPending, startTransition] = useTransition()
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    // If status is explicit failure or cancelled
    if (
      status &&
      (status.toLowerCase() === "failed" ||
        status.toLowerCase() === "cancelled" ||
        status.toLowerCase() === "canceled")
    ) {
      setErrorMessage(`Payment was ${status.toLowerCase()}. Please try again.`)
      setAttempted(true)
      return
    }

    if (attempted) return

    setAttempted(true)
    startTransition(async () => {
      try {
        await placeOrder(cartId)
      } catch (err: unknown) {
        const redirectErr = err as { digest?: string; message?: string }
        // Next.js redirect thrown inside Server Action is expected
        if (redirectErr?.digest?.startsWith("NEXT_REDIRECT")) {
          return
        }
        setErrorMessage(
          redirectErr?.message || "Failed to finalize order after payment."
        )
      }
    })
  }, [status, cartId, attempted])

  const isFinalizing = isPending || (!errorMessage && !attempted)

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-lg text-center">
        {isFinalizing ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-primary flex items-center justify-center">
              <Spinner size="32" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Finalizing Your Order
            </h1>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              We are confirming your transaction with Pesepay and creating your order. Please do not close this window.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Payment Notification
            </h1>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              {errorMessage || "An issue occurred while finalizing your order."}
            </p>

            <div className="flex flex-col gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null)
                  setAttempted(false)
                }}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-full text-xs transition-all shadow-md"
              >
                Retry Finalization
              </button>
              <Link
                href={`/${countryCode}/checkout?step=payment`}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-full text-xs transition-all"
              >
                Return to Checkout
              </Link>
              <Link
                href={`/${countryCode}/cart`}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors pt-1"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
