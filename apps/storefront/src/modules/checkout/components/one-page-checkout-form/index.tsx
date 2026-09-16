"use client"

import React, { useState, useMemo, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { convertToLocale } from "@lib/util/money"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import {
  setShippingMethod,
  submitOnePageCheckout,
  CheckoutFormData,
} from "@lib/data/cart"
import {
  paymentInfoMap,
  isPesepay,
  isManual,
  isStripeLike,
} from "@lib/constants"
import {
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  transformLineItemToGA4Item,
} from "@lib/analytics/ecommerce"
import Input from "@modules/common/components/input"
import CountrySelect from "@modules/checkout/components/country-select"
import AddressSelect from "@modules/checkout/components/address-select"
import CheckboxWithLabel from "@modules/common/components/checkbox"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import { clx } from "@modules/common/components/ui"

type OnePageCheckoutFormProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  availableShippingMethods: HttpTypes.StoreCartShippingOption[]
  availablePaymentMethods: { id: string }[]
}

const OnePageCheckoutForm = ({
  cart,
  customer,
  availableShippingMethods,
  availablePaymentMethods,
}: OnePageCheckoutFormProps) => {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Active payment session on cart if any
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // Default selections
  const defaultShippingId =
    cart.shipping_methods?.at(-1)?.shipping_option_id ||
    availableShippingMethods[0]?.id ||
    ""

  const defaultPaymentId =
    activeSession?.provider_id ||
    availablePaymentMethods[0]?.id ||
    ""

  // Form states: Shipping address & Contact
  const [email, setEmail] = useState(cart.email || customer?.email || "")
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart.shipping_address?.first_name || "",
    "shipping_address.last_name": cart.shipping_address?.last_name || "",
    "shipping_address.address_1": cart.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart.shipping_address?.address_2 || "",
    "shipping_address.company": cart.shipping_address?.company || "",
    "shipping_address.postal_code": cart.shipping_address?.postal_code || "",
    "shipping_address.city": cart.shipping_address?.city || "",
    "shipping_address.country_code":
      cart.shipping_address?.country_code ||
      cart.region?.countries?.[0]?.iso_2 ||
      "zw",
    "shipping_address.province": cart.shipping_address?.province || "",
    "shipping_address.phone": cart.shipping_address?.phone || "",
  })

  // Same as billing toggle
  const [sameAsBilling, setSameAsBilling] = useState(true)

  // Form states: Billing address
  const [billingFormData, setBillingFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart.billing_address?.first_name || "",
    "billing_address.last_name": cart.billing_address?.last_name || "",
    "billing_address.address_1": cart.billing_address?.address_1 || "",
    "billing_address.address_2": cart.billing_address?.address_2 || "",
    "billing_address.company": cart.billing_address?.company || "",
    "billing_address.postal_code": cart.billing_address?.postal_code || "",
    "billing_address.city": cart.billing_address?.city || "",
    "billing_address.country_code":
      cart.billing_address?.country_code ||
      cart.region?.countries?.[0]?.iso_2 ||
      "zw",
    "billing_address.province": cart.billing_address?.province || "",
    "billing_address.phone": cart.billing_address?.phone || "",
  })

  // Selected delivery & payment
  const [shippingMethodId, setShippingMethodId] = useState<string>(defaultShippingId)
  const [paymentProviderId, setPaymentProviderId] = useState<string>(defaultPaymentId)

  // Status & validation states
  const [submitting, setSubmitting] = useState(false)
  const [updatingShipping, setUpdatingShipping] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Calculated shipping prices
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})

  // Track GA4 begin_checkout event once on mount
  const hasTrackedBeginCheckout = useRef(false)
  useEffect(() => {
    if (!hasTrackedBeginCheckout.current && cart?.items?.length) {
      const items = cart.items.map((item) => transformLineItemToGA4Item(item))
      trackBeginCheckout({
        items,
        total: cart.total ?? 0,
        currency: cart.currency_code?.toUpperCase() || "USD",
      })
      hasTrackedBeginCheckout.current = true
    }
  }, [cart])

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  // Fetch dynamic/calculated shipping prices
  useEffect(() => {
    const calculatedMethods = availableShippingMethods.filter(
      (sm) => sm.price_type === "calculated"
    )
    if (calculatedMethods.length) {
      const promises = calculatedMethods.map((sm) =>
        calculatePriceForShippingOption(sm.id, cart.id)
      )
      Promise.allSettled(promises).then((res) => {
        const prices: Record<string, number> = {}
        res
          .filter((r) => r.status === "fulfilled")
          .forEach((p) => {
            if (p.value?.id) {
              prices[p.value.id] = p.value.amount ?? 0
            }
          })
        setCalculatedPricesMap(prices)
      })
    }
  }, [availableShippingMethods, cart.id])

  // Handle address input changes
  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setBillingFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  // Handle saved address quick selection
  const handleSavedAddressSelect = (
    savedAddress?: HttpTypes.StoreCartAddress
  ) => {
    if (savedAddress) {
      setFormData((prev) => ({
        ...prev,
        "shipping_address.first_name": savedAddress.first_name || "",
        "shipping_address.last_name": savedAddress.last_name || "",
        "shipping_address.address_1": savedAddress.address_1 || "",
        "shipping_address.address_2": savedAddress.address_2 || "",
        "shipping_address.company": savedAddress.company || "",
        "shipping_address.postal_code": savedAddress.postal_code || "",
        "shipping_address.city": savedAddress.city || "",
        "shipping_address.country_code": savedAddress.country_code || prev["shipping_address.country_code"],
        "shipping_address.province": savedAddress.province || "",
        "shipping_address.phone": savedAddress.phone || "",
      }))
      setFieldErrors({})
    }
  }

  // Handle shipping method selection with background cart update
  const handleSelectShippingMethod = async (id: string) => {
    setShippingMethodId(id)
    if (fieldErrors["shipping_method_id"]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy["shipping_method_id"]
        return copy
      })
    }

    const selectedOption = availableShippingMethods.find((sm) => sm.id === id)
    if (cart.items?.length) {
      trackAddShippingInfo({
        items: cart.items.map((item) => transformLineItemToGA4Item(item)),
        total: cart.total ?? 0,
        currency: cart.currency_code?.toUpperCase() || "USD",
        shippingTier: selectedOption?.name || id,
      })
    }

    setUpdatingShipping(true)
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      console.warn("Could not pre-set shipping method:", err)
    } finally {
      setUpdatingShipping(false)
    }
  }

  // Handle payment method selection
  const handleSelectPaymentMethod = (providerId: string) => {
    setPaymentProviderId(providerId)
    if (fieldErrors["payment_provider_id"]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy["payment_provider_id"]
        return copy
      })
    }

    if (cart.items?.length) {
      const paymentTitle = paymentInfoMap[providerId]?.title || providerId
      trackAddPaymentInfo({
        items: cart.items.map((item) => transformLineItemToGA4Item(item)),
        total: cart.total ?? 0,
        currency: cart.currency_code?.toUpperCase() || "USD",
        paymentType: paymentTitle,
      })
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors["email"] = "Please enter a valid email address."
    }

    if (!formData["shipping_address.first_name"]?.trim()) {
      errors["shipping_address.first_name"] = "First name is required."
    }

    if (!formData["shipping_address.last_name"]?.trim()) {
      errors["shipping_address.last_name"] = "Last name is required."
    }

    if (!formData["shipping_address.address_1"]?.trim()) {
      errors["shipping_address.address_1"] = "Street address is required."
    }

    if (!formData["shipping_address.city"]?.trim()) {
      errors["shipping_address.city"] = "City is required."
    }

    if (!formData["shipping_address.country_code"]?.trim()) {
      errors["shipping_address.country_code"] = "Country is required."
    }

    if (!formData["shipping_address.phone"]?.trim()) {
      errors["shipping_address.phone"] = "Phone number is required for delivery contact."
    }

    if (!sameAsBilling) {
      if (!billingFormData["billing_address.first_name"]?.trim()) {
        errors["billing_address.first_name"] = "Billing first name is required."
      }
      if (!billingFormData["billing_address.last_name"]?.trim()) {
        errors["billing_address.last_name"] = "Billing last name is required."
      }
      if (!billingFormData["billing_address.address_1"]?.trim()) {
        errors["billing_address.address_1"] = "Billing street address is required."
      }
      if (!billingFormData["billing_address.city"]?.trim()) {
        errors["billing_address.city"] = "Billing city is required."
      }
    }

    if (!shippingMethodId) {
      errors["shipping_method_id"] = "Please select a delivery method."
    }

    if (!paymentProviderId) {
      errors["payment_provider_id"] = "Please select a payment method."
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please complete all required fields highlighted in red below.")
      const firstErrorKey = Object.keys(errors)[0]
      const el = document.querySelector(`[name="${firstErrorKey}"]`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return false
    }

    setErrorMessage(null)
    return true
  }

  // Unified submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const payload: CheckoutFormData = {
      email: email.trim(),
      shipping_address: {
        first_name: formData["shipping_address.first_name"],
        last_name: formData["shipping_address.last_name"],
        address_1: formData["shipping_address.address_1"],
        address_2: formData["shipping_address.address_2"] || "",
        company: formData["shipping_address.company"] || "",
        postal_code: formData["shipping_address.postal_code"] || "",
        city: formData["shipping_address.city"],
        country_code: formData["shipping_address.country_code"],
        province: formData["shipping_address.province"] || "",
        phone: formData["shipping_address.phone"],
      },
      same_as_billing: sameAsBilling,
      billing_address: sameAsBilling
        ? undefined
        : {
            first_name: billingFormData["billing_address.first_name"],
            last_name: billingFormData["billing_address.last_name"],
            address_1: billingFormData["billing_address.address_1"],
            address_2: billingFormData["billing_address.address_2"] || "",
            company: billingFormData["billing_address.company"] || "",
            postal_code: billingFormData["billing_address.postal_code"] || "",
            city: billingFormData["billing_address.city"],
            country_code: billingFormData["billing_address.country_code"],
            province: billingFormData["billing_address.province"] || "",
            phone: billingFormData["billing_address.phone"] || formData["shipping_address.phone"],
          },
      shipping_method_id: shippingMethodId,
      payment_provider_id: paymentProviderId,
    }

    try {
      const result = await submitOnePageCheckout(payload)

      if (result.error) {
        setErrorMessage(result.error)
        setSubmitting(false)
        return
      }

      // Handle Stripe confirmation if ever configured
      if (result.requiresStripeConfirm) {
        setErrorMessage("Direct card processing is currently unavailable. Please select Pesepay or Pay on Collection.")
        setSubmitting(false)
        return
      }

      // Handle Pesepay or Order Confirmed redirect
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
        return
      }

      // Fallback
      router.refresh()
    } catch (err: unknown) {
      console.error("Order submission failed:", err)
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again."
      setErrorMessage(msg)
      setSubmitting(false)
    }
  }

  // Dynamic submit button label based on payment method
  const getSubmitButtonLabel = () => {
    if (submitting) {
      if (isPesepay(paymentProviderId)) return "Connecting to Pesepay..."
      return "Processing Your Order..."
    }

    if (isPesepay(paymentProviderId)) {
      return "Pay with Pesepay →"
    }

    if (isManual(paymentProviderId) || paymentProviderId === "pp_system_default") {
      return "Place Order (Pay on Collection) →"
    }

    if (isStripeLike(paymentProviderId)) {
      return "Pay with Card →"
    }

    return "Place Order Now →"
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-8">
      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <svg
            className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <div className="text-sm font-medium leading-relaxed">
            {errorMessage}
          </div>
        </div>
      )}

      {/* SECTION 1: Contact & Shipping Address */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-x-3">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </span>
            <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
              Customer & Shipping Details
            </h2>
          </div>
        </div>

        {/* Quick select saved customer address if logged in */}
        {customer && (addressesInRegion?.length || 0) > 0 && (
          <div className="mb-6 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-2">
              Saved Delivery Addresses:
            </span>
            <AddressSelect
              addresses={customer.addresses}
              addressInput={cart.shipping_address}
              onSelect={handleSavedAddressSelect}
            />
          </div>
        )}

        <div className="space-y-4">
          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors["email"]) {
                    setFieldErrors((prev) => {
                      const copy = { ...prev }
                      delete copy["email"]
                      return copy
                    })
                  }
                }}
                required
              />
              {fieldErrors["email"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["email"]}
                </span>
              )}
            </div>
            <div>
              <Input
                label="Phone Number"
                name="shipping_address.phone"
                autoComplete="tel"
                value={formData["shipping_address.phone"]}
                onChange={handleShippingChange}
                required
              />
              {fieldErrors["shipping_address.phone"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["shipping_address.phone"]}
                </span>
              )}
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                name="shipping_address.first_name"
                autoComplete="given-name"
                value={formData["shipping_address.first_name"]}
                onChange={handleShippingChange}
                required
              />
              {fieldErrors["shipping_address.first_name"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["shipping_address.first_name"]}
                </span>
              )}
            </div>
            <div>
              <Input
                label="Last Name"
                name="shipping_address.last_name"
                autoComplete="family-name"
                value={formData["shipping_address.last_name"]}
                onChange={handleShippingChange}
                required
              />
              {fieldErrors["shipping_address.last_name"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["shipping_address.last_name"]}
                </span>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Street Address (Line 1)"
                name="shipping_address.address_1"
                autoComplete="address-line1"
                value={formData["shipping_address.address_1"]}
                onChange={handleShippingChange}
                required
              />
              {fieldErrors["shipping_address.address_1"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["shipping_address.address_1"]}
                </span>
              )}
            </div>
          </div>

          {/* Address Line 2 & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Apartment, suite, unit (optional)"
              name="shipping_address.address_2"
              autoComplete="address-line2"
              value={formData["shipping_address.address_2"]}
              onChange={handleShippingChange}
            />
            <Input
              label="Company (optional)"
              name="shipping_address.company"
              autoComplete="organization"
              value={formData["shipping_address.company"]}
              onChange={handleShippingChange}
            />
          </div>

          {/* City, Province, Postal Code, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="City / Town"
                name="shipping_address.city"
                autoComplete="address-level2"
                value={formData["shipping_address.city"]}
                onChange={handleShippingChange}
                required
              />
              {fieldErrors["shipping_address.city"] && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                  {fieldErrors["shipping_address.city"]}
                </span>
              )}
            </div>
            <div>
              <Input
                label="State / Province"
                name="shipping_address.province"
                autoComplete="address-level1"
                value={formData["shipping_address.province"]}
                onChange={handleShippingChange}
              />
            </div>
            <div>
              <CountrySelect
                name="shipping_address.country_code"
                autoComplete="country"
                region={cart?.region}
                value={formData["shipping_address.country_code"]}
                onChange={handleShippingChange}
                required
              />
            </div>
          </div>

          {/* Same as Billing Checkbox */}
          <div className="pt-2">
            <CheckboxWithLabel
              label="Billing address same as shipping address"
              name="same_as_billing"
              checked={sameAsBilling}
              onChange={() => setSameAsBilling(!sameAsBilling)}
            />
          </div>

          {/* Optional Billing Address Section */}
          {!sameAsBilling && (
            <div className="pt-4 border-t border-gray-100 mt-4 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-md font-bold text-black">
                Billing Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="billing_address.first_name"
                  value={billingFormData["billing_address.first_name"]}
                  onChange={handleBillingChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="billing_address.last_name"
                  value={billingFormData["billing_address.last_name"]}
                  onChange={handleBillingChange}
                  required
                />
              </div>
              <Input
                label="Billing Address"
                name="billing_address.address_1"
                value={billingFormData["billing_address.address_1"]}
                onChange={handleBillingChange}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="billing_address.city"
                  value={billingFormData["billing_address.city"]}
                  onChange={handleBillingChange}
                  required
                />
                <CountrySelect
                  name="billing_address.country_code"
                  region={cart?.region}
                  value={billingFormData["billing_address.country_code"]}
                  onChange={handleBillingChange}
                  required
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Delivery / Shipping Method */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-x-3">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </span>
            <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
              Delivery Method
              {updatingShipping && <Spinner size="16" />}
            </h2>
          </div>
        </div>

        {availableShippingMethods.length === 0 ? (
          <div className="p-5 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No shipping options available for this destination.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {availableShippingMethods.map((option) => {
              const isSelected = option.id === shippingMethodId
              const calculatedPrice = calculatedPricesMap[option.id]
              const price =
                option.price_type === "flat"
                  ? option.amount ?? 0
                  : calculatedPrice ?? option.amount ?? 0

              const formattedPrice =
                price === 0
                  ? "Free"
                  : convertToLocale({
                      amount: price,
                      currency_code: cart.currency_code,
                    })

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectShippingMethod(option.id)}
                  className={clx(
                    "relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white"
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-black block">
                        {option.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Reliable courier delivery to your address
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-black">
                    {formattedPrice}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {fieldErrors["shipping_method_id"] && (
          <span className="text-xs text-rose-600 font-semibold mt-2 block">
            {fieldErrors["shipping_method_id"]}
          </span>
        )}
      </div>

      {/* SECTION 3: Payment Method */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-x-3">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </span>
            <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
              Payment Method
            </h2>
          </div>
        </div>

        {availablePaymentMethods.length === 0 ? (
          <div className="p-5 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No payment methods available for this region.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {availablePaymentMethods.map((pm) => {
              const isSelected = pm.id === paymentProviderId
              const info = paymentInfoMap[pm.id] || {
                title: pm.id.replace(/^pp_/, "").replace(/_/g, " ").toUpperCase(),
                icon: <CreditCard />,
              }

              return (
                <div
                  key={pm.id}
                  onClick={() => handleSelectPaymentMethod(pm.id)}
                  className={clx(
                    "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={clx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-black block">
                          {info.title}
                        </span>
                        {isPesepay(pm.id) && (
                          <span className="text-xs text-gray-500">
                            EcoCash, OneMoney, Visa, Mastercard, Innbucks & Zimswitch
                          </span>
                        )}
                        {(isManual(pm.id) || pm.id === "pp_system_default") && (
                          <span className="text-xs text-gray-500">
                            Pay with cash or swipe on pickup / courier delivery
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {info.icon}
                    </div>
                  </div>

                  {/* Pesepay Info Box when selected */}
                  {isSelected && isPesepay(pm.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs text-gray-600 bg-white/60 p-3 rounded-lg flex items-center gap-2">
                      <CheckCircleSolid className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        You will be securely redirected to Pesepay to complete your payment with EcoCash, OneMoney, or Card.
                      </span>
                    </div>
                  )}

                  {/* Pay On Collection Info Box when selected */}
                  {isSelected && (isManual(pm.id) || pm.id === "pp_system_default") && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs text-gray-600 bg-white/60 p-3 rounded-lg flex items-center gap-2">
                      <CheckCircleSolid className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Your order will be confirmed immediately. Payment is collected upon delivery or collection.
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {fieldErrors["payment_provider_id"] && (
          <span className="text-xs text-rose-600 font-semibold mt-2 block">
            {fieldErrors["payment_provider_id"]}
          </span>
        )}
      </div>

      {/* SECTION 4: Order Submission */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
          By clicking <span className="font-bold text-black">{getSubmitButtonLabel()}</span>, you confirm that you accept our{" "}
          <LocalizedClientLink href="/terms" target="_blank" className="underline text-gray-900 font-semibold hover:text-primary">
            Terms &amp; Conditions
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/returns" target="_blank" className="underline text-gray-900 font-semibold hover:text-primary">
            Returns Policy
          </LocalizedClientLink>
          , and acknowledge Laptopzone&apos;s{" "}
          <LocalizedClientLink href="/privacy" target="_blank" className="underline text-gray-900 font-semibold hover:text-primary">
            Privacy Policy
          </LocalizedClientLink>
          .
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-4 px-8 rounded-full text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Spinner size="18" />
              <span>{getSubmitButtonLabel()}</span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              {getSubmitButtonLabel()}
            </span>
          )}
        </button>
      </div>
    </form>
  )
}

export default OnePageCheckoutForm

