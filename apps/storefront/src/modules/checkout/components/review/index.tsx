"use client"

import { clx } from "@modules/common/components/ui"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-x-3">
          <span className="w-8 h-8 rounded-full bg-[#FF9F0D] text-white flex items-center justify-center font-bold text-xs">
            4
          </span>
          <h2
            className={clx(
              "text-xl font-black text-black tracking-tight flex items-center gap-2",
              {
                "opacity-50 pointer-events-none select-none": !isOpen,
              }
            )}
          >
            Order Review
          </h2>
        </div>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-700 leading-relaxed">
              By clicking <span className="font-bold text-black">Place Order</span>, you confirm that you accept our Terms of Sale and Returns Policy, and acknowledge NexCart&apos;s Privacy Policy.
            </p>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
