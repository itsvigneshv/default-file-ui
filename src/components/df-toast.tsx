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

type ToastItem = {
  id: string
  tone: ToastTone
  message: string
}

type ToastListener = () => void

let toasts: ToastItem[] = []
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

export function Toaster() {
  const mounted = useIsClient()
  const items = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (!mounted) return null

  return createPortal(
    <div className="df-toaster" aria-live="polite" aria-relevant="additions">
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
