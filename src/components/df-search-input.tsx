"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { Input } from "./df-input"
import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type SearchInputSize = "sm" | "md" | "lg"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "className" | "size"
> & {
  className?: string
  inputClassName?: string
  /**
   * Leading icon. Defaults to Search.
   * Pass a custom node to replace, or `false` to hide.
   */
  leadingIcon?: React.ReactNode | false
  /** Trailing slot for custom icon buttons / actions. */
  trailing?: React.ReactNode
  /**
   * When true, shows a clear (close) control while the field has a value.
   * Works with controlled and uncontrolled usage.
   */
  clearable?: boolean
  /** Called after the value is cleared (in addition to onChange). */
  onClear?: () => void
  /** Visual shape. `pill` is suited to app chrome / top bars. */
  variant?: "default" | "pill"
  /** T-shirt size. Default `md`. */
  size?: SearchInputSize
}

function SearchInput({
  className,
  inputClassName,
  leadingIcon,
  trailing,
  clearable = false,
  onClear,
  variant = "default",
  size = "md",
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  ...props
}: SearchInputProps) {
  const [current, setCurrent] = useControllableState<string>({
    value: value === undefined ? undefined : String(value),
    defaultValue:
      defaultValue === undefined || defaultValue === null
        ? ""
        : String(defaultValue),
  })

  const filled = current.trim().length > 0
  const state = filled ? "filled" : "placeholder"
  const showLeading = leadingIcon !== false
  const showClear = clearable && filled && !disabled
  const showTrailing = Boolean(trailing) || showClear

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrent(event.target.value)
    onChange?.(event)
  }

  function handleClear() {
    setCurrent("")
    onClear?.()
    onChange?.({
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div
      className={cn(className)}
      data-df="search-input"
      data-state={state}
      data-variant={variant}
      data-size={size}
      data-clearable={clearable ? "" : undefined}
      data-has-leading={showLeading ? "" : undefined}
      data-has-trailing={showTrailing ? "" : undefined}
    >
      {showLeading ? (
        <span data-df="search-input-leading" aria-hidden>
          {leadingIcon ?? <Search aria-hidden />}
        </span>
      ) : null}

      <Input
        disabled={disabled}
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        className={cn(inputClassName)}
        {...props}
      />

      {showTrailing ? (
        <div data-df="search-input-trailing">
          {showClear ? (
            <button
              type="button"
              data-df="search-input-clear"
              aria-label="Clear search"
              onMouseDown={(event) => {
                // Keep focus on the field; avoid blur-before-click races.
                event.preventDefault()
              }}
              onClick={handleClear}
            >
              <X aria-hidden />
            </button>
          ) : null}
          {trailing}
        </div>
      ) : null}
    </div>
  )
}

/** Alias — same component; prefer this name for chrome / toolbars. */
const SearchBar = SearchInput

export { SearchInput, SearchBar }
export type { SearchInputProps, SearchInputSize }
