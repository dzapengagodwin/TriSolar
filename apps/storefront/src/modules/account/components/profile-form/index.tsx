"use client"

import React, { useActionState, useMemo } from "react"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { Button } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { updateProfile } from "@lib/data/customer"

type ProfileFormProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const ProfileForm: React.FC<ProfileFormProps> = ({ customer, regions }) => {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    error: null,
    success: false,
  })

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  const regionOptions = useMemo(() => {
    return (
      regions
        ?.map((region) => {
          return region.countries?.map((country) => ({
            value: country.iso_2,
            label: country.display_name,
          }))
        })
        .flat() || []
    )
  }, [regions])

  return (
    <form action={formAction} className="w-full space-y-6">
      <input
        type="hidden"
        name="billing_address_id"
        value={billingAddress?.id || ""}
      />

      {/* Feedback Messages */}
      {state.success && (
        <div
          role="status"
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all shadow-2xs"
          data-testid="profile-success-message"
        >
          <svg
            className="w-5 h-5 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all shadow-2xs"
          data-testid="profile-error-message"
        >
          <svg
            className="w-5 h-5 text-rose-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* 1. Personal Details Section */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your name and primary contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            required
            defaultValue={customer.first_name ?? ""}
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            defaultValue={customer.last_name ?? ""}
            data-testid="last-name-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Email address"
              name="email"
              type="email"
              defaultValue={customer.email ?? ""}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
              data-testid="email-input"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Email is tied to your login account and cannot be modified.
            </p>
          </div>
          <div>
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={customer.phone ?? ""}
              data-testid="phone-input"
            />
          </div>
        </div>
      </div>

      {/* 2. Default Billing Address Section */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            Default Billing Address
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Used by default during checkout and invoicing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Recipient first name"
            name="billing_first_name"
            defaultValue={
              billingAddress?.first_name || customer.first_name || ""
            }
            data-testid="billing-first-name-input"
          />
          <Input
            label="Recipient last name"
            name="billing_last_name"
            defaultValue={
              billingAddress?.last_name || customer.last_name || ""
            }
            data-testid="billing-last-name-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company (Optional)"
            name="billing_company"
            defaultValue={billingAddress?.company || ""}
            data-testid="billing-company-input"
          />
          <Input
            label="Billing phone (Optional)"
            name="billing_phone"
            type="tel"
            defaultValue={billingAddress?.phone || customer.phone || ""}
            data-testid="billing-phone-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Address line 1"
            name="billing_address_1"
            defaultValue={billingAddress?.address_1 || ""}
            data-testid="billing-address-1-input"
          />
          <Input
            label="Apartment, suite, etc. (Optional)"
            name="billing_address_2"
            defaultValue={billingAddress?.address_2 || ""}
            data-testid="billing-address-2-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="City"
            name="billing_city"
            defaultValue={billingAddress?.city || ""}
            data-testid="billing-city-input"
          />
          <Input
            label="State / Province"
            name="billing_province"
            defaultValue={billingAddress?.province || ""}
            data-testid="billing-province-input"
          />
          <Input
            label="Postal code"
            name="billing_postal_code"
            defaultValue={billingAddress?.postal_code || ""}
            data-testid="billing-postal-code-input"
          />
          <div className="flex flex-col">
            <NativeSelect
              name="billing_country_code"
              defaultValue={billingAddress?.country_code || undefined}
              data-testid="billing-country-code-select"
            >
              <option value="">Select country...</option>
              {regionOptions.map((option, i) => (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Bar with ONE Save Changes Button */}
      <div className="flex items-center justify-end pt-2">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold py-3 px-8 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          data-testid="save-profile-button"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

export default ProfileForm
