"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type ToggleVariant = "default" | "outline"
type ToggleSize = "default" | "sm" | "lg"

type ToggleGroupContextValue = {
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  orientation?: "horizontal" | "vertical"
  value: string[]
  onItemToggle: (itemValue: string) => void
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null
)

type ToggleGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  variant?: ToggleVariant
  size?: ToggleSize
  spacing?: number
  orientation?: "horizontal" | "vertical"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing = 2,
  orientation = "horizontal",
  value,
  defaultValue = [],
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const onItemToggle = (itemValue: string) => {
    // Single-select behavior matching app usage (style picker / family filter)
    if (current.includes(itemValue) && current.length === 1) {
      // Keep at least one selected for style picker; principles tool allows clearing via All
      setCurrent([itemValue])
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
        value: current,
        onItemToggle,
      }}
    >
      <div
        role="group"
        data-df="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        data-orientation={orientation}
        style={{ "--gap": spacing } as React.CSSProperties}
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
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup")
  }

  const pressed = context.value.includes(value)

  return (
    <button
      type="button"
      role="radio"
      aria-checked={pressed}
      data-df="toggle-group-item"
      data-variant={context.variant || variant || "default"}
      data-size={context.size || size || "default"}
      data-spacing={context.spacing}
      data-state={pressed ? "on" : "off"}
      className={cn("df-toggle-item", className)}
      onClick={() => context.onItemToggle(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
