"use client"

import { isManual, isPesepay, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import Spinner from "@modules/common/icons/spinner"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isPesepay(paymentSession?.provider_id):
      return (
        <PesepayPaymentButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return (
        <button
          disabled
          className="w-full bg-gray-200 text-gray-400 font-bold py-3.5 px-6 rounded-full text-sm cursor-not-allowed"
        >
          Select a payment method
        </button>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <button
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        data-testid={dataTestId}
        className="w-full bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold py-3.5 px-6 rounded-full text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Spinner size="16" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <span>Place Order Now ⚡</span>
          </>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const PesepayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const paymentSession = cart.payment_collection?.payment_sessions?.[0]
  const sessionData = paymentSession?.data as Record<string, unknown> | undefined
  const redirectUrl =
    (sessionData?.redirectUrl as string | undefined) ??
    (sessionData?.redirect_url as string | undefined) ??
    (sessionData?.payment_url as string | undefined) ??
    undefined

  // Validate redirect URL to prevent open redirect attacks while allowing all Pesepay endpoints
  const isValidRedirectUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== "string") return false
    try {
      const parsedUrl = new URL(url)
      const isHttp =
        parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:"
      const isPesepay =
        parsedUrl.hostname.endsWith("pesepay.com") ||
        parsedUrl.hostname.includes("pesepay") ||
        parsedUrl.hostname === "localhost"
      return isHttp && isPesepay
    } catch {
      return false
    }
  }

  const handlePayment = async () => {
    setSubmitting(true)

    if (!redirectUrl) {
      setErrorMessage(
        "Payment session not initialized. Please re-select payment method or refresh the page."
      )
      setSubmitting(false)
      return
    }

    if (!isValidRedirectUrl(redirectUrl)) {
      console.warn("Pesepay redirect URL rejected:", redirectUrl)
      setErrorMessage(
        `Invalid payment redirect URL (${redirectUrl}). Please contact support.`
      )
      setSubmitting(false)
      return
    }

    // Redirect to Pesepay's hosted checkout page for customer payment
    window.location.href = redirectUrl
  }

  const isButtonDisabled = notReady || submitting || !redirectUrl

  return (
    <>
      <button
        disabled={isButtonDisabled}
        onClick={handlePayment}
        data-testid={dataTestId}
        className="w-full bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold py-3.5 px-6 rounded-full text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Spinner size="16" />
            <span>Redirecting to Pesepay...</span>
          </>
        ) : !redirectUrl ? (
          <>
            <Spinner size="16" />
            <span>Initializing Pesepay...</span>
          </>
        ) : (
          <span>Pay with Pesepay</span>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="pesepay-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <button
        disabled={notReady || submitting}
        onClick={handlePayment}
        data-testid="submit-order-button"
        className="w-full bg-[#FF9F0D] hover:bg-[#E58B00] text-white font-bold py-3.5 px-6 rounded-full text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Spinner size="16" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <span>Place Order Now ⚡</span>
          </>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
