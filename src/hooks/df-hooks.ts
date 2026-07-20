import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

function isSameControllableValue<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false
    }
    return true
  }
  return false
}

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
      if (isSameControllableValue(resolved, current)) return
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [current, isControlled, onChange]
  )

  return [current, setValue] as const
}

export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export const DISMISS_NESTED_LAYER_SELECTORS = [
  '[data-df="option-list-content"]',
  '[data-df="select-content"]',
] as const

function isInsideDismissSurface(
  target: EventTarget | null,
  refs: Array<React.RefObject<HTMLElement | null>>,
  excludeSelectors?: readonly string[]
) {
  if (!(target instanceof Node)) return false
  if (refs.some((ref) => ref.current?.contains(target))) return true
  const el = target instanceof Element ? target : target.parentElement
  if (
    el &&
    excludeSelectors?.some((selector) => el.closest(selector))
  ) {
    return true
  }
  return false
}

export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>,
  options?: {
    excludeSelectors?: readonly string[]
    dismissOnScroll?: boolean
  }
) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const onPointer = (event: MouseEvent | PointerEvent) => {
      if (isInsideDismissSurface(event.target, refs, options?.excludeSelectors)) {
        return
      }
      onClose()
    }

    const dismissOnScroll = options?.dismissOnScroll ?? true
    const onScroll = (event: Event) => {
      if (!dismissOnScroll) return
      if (isInsideDismissSurface(event.target, refs, options?.excludeSelectors)) {
        return
      }
      onClose()
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    if (dismissOnScroll) {
      document.addEventListener("scroll", onScroll, true)
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("scroll", onScroll, true)
    }
  }, [open, onClose, options?.dismissOnScroll, options?.excludeSelectors, refs])
}

type Side = "top" | "bottom" | "left" | "right"
type Align = "start" | "center" | "end" | "auto"

type ResolvedAlign = "start" | "center" | "end"

function oppositeSide(side: Side): Side {
  if (side === "top") return "bottom"
  if (side === "bottom") return "top"
  if (side === "left") return "right"
  return "left"
}

function overflowX(left: number, width: number, vw: number, pad: number) {
  return Math.max(0, pad - left) + Math.max(0, left + width - (vw - pad))
}

function overflowY(top: number, height: number, vh: number, pad: number) {
  return Math.max(0, pad - top) + Math.max(0, top + height - (vh - pad))
}

function resolveSide(
  preferred: Side,
  t: DOMRect,
  c: { width: number; height: number },
  vw: number,
  vh: number,
  pads: { top: number; bottom: number; x: number },
  sideOffset: number,
  contentAware: boolean
): Side {
  if (!contentAware) return preferred

  const space = {
    bottom: vh - pads.bottom - (t.bottom + sideOffset),
    top: t.top - pads.top - sideOffset,
    right: vw - pads.x - (t.right + sideOffset),
    left: t.left - pads.x - sideOffset,
  }

  const needed =
    preferred === "top" || preferred === "bottom" ? c.height : c.width
  if (space[preferred] >= needed) return preferred

  const flip = oppositeSide(preferred)
  if (space[flip] > space[preferred]) return flip
  return preferred
}

function pickCrossAlign(
  preferred: Align,
  t: DOMRect,
  contentSize: number,
  viewport: number,
  pad: number,
  axis: "x" | "y"
): ResolvedAlign {
  if (preferred !== "auto") return preferred

  const candidates: Array<{ align: ResolvedAlign; origin: number }> =
    axis === "x"
      ? [
          { align: "start", origin: t.left },
          { align: "center", origin: t.left + t.width / 2 - contentSize / 2 },
          { align: "end", origin: t.right - contentSize },
        ]
      : [
          { align: "start", origin: t.top },
          { align: "center", origin: t.top + t.height / 2 - contentSize / 2 },
          { align: "end", origin: t.bottom - contentSize },
        ]

  let best: ResolvedAlign = "center"
  let bestScore = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    const score =
      axis === "x"
        ? overflowX(candidate.origin, contentSize, viewport, pad)
        : overflowY(candidate.origin, contentSize, viewport, pad)
    const tieBreak = candidate.align === "center" ? -0.1 : 0
    if (score + tieBreak < bestScore) {
      best = candidate.align
      bestScore = score + tieBreak
    }
  }
  return best
}

