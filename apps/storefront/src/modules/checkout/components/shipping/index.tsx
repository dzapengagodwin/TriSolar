"use client"
import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import MedusaRadio from "@modules/common/components/radio"
import { Button, clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function _formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as { service_zone?: { fulfillment_set?: { type?: string; location?: { address: HttpTypes.StoreCartAddress } } } }).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as { service_zone?: { fulfillment_set?: { type?: string; location?: { address: HttpTypes.StoreCartAddress } } } }).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              if (p.value?.id) {
                pricesMap[p.value.id] = p.value.amount ?? 0
              }
            })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  useEffect(() => {
    if (!isOpen || isLoading || shippingMethodId || isLoadingPrices) {
      return
    }

    const validShippingMethods = _shippingMethods?.filter((method) => {
      if (method.insufficient_inventory) {
        return false
      }

      return (
        method.price_type === "flat" ||
        typeof calculatedPricesMap[method.id] === "number"
      )
    })

    if (validShippingMethods?.length === 1) {
      void handleSetShippingMethod(validShippingMethods[0].id, "shipping")
    }
  }, [
    calculatedPricesMap,
    isLoading,
    isLoadingPrices,
    isOpen,
    shippingMethodId,
  ])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      if (isOpen) {
        router.push(pathname + "?step=payment", { scroll: false })
      }
    } catch (err) {
      setShippingMethodId(currentId)

      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-x-3">
          <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2
            className={clx(
              "text-xl font-black text-black tracking-tight flex items-center gap-2",
              {
                "opacity-50 pointer-events-none select-none":
                  !isOpen && cart.shipping_methods?.length === 0,
              }
            )}
          >
            Delivery Method
            {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
              <CheckCircleSolid className="text-emerald-500 w-5 h-5" />
            )}
          </h2>
        </div>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <button
              onClick={handleEdit}
              className="text-xs font-bold text-black hover:text-primary underline transition-colors"
              data-testid="edit-delivery-button"
            >
              Edit
            </button>
          )}
      </div>

      {isOpen ? (
        <>
          <div className="grid gap-y-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700">
                Shipping method
              </span>
              <span className="text-xs text-gray-500">
                Select your preferred delivery option
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-4">
                {hasPickupOptions && (
                  <RadioGroup
                    value={showPickupOptions}
                    onChange={(_value) => {
                      const id = _pickupMethods.find(
                        (option) => !option.insufficient_inventory
                      )?.id

                      if (id) {
                        handleSetShippingMethod(id, "pickup")
                      }
                    }}
                  >
                    <Radio
                      value={PICKUP_OPTION_ON}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-xs font-medium cursor-pointer py-3.5 border rounded-xl px-5 mb-3 transition-colors",
                        {
                          "border-black bg-gray-50 ring-1 ring-black":
                            showPickupOptions === PICKUP_OPTION_ON,
                          "border-gray-200 hover:border-gray-300":
                            showPickupOptions !== PICKUP_OPTION_ON,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-3">
                        <MedusaRadio
                          checked={showPickupOptions === PICKUP_OPTION_ON}
                        />
                        <span>Pick up your order</span>
                      </div>
                      <span>-</span>
                    </Radio>
                  </RadioGroup>
                )}
                <RadioGroup
                  value={shippingMethodId}
                  onChange={(v) => {
                    if (v) {
                      return handleSetShippingMethod(v, "shipping")
                    }
                  }}
                >
                  {_shippingMethods?.map((option) => {
                    const isDisabled =
                      option.price_type === "calculated" &&
                      !isLoadingPrices &&
                      typeof calculatedPricesMap[option.id] !== "number"

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isDisabled}
                        className={clx(
                          "flex items-center justify-between text-xs font-bold cursor-pointer py-3.5 border rounded-xl px-5 mb-3 transition-colors",
                          {
                            "border-black bg-gray-50 ring-1 ring-black text-black":
                              option.id === shippingMethodId,
                            "border-gray-200 hover:border-gray-300 text-gray-700":
                              option.id !== shippingMethodId && !isDisabled,
                            "opacity-50 cursor-not-allowed": isDisabled,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-3">
                          <MedusaRadio
                            checked={option.id === shippingMethodId}
                          />
                          <span>{option.name}</span>
                        </div>
                        <span className="font-extrabold">
                          {option.price_type === "flat" ? (
                            convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code || "usd",
                            })
                          ) : calculatedPricesMap[option.id] ? (
                            convertToLocale({
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart?.currency_code || "usd",
                            })
                          ) : isLoadingPrices ? (
                            <Loader />
                          ) : (
                            "-"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              className="mt-4 w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-full transition-colors"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!cart.shipping_methods?.[0] && !shippingMethodId}
              data-testid="submit-delivery-option-button"
            >
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-xs text-gray-700">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <span className="font-bold text-black mb-1">Selected Method</span>
                <span>
                  {cart.shipping_methods!.at(-1)!.name} —{" "}
                  {convertToLocale({
                    amount: cart.shipping_methods!.at(-1)!.amount!,
                    currency_code: cart?.currency_code || "usd",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping
