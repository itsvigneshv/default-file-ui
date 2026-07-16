"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type TabsVariant = "pill" | "line" | "segment"
type TabsSize = "sm" | "default" | "lg"
type TabsOrientation = "horizontal" | "vertical"
/** Edge the line variant's divider and active indicator sit on. */
type TabsLineSide = "top" | "bottom" | "left" | "right"
/** Corner radius for pill and segment tracks, indicators, and triggers. */
type TabsRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
/**
 * Design-scale spacing unit for gap props.
 * Maps to the shared SPACING scale: `none` / 0 = 0, N = N × 0.25rem.
 * Even integers run through 200; half-steps (0.5, 1.5…) are valid too.
 */
type TabsSpacing = number | "none"

function resolveTabsRadius(
  variant: TabsVariant,
  orientation: TabsOrientation,
  radius?: TabsRadius
): TabsRadius {
  if (radius != null) return radius
  if (variant === "segment") return "lg"
  // A fully-round track reads as a capsule blob when stacked; soften it.
  if (variant === "pill") return orientation === "vertical" ? "2xl" : "full"
  return "none"
}

function resolveLineSide(
  orientation: TabsOrientation,
  lineSide?: TabsLineSide
): TabsLineSide {
  if (orientation === "vertical") return lineSide === "left" ? "left" : "right"
  return lineSide === "top" ? "top" : "bottom"
}

function resolveSpacingUnits(
  value: TabsSpacing | undefined,
  fallback: number
): number {
  if (value === "none") return 0
  if (value == null) return fallback
  return value
}

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  variant: TabsVariant
  size: TabsSize
  orientation: TabsOrientation
  lineSide: TabsLineSide
  radius: TabsRadius
  gap: number
  spacing: number
  baseId: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within Tabs")
  return ctx
}

type TabsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
  /**
   * Layout axis.
   * - `horizontal`: triggers sit in a row; the panel stacks below (default).
   * - `vertical`: triggers stack in a column; the panel sits alongside. The
   *   line indicator moves to the trailing edge and arrow-key nav uses Up/Down.
   */
  orientation?: TabsOrientation
  /**
   * Edge the line variant's divider and active indicator sit on.
   * Horizontal accepts `top` / `bottom` (default `bottom`); vertical accepts
   * `left` / `right` (default `right`). Use `left` when the list sits to the
   * right of its content, so the line faces the panel. Other variants ignore it.
   */
  lineSide?: TabsLineSide
  /**
   * Corner radius for the list track, sliding chip, and triggers.
   * Applies to pill and segment. Defaults: pill `full` (`2xl` when vertical),
   * segment `lg`. Line ignores radius.
   */
  radius?: TabsRadius
  /**
   * Gap inside each trigger between leading icon, label, and trailing badge.
   * Design-scale units (`none` / 0…200, half-steps allowed). Default `1.5`
   * (0.375rem). Uses `--spacing-unit`.
   */
  gap?: TabsSpacing
  /**
   * Gap between triggers in the list. Design-scale units. Defaults: `0` for
   * pill and line, `0.5` for segment. Uses `--spacing-unit`.
   */
  spacing?: TabsSpacing
}

