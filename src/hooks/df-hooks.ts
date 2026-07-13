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
/** Fixed anchors, or `auto` to pick the fit that stays in view. */
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
  pad: number,
  sideOffset: number,
  contentAware: boolean
): Side {
  if (!contentAware) return preferred

  const space = {
    bottom: vh - pad - (t.bottom + sideOffset),
    top: t.top - pad - sideOffset,
    right: vw - pad - (t.right + sideOffset),
    left: t.left - pad - sideOffset,
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
    // Prefer center on ties so auto feels balanced when space allows.
    const tieBreak = candidate.align === "center" ? -0.1 : 0
    if (score + tieBreak < bestScore) {
      best = candidate.align
      bestScore = score + tieBreak
    }
  }
  return best
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
}: {
  open: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  /** When false, content sizes to itself (tooltips). Default true for menus/popovers. */
  matchTriggerWidth?: boolean
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
    const contentAware = align === "auto"

    const resolvedSide = resolveSide(
      side,
      t,
      c,
      vw,
      vh,
      pad,
      sideOffset,
      contentAware
    )

    const resolvedAlign =
      resolvedSide === "left" || resolvedSide === "right"
        ? pickCrossAlign(align, t, c.height, vh, pad, "y")
        : pickCrossAlign(align, t, c.width, vw, pad, "x")

    let top = 0
    if (resolvedSide === "bottom") top = t.bottom + sideOffset
    if (resolvedSide === "top") top = t.top - c.height - sideOffset
    if (resolvedSide === "left" || resolvedSide === "right") {
      if (resolvedAlign === "start") top = t.top + alignOffset
      if (resolvedAlign === "center")
        top = t.top + t.height / 2 - c.height / 2 + alignOffset
      if (resolvedAlign === "end") top = t.bottom - c.height + alignOffset
    }

    if (top < pad) top = pad
    if (top + c.height > vh - pad) {
      top = Math.max(pad, vh - c.height - pad)
    }

    const base: React.CSSProperties = {
      position: "fixed",
      top,
      ...(matchTriggerWidth ? { minWidth: t.width } : null),
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

    // Top / bottom: pin with left or right so growing content keeps the
    // aligned edge glued to the trigger (end → grows left, not past Export).
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
    if (left < pad) left = pad
    if (left + c.width > vw - pad) {
      left = Math.max(pad, vw - c.width - pad)
    }
    setStyle({ ...base, left, right: "auto" })
  }, [
    align,
    alignOffset,
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

export type { Align, Side }
