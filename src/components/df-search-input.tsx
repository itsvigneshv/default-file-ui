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
   * Search / leading icon content. Defaults to Search.
   * Pass a custom node to replace, or `false` to hide the icon entirely.
   */
  leadingIcon?: React.ReactNode | false
  /**
   * Where the search icon sits. `start` = left (default), `end` = right
   * (alongside clear / trailing actions).
   */
  iconPosition?: SearchInputIconPosition
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
  iconPosition = "start",
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
  const showIcon = leadingIcon !== false
  const iconNode = leadingIcon ?? <Search aria-hidden />
  const showClear = clearable && filled && !disabled
  const showStartIcon = showIcon && iconPosition === "start"
  const showEndIcon = showIcon && iconPosition === "end"
  const showTrailing = Boolean(trailing) || showClear || showEndIcon

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

  const clearButton = showClear ? (
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
      data-has-leading={showStartIcon ? "" : undefined}
      data-has-trailing={showTrailing ? "" : undefined}
      data-has-end-icon={showEndIcon ? "" : undefined}
    >
      {showStartIcon ? (
        <span data-df="search-input-leading" aria-hidden>
          {iconNode}
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
          {/* Clear sits inward; end search icon + custom trailing sit at the far end. */}
          {clearButton}
          {showEndIcon ? (
            <span data-df="search-input-end-icon" aria-hidden>
              {iconNode}
            </span>
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
