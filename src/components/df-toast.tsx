"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  CircleCheck,
  Info,
  TriangleAlert,
  CircleX,
  X,
} from "lucide-react"

import { useIsClient } from "../hooks"
import { cn } from "../lib/utils"

type ToastTone = "success" | "error" | "info" | "warning"

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left-center"
  | "center"
  | "right-center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

type ToastItem = {
  id: string
  tone: ToastTone
  message: string
}

type ToastListener = () => void

let toasts: ToastItem[] = []
let position: ToastPosition = "bottom-right"
const listeners = new Set<ToastListener>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return toasts
}

const EMPTY_TOASTS: ToastItem[] = []

function getServerSnapshot(): ToastItem[] {
  return EMPTY_TOASTS
}

function getPositionSnapshot() {
  return position
}

function getPositionServerSnapshot(): ToastPosition {
  return "bottom-right"
}

function push(tone: ToastTone, message: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  toasts = [...toasts, { id, tone, message }]
  emit()
  window.setTimeout(() => dismiss(id), 3200)
  return id
}

function dismiss(id: string) {
  toasts = toasts.filter((item) => item.id !== id)
  emit()
}

function setToastPosition(next: ToastPosition) {
  if (position === next) return
  position = next
  emit()
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
  warning: (message: string) => push("warning", message),
  dismiss,
}

const ICONS: Record<ToastTone, React.ReactNode> = {
  success: <CircleCheck className="size-4 fill-current" />,
  error: <CircleX className="size-4 fill-current" />,
  info: <Info className="size-4 fill-current" />,
  warning: <TriangleAlert className="size-4 fill-current" />,
}

type ToasterProps = {
  /** Screen corner or edge where toasts appear. Default: bottom-right. */
  position?: ToastPosition
  className?: string
}

export function Toaster({
  position: positionProp,
  className,
}: ToasterProps = {}) {
  const mounted = useIsClient()
  const items = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const currentPosition = React.useSyncExternalStore(
    subscribe,
    getPositionSnapshot,
    getPositionServerSnapshot
  )

  React.useLayoutEffect(() => {
    if (positionProp) setToastPosition(positionProp)
  }, [positionProp])

  if (!mounted) return null

  const resolved = positionProp ?? currentPosition

  return createPortal(
    <div
      className={cn("df-toaster", className)}
      data-position={resolved}
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          data-df="toast"
          data-tone={item.tone}
          className={cn("df-toast")}
        >
          <span className="df-toast-icon" aria-hidden>
            {ICONS[item.tone]}
          </span>
          <p className="df-toast-message">{item.message}</p>
          <button
            type="button"
            className="df-toast-close"
            aria-label="Dismiss"
            onClick={() => dismiss(item.id)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}

export { setToastPosition }
export type { ToastPosition, ToasterProps, ToastTone }
