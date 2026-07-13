"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  useAnchoredPosition,
  useControllableState,
  useIsClient,
} from "../hooks"
import { cn } from "../lib/utils"

type TooltipVariant = "compact" | "detailed"
type TooltipSide = "top" | "bottom" | "left" | "right"
type TooltipAlign = "start" | "center" | "end"

type TooltipContextValue = {
  open: boolean
  show: () => void
  hide: () => void
  hideImmediate: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentId: string
  variant: TooltipVariant
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltipContext() {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error("Tooltip components must be used within Tooltip")
  return ctx
}

function Tooltip({
  open,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 200,
  variant = "compact",
  children,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Hover/focus open delay in ms. */
  delayDuration?: number
  variant?: TooltipVariant
  children: React.ReactNode
}) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentId = React.useId()
  const openTimerRef = React.useRef<number | null>(null)
  const closeTimerRef = React.useRef<number | null>(null)

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  React.useEffect(() => () => clearTimers(), [clearTimers])

  const show = React.useCallback(() => {
    clearTimers()
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true)
    }, delayDuration)
  }, [clearTimers, delayDuration, setOpen])

  const hide = React.useCallback(() => {
    clearTimers()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
    }, 0)
  }, [clearTimers, setOpen])

  const hideImmediate = React.useCallback(() => {
    clearTimers()
    setOpen(false)
  }, [clearTimers, setOpen])

  React.useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideImmediate()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, hideImmediate])

  return (
    <TooltipContext.Provider
      value={{
        open: isOpen,
        show,
        hide,
        hideImmediate,
        triggerRef,
        contentId,
        variant,
      }}
    >
      {children}
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  children,
  render,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  render?: React.ReactElement
}) {
  const { open, show, hide, triggerRef, contentId } = useTooltipContext()

  const shared = {
    ref: triggerRef as React.Ref<HTMLButtonElement>,
    "data-df-tooltip-trigger": "",
    "aria-describedby": open ? contentId : undefined,
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      props.onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>)
      if (event.pointerType === "touch") return
      show()
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      props.onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>)
      if (event.pointerType === "touch") return
      hide()
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      props.onFocus?.(event as React.FocusEvent<HTMLButtonElement>)
      show()
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      props.onBlur?.(event as React.FocusEvent<HTMLButtonElement>)
      hide()
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
      data-df="tooltip-trigger"
      className={cn(className)}
      {...props}
      {...shared}
    >
      {children}
    </button>
  )
}

function TooltipContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "top",
  sideOffset = 14,
  wrap = false,
  arrow = true,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: TooltipAlign
  alignOffset?: number
  side?: TooltipSide
  sideOffset?: number
  /** Detailed only: keep one line, or wrap within max-width. */
  wrap?: boolean
  /** Show the pointing arrow. Defaults to true. */
  arrow?: boolean
}) {
  const { open, triggerRef, contentId, variant } = useTooltipContext()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const style = useAnchoredPosition({
    open,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
    matchTriggerWidth: false,
  })

  const mounted = useIsClient()
  const wrapMode = variant === "detailed" && wrap

  if (!open || !mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="tooltip"
      data-df="tooltip-content"
      data-variant={variant}
      data-side={side}
      data-align={align}
      data-arrow={arrow ? "true" : "false"}
      data-wrap={variant === "detailed" ? (wrapMode ? "true" : "false") : undefined}
      className={cn(className)}
      style={style}
      {...props}
    >
      <div data-df="tooltip-label">{children}</div>
      {arrow ? <span data-df="tooltip-arrow" aria-hidden="true" /> : null}
    </div>,
    document.body
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
export type { TooltipVariant }
