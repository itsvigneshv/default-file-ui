"use client"

import * as React from "react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"

type TabsVariant = "pill" | "line"
type TabsSize = "sm" | "default" | "lg"

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  variant: TabsVariant
  size: TabsSize
  baseId: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within Tabs")
  return ctx
}

type TabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
}

function Tabs({
  className,
  value,
  defaultValue = "",
  onValueChange,
  variant = "pill",
  size = "default",
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

  return (
    <TabsContext.Provider
      value={{
        value: current,
        setValue: setCurrent,
        variant,
        size,
        baseId,
      }}
    >
      <div
        data-df="tabs"
        data-variant={variant}
        data-size={size}
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

function TabsList({ className, children, ...props }: TabsListProps) {
  const { variant, size, value } = useTabsContext()
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
  }, [variant, size, value])

  return (
    <div
      ref={listRef}
      role="tablist"
      data-df="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn("df-tabs-list", className)}
      {...props}
    >
      {indicator ? (
        <span
          aria-hidden
          data-df="tabs-indicator"
          data-variant={variant}
          className="df-tabs-indicator"
          style={
            variant === "line"
              ? {
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
}

function TabsTrigger({
  className,
  value,
  children,
  disabled,
  type = "button",
  ...props
}: TabsTriggerProps) {
  const { value: current, setValue, variant, size, baseId } = useTabsContext()
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
      data-state={selected ? "active" : "inactive"}
      className={cn("df-tabs-trigger", className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented && !disabled) setValue(value)
      }}
      {...props}
    >
      {children}
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
}