function readOverlayInset(name: string): number {
  if (typeof window === "undefined") return 0
  const root = document.documentElement
  const raw = getComputedStyle(root).getPropertyValue(name).trim()
  if (!raw) return 0
  const num = Number.parseFloat(raw)
  if (Number.isNaN(num)) return 0
  if (raw.endsWith("rem")) {
    const rootPx = Number.parseFloat(getComputedStyle(root).fontSize) || 16
    return num * rootPx
  }
  return num
}

export function useAnchoredPosition({
  open,
  triggerRef,
  contentRef,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  matchTriggerWidth = true,
  collisionAvoidance = false,
  followScroll = true,
}: {
  open: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  matchTriggerWidth?: boolean
  collisionAvoidance?: boolean
  followScroll?: boolean
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
    const padTop = pad + readOverlayInset("--df-overlay-inset-top")
    const padBottom = pad + readOverlayInset("--df-overlay-inset-bottom")
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight
    const contentAware = align === "auto" || collisionAvoidance

    const resolvedSide = resolveSide(
      side,
      t,
      c,
      vw,
      vh,
      { top: padTop, bottom: padBottom, x: pad },
      sideOffset,
      contentAware
    )

    const resolvedAlign =
      resolvedSide === "left" || resolvedSide === "right"
        ? pickCrossAlign(align, t, c.height, vh, pad, "y")
        : pickCrossAlign(align, t, c.width, vw, pad, "x")

    let maxHeight: number | undefined
    let top: number | "auto" = 0
    let bottom: number | "auto" = "auto"

    if (resolvedSide === "bottom") {
      top = t.bottom + sideOffset
      maxHeight = Math.max(96, vh - padBottom - top)
    } else if (resolvedSide === "top") {
      bottom = vh - t.top + sideOffset
      top = "auto"
      maxHeight = Math.max(96, t.top - padTop - sideOffset)
    } else {
      if (resolvedAlign === "start") top = t.top + alignOffset
      else if (resolvedAlign === "center")
        top = t.top + t.height / 2 - c.height / 2 + alignOffset
      else top = t.bottom - c.height + alignOffset
      if (top < padTop) top = padTop
      if (top + c.height > vh - padBottom) {
        top = Math.max(padTop, vh - c.height - padBottom)
      }
    }

    const base: React.CSSProperties = {
      position: "fixed",
      top,
      bottom,
      ...(matchTriggerWidth
        ? { width: t.width, minWidth: t.width, maxWidth: t.width }
        : null),
      ...(maxHeight != null ? { maxHeight } : null),
      zIndex: 50,
      visibility: "visible",
      ["--anchor-width" as string]: `${t.width}px`,
    }

    if (resolvedSide === "left" || resolvedSide === "right") {
      let left =
        resolvedSide === "left"
          ? t.left - c.width - sideOffset
          : t.right + sideOffset
      if (left < pad) left = pad
      if (left + c.width > vw - pad) {
        left = Math.max(pad, vw - c.width - pad)
      }
      setStyle({ ...base, left, right: "auto" })
      return
    }

    if (resolvedAlign === "end") {
      let right = vw - t.right - alignOffset
      const leftEdge = vw - right - c.width
      if (leftEdge < pad) {
        right = Math.max(pad, vw - c.width - pad)
      }
      setStyle({ ...base, right, left: "auto" })
      return
    }

    let left =
      resolvedAlign === "start"
        ? t.left + alignOffset
        : t.left + t.width / 2 - c.width / 2 + alignOffset
    if (!matchTriggerWidth) {
      if (left < pad) left = pad
      if (left + c.width > vw - pad) {
        left = Math.max(pad, vw - c.width - pad)
      }
    }
    setStyle({ ...base, left, right: "auto" })
  }, [
    align,
    alignOffset,
    collisionAvoidance,
    contentRef,
    matchTriggerWidth,
    side,
    sideOffset,
    triggerRef,
  ])

  useEffect(() => {
    if (!open) return
    update()
    const raf = window.requestAnimationFrame(() => update())
    const onResize = () => update()
    const onScroll = () => update()
    window.addEventListener("resize", onResize)
    if (followScroll) window.addEventListener("scroll", onScroll, true)

    const content = contentRef.current
    const trigger = triggerRef.current
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => update())
        : null
    if (content && ro) ro.observe(content)
    if (trigger && ro) ro.observe(trigger)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      if (followScroll) window.removeEventListener("scroll", onScroll, true)
      ro?.disconnect()
    }
  }, [contentRef, followScroll, open, triggerRef, update])

  return style
}

export type { Align, Side }
