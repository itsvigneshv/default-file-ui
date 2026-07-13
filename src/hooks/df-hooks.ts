import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? (value as T) : uncontrolled

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [current, isControlled, onChange]
  )

  return [current, setValue] as const
}

/** Client-only gate without setState-in-effect (portal / document access). */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

/** Portaled pickers that can open inside another dismiss surface (e.g. popover). */
export const DISMISS_NESTED_LAYER_SELECTORS = [
  '[data-df="select-content"]',
] as const

export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>,
  options?: { excludeSelectors?: readonly string[] }
) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const onPointer = (event: MouseEvent | PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      const inside = refs.some((ref) => ref.current?.contains(target))
      if (inside) return
      const el = target instanceof Element ? target : target.parentElement
      if (
        el &&
        options?.excludeSelectors?.some((selector) => el.closest(selector))
      ) {
        return
      }
      onClose()
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open, onClose, options?.excludeSelectors, refs])
}

type Side = "top" | "bottom" | "left" | "right"
type Align = "start" | "center" | "end"

export function useAnchoredPosition({
  open,
  triggerRef,
  contentRef,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
}: {
  open: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
}) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    visibility: "hidden",
  })

  const update = useCallback(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger || !content) return

    const t = trigger.getBoundingClientRect()
    const c = content.getBoundingClientRect()
    const pad = 8
    const vw = window.innerWidth
    const vh = window.innerHeight

    let top = 0
    if (side === "bottom") top = t.bottom + sideOffset
    if (side === "top") top = t.top - c.height - sideOffset
    if (side === "left" || side === "right") {
      // Vertical alignment along a horizontal side.
      if (align === "start") top = t.top + alignOffset
      if (align === "center")
        top = t.top + t.height / 2 - c.height / 2 + alignOffset
      if (align === "end") top = t.bottom - c.height + alignOffset
    }

    if (top < pad) top = pad
    if (top + c.height > vh - pad) {
      top = Math.max(pad, vh - c.height - pad)
    }

    const base: React.CSSProperties = {
      position: "fixed",
      top,
      minWidth: t.width,
      zIndex: 50,
      visibility: "visible",
      ["--anchor-width" as string]: `${t.width}px`,
    }

    if (side === "left" || side === "right") {
      let left =
        side === "left" ? t.left - c.width - sideOffset : t.right + sideOffset
      if (left < pad) left = pad
      if (left + c.width > vw - pad) {
        left = Math.max(pad, vw - c.width - pad)
      }
      setStyle({ ...base, left, right: "auto" })
      return
    }

    // Top / bottom: pin with left or right so growing content keeps the
    // aligned edge glued to the trigger (end → grows left, not past Export).
    if (align === "end") {
      let right = vw - t.right - alignOffset
      const leftEdge = vw - right - c.width
      if (leftEdge < pad) {
        right = Math.max(pad, vw - c.width - pad)
      }
      setStyle({ ...base, right, left: "auto" })
      return
    }

    let left =
      align === "start"
        ? t.left + alignOffset
        : t.left + t.width / 2 - c.width / 2 + alignOffset
    if (left < pad) left = pad
    if (left + c.width > vw - pad) {
      left = Math.max(pad, vw - c.width - pad)
    }
    setStyle({ ...base, left, right: "auto" })
  }, [align, alignOffset, contentRef, side, sideOffset, triggerRef])

  useEffect(() => {
    if (!open) return
    update()
    const raf = window.requestAnimationFrame(() => update())
    const onScroll = () => update()
    window.addEventListener("resize", onScroll)
    window.addEventListener("scroll", onScroll, true)

    const content = contentRef.current
    const ro =
      content && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => update())
        : null
    if (content && ro) ro.observe(content)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scroll", onScroll, true)
      ro?.disconnect()
    }
  }, [open, update, contentRef])

  return style
}