function Tabs({
  className,
  style,
  value,
  defaultValue = "",
  onValueChange,
  variant = "pill",
  size = "default",
  orientation = "horizontal",
  lineSide,
  radius,
  gap,
  spacing,
  children,
  ...props
}: TabsProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const reactId = React.useId()
  const baseId = `df-tabs${reactId.replace(/:/g, "")}`
  const resolvedRadius = resolveTabsRadius(variant, orientation, radius)
  const resolvedLineSide = resolveLineSide(orientation, lineSide)
  const resolvedGap = resolveSpacingUnits(gap, 1.5)
  const resolvedSpacing = resolveSpacingUnits(
    spacing,
    variant === "segment" ? 0.5 : 0
  )
  const panelGap = orientation === "vertical" ? 4 : 0

  return (
    <TabsContext.Provider
      value={{
        value: current,
        setValue: setCurrent,
        variant,
        size,
        orientation,
        lineSide: resolvedLineSide,
        radius: resolvedRadius,
        gap: resolvedGap,
        spacing: resolvedSpacing,
        baseId,
      }}
    >
      <div
        data-df="tabs"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        data-line-side={resolvedLineSide}
        data-radius={resolvedRadius}
        data-gap={resolvedGap}
        data-spacing={resolvedSpacing}
        style={
          {
            "--df-tabs-gap": resolvedGap,
            "--df-tabs-spacing": resolvedSpacing,
            "--df-tabs-panel-gap": panelGap,
            ...style,
          } as React.CSSProperties
        }
        className={cn("df-tabs", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

type IndicatorRect = { left: number; top: number; width: number; height: number }

function TabsList({ className, children, onKeyDown, ...props }: TabsListProps) {
  const { variant, size, orientation, lineSide, radius, value } = useTabsContext()
  const vertical = orientation === "vertical"
  const listRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<IndicatorRect | null>(null)

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-df="tabs-trigger"][data-state="active"]'
      )
      if (!active) {
        setIndicator(null)
        return
      }
      setIndicator({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    list
      .querySelectorAll('[data-df="tabs-trigger"]')
      .forEach((trigger) => observer.observe(trigger))
    return () => observer.disconnect()
  }, [variant, size, orientation, radius, value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const prevKey = vertical ? "ArrowUp" : "ArrowLeft"
    const nextKey = vertical ? "ArrowDown" : "ArrowRight"
    if (![prevKey, nextKey, "Home", "End"].includes(event.key)) return
    const list = listRef.current
    if (!list) return
    const triggers = Array.from(
      list.querySelectorAll<HTMLButtonElement>(
        '[data-df="tabs-trigger"]:not(:disabled)'
      )
    )
    if (triggers.length === 0) return
    event.preventDefault()
    const activeIndex = triggers.indexOf(
      document.activeElement as HTMLButtonElement
    )
    let nextIndex: number
    if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = triggers.length - 1
    else {
      const step = event.key === prevKey ? -1 : 1
      const base = activeIndex === -1 ? 0 : activeIndex
      nextIndex = (base + step + triggers.length) % triggers.length
    }
    const next = triggers[nextIndex]
    next.focus()
    next.click()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      data-df="tabs-list"
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      data-line-side={lineSide}
      data-radius={radius}
      className={cn("df-tabs-list", className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {indicator ? (
        <span
          aria-hidden
          data-df="tabs-indicator"
          data-variant={variant}
          data-orientation={orientation}
          data-line-side={lineSide}
          data-radius={radius}
          className="df-tabs-indicator"
          style={
            variant === "line"
              ? vertical
                ? {
                    transform: `translateY(${indicator.top}px)`,
                    height: indicator.height,
                  }
                : {
                    transform: `translateX(${indicator.left}px)`,
                    width: indicator.width,
                  }
              : {
                  transform: `translate(${indicator.left}px, ${indicator.top}px)`,
                  width: indicator.width,
                  height: indicator.height,
                }
          }
        />
      ) : null}
      {children}
    </div>
  )
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
  /** Icon or node before the label. */
  leading?: React.ReactNode
  /** Badge or node after the label (e.g. a count Badge). */
  trailing?: React.ReactNode
}

function TabsTrigger({
  className,
  value,
  children,
  leading,
  trailing,
  disabled,
  type = "button",
  ...props
}: TabsTriggerProps) {
  const {
    value: current,
    setValue,
    variant,
    size,
    orientation,
    lineSide,
    radius,
    baseId,
  } = useTabsContext()
  const selected = current === value

  return (
    <button
      type={type}
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-df="tabs-trigger"
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      data-line-side={lineSide}
      data-radius={radius}
      data-state={selected ? "active" : "inactive"}
      data-leading={leading != null ? "true" : undefined}
      data-trailing={trailing != null ? "true" : undefined}
      className={cn("df-tabs-trigger", className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented && !disabled) setValue(value)
      }}
      {...props}
    >
      {leading != null ? (
        <span data-df="tabs-trigger-leading" className="df-tabs-trigger-leading">
          {leading}
        </span>
      ) : null}
      {children}
      {trailing != null ? (
        <span
          data-df="tabs-trigger-trailing"
          className="df-tabs-trigger-trailing"
        >
          {trailing}
        </span>
      ) : null}
    </button>
  )
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
  /** Keep content mounted when inactive. Default false. */
  forceMount?: boolean
}

function TabsContent({
  className,
  value,
  forceMount = false,
  children,
  ...props
}: TabsContentProps) {
  const { value: current, baseId } = useTabsContext()
  const selected = current === value

  if (!forceMount && !selected) return null

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      data-df="tabs-content"
      data-state={selected ? "active" : "inactive"}
      className={cn("df-tabs-content", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsVariant,
  TabsSize,
  TabsOrientation,
  TabsLineSide,
  TabsRadius,
  TabsSpacing,
}
