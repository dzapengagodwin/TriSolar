import { Label, clx } from "@modules/common/components/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      name,
      label,
      touched: _touched,
      required,
      topLabel,
      className,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)
    const [isFocused, setIsFocused] = useState(false)

    // Check if input has an initial value (either controlled value or defaultValue)
    const [hasValue, setHasValue] = useState(() => {
      if (props.value !== undefined && props.value !== null) {
        return String(props.value).length > 0
      }
      if (props.defaultValue !== undefined && props.defaultValue !== null) {
        return String(props.defaultValue).length > 0
      }
      return false
    })

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useEffect(() => {
      if (props.value !== undefined && props.value !== null) {
        setHasValue(String(props.value).length > 0)
      } else if (props.defaultValue !== undefined && props.defaultValue !== null) {
        setHasValue(String(props.defaultValue).length > 0)
      }
    }, [props.value, props.defaultValue])

    useImperativeHandle(ref, () => inputRef.current!)

    const isFloating = hasValue || isFocused

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
        )}
        <div className="flex relative z-0 w-full txt-compact-medium">
          <input
            type={inputType}
            name={name}
            placeholder=" "
            required={required}
            className={clx(
              "pt-4 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-colors",
              props.disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(Boolean(e.target.value))
              onBlur?.(e)
            }}
            onChange={(e) => {
              setHasValue(Boolean(e.target.value))
              onChange?.(e)
            }}
            {...props}
            ref={inputRef}
          />
          <label
            htmlFor={name}
            onClick={() => inputRef.current?.focus()}
            className={clx(
              "flex items-center justify-center mx-3 px-1 transition-all duration-200 absolute top-3 origin-0 text-ui-fg-subtle pointer-events-none select-none",
              isFloating && "-translate-y-2 text-xsmall-regular left-0",
              props.disabled && "text-gray-400"
            )}
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus:text-ui-fg-base absolute right-0 top-3"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
          {props.disabled && (
            <div className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none select-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
