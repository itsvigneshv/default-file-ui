"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, ChevronUp, Check } from "lucide-react"

import {
  useAnchoredPosition,
  useControllableState,
  useDismiss,
  useIsClient,
} from "../hooks"
import { cn } from "../lib/utils"

type SelectContextValue = {
  value: string | null
  setValue: (value: string | null) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  labelFor: (value: string | null) => React.ReactNode
  registerLabel: (value: string, label: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within Select")
  return ctx
}

function Select({
  value,
  defaultValue = null,
  onValueChange,
  children,
}: {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  children: React.ReactNode
}) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const labels = React.useRef(new Map<string, React.ReactNode>())

  const registerLabel = React.useCallback(
    (itemValue: string, label: React.ReactNode) => {
      labels.current.set(itemValue, label)
    },
    []
  )

  const labelFor = React.useCallback((itemValue: string | null) => {
    if (!itemValue) return null
    return labels.current.get(itemValue) ?? itemValue
  }, [])

  return (
    <SelectContext.Provider
      value={{
        value: current,
        setValue: setCurrent,
        open,
        setOpen,
        triggerRef,
        labelFor,
        registerLabel,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-df="select-group" className={cn("p-1", className)} {...props} />
  )
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  placeholder?: string
  children?:
    | React.ReactNode
    | ((value: string | null) => React.ReactNode)
}) {
  const { value, labelFor } = useSelectContext()
  const content =
    typeof children === "function"
      ? children(value)
      : (children ?? labelFor(value) ?? placeholder)

  return (
    <span
      data-df="select-value"
      className={cn("flex min-w-0 flex-1 truncate text-left", className)}
      {...props}
    >
      {content}
    </span>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "default"
}) {
  const { open, setOpen, triggerRef, value } = useSelectContext()

  return (
    <button
      type="button"
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      data-df="select-trigger"
      data-size={size}
      data-placeholder={value == null ? "" : undefined}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="pointer-events-none size-4 text-muted-foreground" />
    </button>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  alignItemWithTrigger?: boolean
}) {
  const { open, setOpen, triggerRef } = useSelectContext()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const style = useAnchoredPosition({
    open,
    triggerRef,
    contentRef,
    side,
    align: alignItemWithTrigger ? "start" : align,
    sideOffset,
    alignOffset,
  })

  useDismiss(open, () => setOpen(false), [triggerRef, contentRef])

  const mounted = useIsClient()

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      role="listbox"
      data-df="select-content"
      data-align-trigger={alignItemWithTrigger}
      className={cn(className)}
      style={{
        ...style,
        width: alignItemWithTrigger
          ? "var(--anchor-width)"
          : style.width,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-df="select-label"
      className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
}) {
  const { value: selected, setValue, setOpen, registerLabel } =
    useSelectContext()

  React.useEffect(() => {
    registerLabel(value, children)
  }, [children, registerLabel, value])

  const isSelected = selected === value

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-df="select-item"
      data-disabled={disabled ? "" : undefined}
      data-highlighted={undefined}
      className={cn(className)}
      onClick={() => {
        if (disabled) return
        setValue(value)
        setOpen(false)
      }}
      {...props}
    >
      <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </span>
      {isSelected ? (
        <span data-df="select-item-indicator">
          <Check className="pointer-events-none size-4" />
        </span>
      ) : null}
    </div>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="select-separator"
      className={cn("my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="select-scroll-up-button"
      className={cn(
        "flex w-full cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </div>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="select-scroll-down-button"
      className={cn(
        "flex w-full cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
