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

export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>
) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const onPointer = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node
      const inside = refs.some((ref) => ref.current?.contains(target))
      if (!inside) onClose()
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open, onClose, refs])
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
    let top = 0
    let left = 0

    if (side === "bottom") top = t.bottom + sideOffset
    if (side === "top") top = t.top - c.height - sideOffset
    if (side === "left") left = t.left - c.width - sideOffset
    if (side === "right") left = t.right + sideOffset

    if (side === "bottom" || side === "top") {
      if (align === "start") left = t.left + alignOffset
      if (align === "center") left = t.left + t.width / 2 - c.width / 2 + alignOffset
      if (align === "end") left = t.right - c.width + alignOffset
    } else {
      if (align === "start") top = t.top + alignOffset
      if (align === "center") top = t.top + t.height / 2 - c.height / 2 + alignOffset
      if (align === "end") top = t.bottom - c.height + alignOffset
    }

    const pad = 8
    left = Math.min(Math.max(pad, left), window.innerWidth - c.width - pad)
    top = Math.min(Math.max(pad, top), window.innerHeight - c.height - pad)

    setStyle({
      position: "fixed",
      top,
      left,
      width: "max-content",
      minWidth: t.width,
      zIndex: 50,
      visibility: "visible",
      ["--anchor-width" as string]: `${t.width}px`,
    })
  }, [align, alignOffset, contentRef, side, sideOffset, triggerRef])

  useEffect(() => {
    if (!open) return
    update()
    const onScroll = () => update()
    window.addEventListener("resize", onScroll)
    window.addEventListener("scroll", onScroll, true)
    return () => {
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scroll", onScroll, true)
    }
  }, [open, update])

  return style
}
