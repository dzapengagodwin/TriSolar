import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  variants?: HttpTypes.StoreProductVariant[] | null
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  variants,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values = option.values ?? []
  const isColorOption =
    title.toLowerCase().includes("color") ||
    title.toLowerCase().includes("colour")

  return (
    <div className="flex flex-col gap-y-3">
      {isColorOption ? (
        <span className="text-sm">
          Color: <strong>{current || "Select a color"}</strong>
        </span>
      ) : (
        <span className="text-sm">Select {title}</span>
      )}
      <div
        className={clx("flex flex-wrap gap-2", {
          "justify-start": isColorOption,
          "justify-between": !isColorOption,
        })}
        data-testid={dataTestId}
      >
        {values.map((optionValue) => {
          const value = optionValue.value
          const variantImage = isColorOption
            ? variants
                ?.find((variant) =>
                  variant.options?.some(
                    (variantOption) =>
                      variantOption.option_id === option.id &&
                      variantOption.value === value
                  )
                )
                ?.thumbnail
            : undefined

          return (
            <button
              type="button"
              onClick={() => updateOption(option.id, value)}
              key={optionValue.id || value}
              aria-label={isColorOption ? value : undefined}
              aria-pressed={value === current}
              className={clx(
                isColorOption
                  ? "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white p-1"
                  : "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1",
                {
                  "border-ui-border-interactive ring-2 ring-ui-border-interactive":
                    value === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    value !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {variantImage ? (
                <Image
                  src={variantImage}
                  alt={value}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              ) : (
                value
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
