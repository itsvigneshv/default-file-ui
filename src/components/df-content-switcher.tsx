"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type ContentSwitcherSize = "default" | "sm" | "xs"

type ContentSwitcherContextValue = {
  value: string
  setValue: (value: string) => void
  orientation: "horizontal" | "vertical"
  fullWidth: boolean
  size: ContentSwitcherSize
  deselectable: boolean
}

const ContentSwitcherContext =
  React.createContext<ContentSwitcherContextValue | null>(null)

function useContentSwitcherContext() {
  const ctx = React.useContext(ContentSwitcherContext)
  if (!ctx) {
    throw new Error(
      "ContentSwitcherItem must be used within ContentSwitcher"
    )
  }
  return ctx
}

type ContentSwitcherProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  /** Stretch items to fill the track width. */
  fullWidth?: boolean
  /** T-shirt size for segment height and type. */
  size?: ContentSwitcherSize
  /** Click the active item again to clear selection (value becomes ""). */
  deselectable?: boolean
}

function ContentSwitcher({
  className,
  value,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  fullWidth = false,
  size = "default",
  deselectable = false,
  children,
  ...props
}: ContentSwitcherProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  return (
    <ContentSwitcherContext.Provider
      value={{
        value: current,
        setValue: setCurrent,
        orientation,
        fullWidth,
        size,
        deselectable,
      }}
    >
      <div
        role="radiogroup"
        data-df="content-switcher"
        data-orientation={orientation}
        data-full-width={fullWidth ? "" : undefined}
        data-size={size}
        data-deselectable={deselectable ? "" : undefined}
        className={cn("df-content-switcher", className)}
        {...props}
      >
        {children}
      </div>
    </ContentSwitcherContext.Provider>
  )
}

type ContentSwitcherItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}

function ContentSwitcherItem({
  className,
  value,
  children,
  disabled,
  type = "button",
  ...props
}: ContentSwitcherItemProps) {
  const { value: current, setValue, fullWidth, size, deselectable } =
    useContentSwitcherContext()
  const selected = current === value

  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      data-df="content-switcher-item"
      data-state={selected ? "on" : "off"}
      data-full-width={fullWidth ? "" : undefined}
      data-size={size}
      className={cn("df-content-switcher-item", className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented || disabled) return
        if (deselectable && selected) {
          setValue("")
          return
        }
        setValue(value)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export { ContentSwitcher, ContentSwitcherItem }
export type {
  ContentSwitcherProps,
  ContentSwitcherItemProps,
  ContentSwitcherSize,
}
