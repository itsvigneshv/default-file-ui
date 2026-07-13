"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { Input } from "./df-input"
import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type SearchInputSize = "sm" | "md" | "lg"
type SearchInputIconPosition = "start" | "end"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "className" | "size"
> & {
  className?: string
  inputClassName?: string
  /**
   * Search icon content. Defaults to Search.
   * Pass a custom node to replace, or `false` to hide the icon entirely.
   */
  leadingIcon?: React.ReactNode | false
  /**
   * Where the search icon sits. `start` = left (default), `end` = right.
   * Same icon chrome — only the side changes.
   */
  iconPosition?: SearchInputIconPosition
  /** Trailing slot for custom icon buttons / actions. */
  trailing?: React.ReactNode
  /**
   * Shows a clear (close) control while the field has a value.
   * Defaults to true. Pass `false` to hide it.
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
  iconPosition = "start",
  trailing,
  clearable = true,
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
  const showIcon = leadingIcon !== false
  const iconNode = leadingIcon ?? <Search aria-hidden />
  const showClear = clearable && filled && !disabled
  const showTrailingActions = Boolean(trailing) || showClear

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

  const searchIcon = showIcon ? (
    <span data-df="search-input-icon" data-side={iconPosition} aria-hidden>
      {iconNode}
    </span>
  ) : null

  return (
    <div
      className={cn(className)}
      data-df="search-input"
      data-state={state}
      data-variant={variant}
      data-size={size}
      data-icon-position={iconPosition}
      data-clearable={clearable ? "" : undefined}
      data-has-icon={showIcon ? "" : undefined}
      data-has-trailing={showTrailingActions ? "" : undefined}
    >
      {searchIcon}

      <Input
        disabled={disabled}
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        className={cn(inputClassName)}
        {...props}
      />

      {showTrailingActions ? (
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
export type { SearchInputProps, SearchInputSize, SearchInputIconPosition }
