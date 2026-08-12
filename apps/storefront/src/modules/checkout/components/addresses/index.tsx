"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-x-3">
          <span className="w-8 h-8 rounded-full bg-[#FF9F0D] text-white flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
            Shipping Address
            {!isOpen && <CheckCircleSolid className="text-emerald-500 w-5 h-5" />}
          </h2>
        </div>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="text-xs font-bold text-black hover:text-[#FF9F0D] underline transition-colors"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>

      {isOpen ? (
        <form action={formAction}>
          <div className="pb-4">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <h3 className="text-lg font-bold text-black pb-4 pt-6">
                  Billing address
                </h3>
                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6 w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-full transition-colors" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-xs text-gray-700">
            {cart && cart.shipping_address ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/70 p-5 rounded-xl border border-gray-100">
                <div className="flex flex-col" data-testid="shipping-address-summary">
                  <span className="font-bold text-black mb-1">Shipping Address</span>
                  <span>{cart.shipping_address.first_name} {cart.shipping_address.last_name}</span>
                  <span>{cart.shipping_address.address_1} {cart.shipping_address.address_2}</span>
                  <span>{cart.shipping_address.postal_code}, {cart.shipping_address.city}</span>
                  <span className="uppercase font-semibold text-gray-500">{cart.shipping_address.country_code}</span>
                </div>

                <div className="flex flex-col" data-testid="shipping-contact-summary">
                  <span className="font-bold text-black mb-1">Contact</span>
                  <span>{cart.shipping_address.phone}</span>
                  <span>{cart.email}</span>
                </div>

                <div className="flex flex-col" data-testid="billing-address-summary">
                  <span className="font-bold text-black mb-1">Billing Address</span>
                  {sameAsBilling ? (
                    <span className="text-gray-500 italic">Same as shipping address</span>
                  ) : (
                    <>
                      <span>{cart.billing_address?.first_name} {cart.billing_address?.last_name}</span>
                      <span>{cart.billing_address?.address_1} {cart.billing_address?.address_2}</span>
                      <span>{cart.billing_address?.postal_code}, {cart.billing_address?.city}</span>
                      <span className="uppercase font-semibold text-gray-500">{cart.billing_address?.country_code}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses
