"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  DISMISS_NESTED_LAYER_SELECTORS,
  useAnchoredPosition,
  useControllableState,
  useDismiss,
  useIsClient,
} from "../hooks"
import { cn } from "../lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover components must be used within Popover")
  return ctx
}

function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = React.useRef<HTMLElement | null>(null)

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({
  children,
  render,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  render?: React.ReactElement
}) {
  const { open, setOpen, triggerRef } = usePopoverContext()

  const shared = {
    ref: triggerRef as React.Ref<HTMLButtonElement>,
    "data-df-popover-trigger": "",
    "aria-expanded": open,
    "aria-haspopup": "dialog" as const,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      props.onClick?.(event as React.MouseEvent<HTMLButtonElement>)
      setOpen(!open)
    },
  }

  if (render) {
    return React.cloneElement(render, {
      ...props,
      ...shared,
      className: cn(className, (render.props as { className?: string }).className),
      children: children ?? (render.props as { children?: React.ReactNode }).children,
    } as never)
  }

  return (
    <button
      type="button"
      data-df="popover-trigger"
      className={cn(className)}
      {...shared}
      {...props}
    >
      {children}
    </button>
  )
}

function PopoverContent({
  className,
  style: styleProp,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  matchTriggerWidth = false,
  portal = true,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  alignOffset?: number
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  matchTriggerWidth?: boolean
  portal?: boolean
}) {
  const { open, setOpen, triggerRef } = usePopoverContext()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const anchoredStyle = useAnchoredPosition({
    open: open && portal,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
    matchTriggerWidth,
  })

  useDismiss(open && portal, () => setOpen(false), [triggerRef, contentRef], {
    excludeSelectors: DISMISS_NESTED_LAYER_SELECTORS,
  })

  const mounted = useIsClient()

  if (!mounted) return null
  if (!open) return null

  const panel = (
    <div
      ref={contentRef}
      data-df="popover-content"
      data-side={side}
      data-portal={portal ? "true" : "false"}
      className={cn(className)}
      style={
        portal
          ? { ...anchoredStyle, ...styleProp }
          : { position: "relative", ...styleProp }
      }
      {...props}
    >
      {children}
    </div>
  )

  if (!portal) return panel

  return createPortal(panel, document.body)
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-df="popover-header" className={cn(className)} {...props} />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 data-df="popover-title" className={cn(className)} {...props} />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p data-df="popover-description" className={cn(className)} {...props} />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
