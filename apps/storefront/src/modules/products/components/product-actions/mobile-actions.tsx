import { Dialog, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { Button, clx } from "@modules/common/components/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import useToggleState from "@lib/hooks/use-toggle-state"
import OptionSelect from "./option-select"
import React, { Fragment, useMemo } from "react"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  optionGroups: HttpTypes.StoreProductOption[]
  options: Record<string, string | undefined>
  variantUnavailable: boolean
  updateOptions: (optionId: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  optionGroups,
  options,
  variantUnavailable,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }

    const { variantPrice, cheapestPrice } = price
    return variantPrice || cheapestPrice || null
  }, [price])

  const getSelectedOptionValue = (optionId: string) =>
    variant?.options?.find(
      (variantOption) => variantOption.option_id === optionId
    )?.value ?? options[optionId]

  const selectedOptionSummary = optionGroups
    .map((option) => getSelectedOptionValue(option.id))
    .filter((value): value is string => Boolean(value))
    .join(" / ")

  const variantSummary = optionGroups
    .map((option) => {
      const value = getSelectedOptionValue(option.id)
      return value ? `${option.title}: ${value}` : null
    })
    .filter((value): value is string => Boolean(value))
    .join(", ")

  const isSimple = optionGroups.length === 0

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-white flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full border-t border-gray-200"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2">
              <span data-testid="mobile-title">
                {variantSummary
                  ? `${product.title} - ${variantSummary}`
                  : product.title}
              </span>
              <span>—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2 text-ui-fg-base">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="line-through text-small-regular">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-ui-fg-interactive":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : null}
            </div>

            <div
              className={clx("grid grid-cols-2 w-full gap-x-4", {
                "!grid-cols-1": isSimple,
              })}
            >
              {!isSimple && (
                <Button
                  onClick={open}
                  variant="secondary"
                  className="w-full"
                  data-testid="mobile-actions-button"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{selectedOptionSummary || "Select Options"}</span>
                    <ChevronDown />
                  </div>
                </Button>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                variant="secondary"
                className="w-full border-2 border-[#F9501F] text-[#F9501F] hover:bg-orange-50 disabled:opacity-100"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? variantUnavailable
                    ? "Unavailable"
                    : "Select variant"
                  : !inStock
                  ? "Out of stock"
                  : "Add to cart"}
              </Button>
            </div>
          </div>
        </Transition>
      </div>

      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-white w-12 h-12 rounded-full text-ui-fg-base flex justify-center items-center"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>

                  <div className="bg-white px-6 py-12">
                    {optionGroups.length > 0 && (
                      <div className="flex flex-col gap-y-6">
                        {optionGroups.map((option) => (
                          <div key={option.id}>
                            <OptionSelect
                              option={option}
                              current={getSelectedOptionValue(option.id)}
                              updateOption={updateOptions}
                              title={option.title ?? ""}
                              variants={product.variants}
                              disabled={optionsDisabled}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions