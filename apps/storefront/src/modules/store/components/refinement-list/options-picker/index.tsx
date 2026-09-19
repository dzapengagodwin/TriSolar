"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useState } from "react"
import { ChevronDownMini } from "@medusajs/icons"
import clsx from "clsx"
import { ScopedProductOption } from "@lib/util/product-option-filters"

type OptionsPickerProps = {
  options?: ScopedProductOption[]
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  options = [],
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options || options.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
          Filter by Options
        </span>
      </div>
      <Accordion.Root
        type="multiple"
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col gap-y-3 pr-6"
      >
        {options.map((option) => {
          if (!option.values || option.values.length === 0) {
            return null
          }

          const isColorOption =
            option.title.toLowerCase() === "color" ||
            option.title.toLowerCase() === "colour"

          // Check how many values under this option are currently selected
          const selectedCount = option.values.filter((val) =>
            val.valueIds.some((id) => selectedValueIds.includes(id))
          ).length

          const toggleValue = (valueIds: string[]) => {
            const isCurrentlySelected = valueIds.some((id) =>
              selectedValueIds.includes(id)
            )

            let nextSelections: string[]
            if (isCurrentlySelected) {
              const valueIdsSet = new Set(valueIds)
              nextSelections = selectedValueIds.filter(
                (id) => !valueIdsSet.has(id)
              )
            } else {
              nextSelections = [...selectedValueIds, ...valueIds]
            }

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const isOpen = openItems.includes(option.id)

          return (
            <Accordion.Item
              key={option.id}
              value={option.id}
              className="overflow-hidden border-b border-gray-100 last:border-b-0 pb-3"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between py-2.5 text-left group">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {option.title}
                    </span>
                    {selectedCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "flex h-6 w-6 items-center justify-center text-gray-400 group-hover:text-gray-900 transition-transform duration-150",
                      {
                        "rotate-180": isOpen,
                      }
                    )}
                  >
                    <ChevronDownMini />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {option.values.map((value) => {
                    const isSelected = value.valueIds.some((id) =>
                      selectedValueIds.includes(id)
                    )

                    return (
                      <button
                        key={value.id}
                        type="button"
                        onClick={() => toggleValue(value.valueIds)}
                        className={clsx(
                          "text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                          {
                            "border-primary bg-primary text-white font-bold shadow-xs":
                              isSelected,
                            "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50":
                              !isSelected,
                          }
                        )}
                        aria-pressed={isSelected}
                      >
                        {isColorOption && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                            style={{
                              backgroundColor: value.label.toLowerCase(),
                            }}
                          />
                        )}
                        <span>{value.label}</span>
                        {value.count > 0 && (
                          <span
                            className={clsx("text-[10px] ml-0.5 opacity-75", {
                              "text-white": isSelected,
                              "text-gray-400": !isSelected,
                            })}
                          >
                            ({value.count})
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
    </div>
  )
}

export default OptionsPicker
