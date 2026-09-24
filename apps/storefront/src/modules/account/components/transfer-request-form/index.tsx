"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { Heading, IconButton, Input, Text } from "@modules/common/components/ui"
import { useActionState } from "react"
// TODO: Re-add Toaster component when needed
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 sm:p-5 flex flex-col gap-y-3.5 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-6 gap-y-3.5 w-full">
        <div className="flex flex-col gap-y-1">
          <Heading level="h3" className="!text-sm font-semibold text-gray-900">
            Order transfers
          </Heading>
          <p className="text-xs text-gray-500 leading-relaxed">
            Missing an order placed before creating this account? Connect an order to your profile using its Order ID.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-2 sm:items-end"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <Input
              className="w-full bg-white text-xs"
              name="order_id"
              placeholder="e.g. order_01..."
            />
            <SubmitButton
              variant="secondary"
              size="small"
              className="w-full sm:w-auto text-xs font-medium py-1.5 px-3.5 rounded-lg whitespace-nowrap cursor-pointer"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-base-regular text-rose-500 text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-neutral-50 shadow-borders-base w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <Text className="text-sm font-semibold text-neutral-950">
                Transfer for order {state.order?.id} requested
              </Text>
              <Text className="text-base-regular text-neutral-600">
                Transfer request email sent to {state.order?.email}
              </Text>
            </div>
          </div>
          <IconButton
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4 text-neutral-500" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
