"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type ToggleVariant = "default" | "outline"
type ToggleSize = "default" | "sm" | "lg"
type ToggleRadius = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"

type ToggleGroupContextValue = {
  variant: ToggleVariant
  size: ToggleSize
  spacing: number
  orientation: "horizontal" | "vertical"
  multiple: boolean
  disabled: boolean
  value: string[]
  onItemToggle: (itemValue: string) => void
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
)

const sizeClass: Record<ToggleSize, string> = {
  default: "df-toggle-item-default",
  sm: "df-toggle-item-sm",
  lg: "df-toggle-item-lg",
}

const radiusVar: Record<ToggleRadius, string> = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  "4xl": "var(--radius-4xl)",
  full: "9999px",
}

type ToggleGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  /** Corner rounding for items (and connected group edges). Defaults to the pill radius. */
  radius?: ToggleRadius
  orientation?: "horizontal" | "vertical"
  /** Allow more than one item pressed at a time. */
  multiple?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing = 2,
  radius,
  orientation = "horizontal",
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  children,
  ...props
}: ToggleGroupProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const onItemToggle = (itemValue: string) => {
    if (disabled) return

    if (multiple) {
      if (current.includes(itemValue)) {
        setCurrent(current.filter((v) => v !== itemValue))
      } else {
        setCurrent([...current, itemValue])
      }
      return
    }

    // Single-select: press switches selection; press again clears.
    if (current.includes(itemValue)) {
      setCurrent([])
      return
    }
    setCurrent([itemValue])
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        variant,
        size,
        spacing,
        orientation,
        multiple,
        disabled,
        value: current,
        onItemToggle,
      }}
    >
      <div
        role={multiple ? "group" : "radiogroup"}
        data-df="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        data-radius={radius}
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        style={
          {
            "--gap": spacing,
            ...(radius ? { "--df-toggle-radius": radiusVar[radius] } : {}),
          } as React.CSSProperties
        }
        className={cn("df-toggle-group", className)}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

type ToggleGroupItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
  variant?: ToggleVariant
  size?: ToggleSize
}

function ToggleGroupItem({
  className,
  children,
  value,
  variant,
  size,
  disabled,
  type = "button",
  onClick,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup")
  }

  const itemVariant = context.variant || variant || "default"
  const itemSize = context.size || size || "default"
  const pressed = context.value.includes(value)
  const isDisabled = Boolean(disabled || context.disabled)

  return (
    <button
      type={type}
      role={context.multiple ? "checkbox" : "radio"}
      aria-checked={pressed}
      aria-pressed={pressed}
      disabled={isDisabled}
      data-df="toggle-group-item"
      data-variant={itemVariant}
      data-size={itemSize}
      data-spacing={context.spacing}
      data-state={pressed ? "on" : "off"}
      className={cn(
        "df-toggle-item",
        itemVariant === "outline" && "df-toggle-item-outline",
        sizeClass[itemSize],
        className
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && !isDisabled) {
          context.onItemToggle(value)
        }
      }}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
export type {
  ToggleGroupProps,
  ToggleGroupItemProps,
  ToggleVariant,
  ToggleSize,
  ToggleRadius,
}
