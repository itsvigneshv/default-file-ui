"use client"

import * as React from "react"

import { cn } from "../lib/utils"

type ScrollAreaVariant = "default" | "edge"
type ScrollAreaThumbShape = "rounded" | "flat"
type ScrollAreaOrientation = "vertical" | "horizontal" | "both"
type ScrollAreaSide = "left" | "right" | "top" | "bottom"
type ScrollAreaVisibility = "hover" | "always"
type ScrollAreaSpace = "auto" | "none"

type ScrollAreaProps = React.ComponentProps<"div"> & {
  viewportClassName?: string
  variant?: ScrollAreaVariant
  thumbShape?: ScrollAreaThumbShape
  orientation?: ScrollAreaOrientation
  side?: ScrollAreaSide
  visibility?: ScrollAreaVisibility
  /**
   * Track inset. `auto` reserves a gutter so the bar can appear without
   * shifting content. `none` overlays with no inset. Defaults to `none` for
   * edge, `auto` otherwise. Explicit values always win.
   */
  space?: ScrollAreaSpace
  width?: number
}

type ThumbState = { size: number; offset: number; visible: boolean }
const HIDDEN_THUMB: ThumbState = { size: 0, offset: 0, visible: false }

function readCssPx(token: string, fallback: number): number {
  if (typeof document === "undefined") return fallback
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
  const px = Number.parseFloat(raw)
  return Number.isFinite(px) && px > 0 ? px : fallback
}

function trackContentSize(
  track: HTMLElement | null,
  axis: "x" | "y"
): number {
  if (!track) return 0
  const styles = getComputedStyle(track)
  if (axis === "y") {
    return (
      track.clientHeight -
      (parseFloat(styles.paddingTop) || 0) -
      (parseFloat(styles.paddingBottom) || 0)
    )
  }
  return (
    track.clientWidth -
    (parseFloat(styles.paddingLeft) || 0) -
    (parseFloat(styles.paddingRight) || 0)
  )
}

function ScrollArea({
  className,
  children,
  viewportClassName,
  variant = "default",
  thumbShape = "rounded",
  orientation = "vertical",
  side,
  visibility = "hover",
  space,
  width,
  ...props
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const vTrackRef = React.useRef<HTMLDivElement>(null)
  const hTrackRef = React.useRef<HTMLDivElement>(null)
  const vThumbRef = React.useRef<HTMLDivElement>(null)
  const hThumbRef = React.useRef<HTMLDivElement>(null)
  const hideTimerRef = React.useRef<number | null>(null)
  const [vThumb, setVThumb] = React.useState<ThumbState>(HIDDEN_THUMB)
  const [hThumb, setHThumb] = React.useState<ThumbState>(HIDDEN_THUMB)
  const [scrolling, setScrolling] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  const trackVertical = orientation === "vertical" || orientation === "both"
  const trackHorizontal = orientation === "horizontal" || orientation === "both"
  const minThumb =
    variant === "edge"
      ? readCssPx("--df-scrollbar-min-thumb-edge", 20)
      : readCssPx("--df-scrollbar-min-thumb", 24)
  const verticalSide = side === "left" ? "left" : "right"
  const horizontalSide = side === "top" ? "top" : "bottom"
  // Explicit space wins. Edge overlays; other variants reserve a stable inset.
  const resolvedSpace = space ?? (variant === "edge" ? "none" : "auto")

  const syncThumb = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return

    if (trackVertical) {
      const { scrollTop, scrollHeight, clientHeight } = el
      const trackSize = trackContentSize(vTrackRef.current, "y") || clientHeight
      if (scrollHeight > clientHeight + 1 && trackSize > 0) {
        const size = Math.max((clientHeight / scrollHeight) * trackSize, minThumb)
        const maxOffset = Math.max(0, trackSize - size)
        const offset =
          maxOffset === 0
            ? 0
            : (scrollTop / (scrollHeight - clientHeight)) * maxOffset
        setVThumb({ size, offset, visible: true })
      } else {
        setVThumb(HIDDEN_THUMB)
      }
    }

    if (trackHorizontal) {
      const { scrollLeft, scrollWidth, clientWidth } = el
      const trackSize = trackContentSize(hTrackRef.current, "x") || clientWidth
      if (scrollWidth > clientWidth + 1 && trackSize > 0) {
        const size = Math.max((clientWidth / scrollWidth) * trackSize, minThumb)
        const maxOffset = Math.max(0, trackSize - size)
        const offset =
          maxOffset === 0
            ? 0
            : (scrollLeft / (scrollWidth - clientWidth)) * maxOffset
        setHThumb({ size, offset, visible: true })
      } else {
        setHThumb(HIDDEN_THUMB)
      }
    }
  }, [minThumb, trackVertical, trackHorizontal])

  const markScrolling = React.useCallback(() => {
    setScrolling(true)
    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setScrolling(false)
      hideTimerRef.current = null
    }, 900)
  }, [])

  // Measure before paint so overflow state does not shift layout after first frame.
  React.useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    syncThumb()
    const onScroll = () => {
      syncThumb()
      markScrolling()
    }
    const ro = new ResizeObserver(syncThumb)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    if (vTrackRef.current) ro.observe(vTrackRef.current)
    if (hTrackRef.current) ro.observe(hTrackRef.current)
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", onScroll)
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current)
    }
  }, [syncThumb, markScrolling, children])

  const startDrag =
    (axis: "x" | "y") => (event: React.PointerEvent<HTMLDivElement>) => {
      const el = viewportRef.current
      if (!el) return
      event.preventDefault()
      markScrolling()
      const vertical = axis === "y"
      const start = vertical ? event.clientY : event.clientX
      const startScroll = vertical ? el.scrollTop : el.scrollLeft
      const client = vertical ? el.clientHeight : el.clientWidth
      const scrollSize = vertical ? el.scrollHeight : el.scrollWidth
      const thumbSize = vertical ? vThumb.size : hThumb.size
      const trackSize = vertical
        ? (trackContentSize(vTrackRef.current, "y") || client)
        : (trackContentSize(hTrackRef.current, "x") || client)
      const maxScroll = scrollSize - client
      const maxOffset = trackSize - thumbSize

      const onMove = (e: PointerEvent) => {
        if (maxOffset <= 0) return
        markScrolling()
        const delta = (vertical ? e.clientY : e.clientX) - start
        const next = startScroll + (delta / maxOffset) * maxScroll
        if (vertical) el.scrollTop = next
        else el.scrollLeft = next
      }
      const onUp = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    }

  const active = visibility === "always" || hovered || scrolling
  const showVBar = trackVertical && vThumb.visible && active
  const showHBar = trackHorizontal && hThumb.visible && active

  return (
    <div
      data-df="scroll-area"
      data-variant={variant}
      data-thumb-shape={thumbShape}
      data-orientation={orientation}
      data-visibility={visibility}
      data-space={resolvedSpace}
      data-overflow-y={trackVertical && vThumb.visible ? "" : undefined}
      data-overflow-x={trackHorizontal && hThumb.visible ? "" : undefined}
      data-vertical-side={verticalSide}
      data-horizontal-side={horizontalSide}
      className={cn("relative", className)}
      {...props}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        setHovered(true)
      }}
      onMouseLeave={(event) => {
        props.onMouseLeave?.(event)
        setHovered(false)
      }}
    >
      <div
        ref={viewportRef}
        data-df="scroll-area-viewport"
        className={cn(viewportClassName)}
      >
        {children}
      </div>
      {trackVertical && (
        <div
          ref={vTrackRef}
          data-df="scroll-area-scrollbar"
          data-orientation="vertical"
          data-vertical=""
          data-variant={variant}
          data-side={verticalSide}
          aria-hidden={!showVBar}
          style={width != null ? { width } : undefined}
          className={cn(
            "transition-opacity duration-150",
            showVBar ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <div
            ref={vThumbRef}
            data-df="scroll-area-thumb"
            data-variant={variant}
            data-thumb-shape={thumbShape}
            onPointerDown={startDrag("y")}
            style={{
              height: vThumb.size,
              transform: `translateY(${vThumb.offset}px)`,
            }}
          />
        </div>
      )}
      {trackHorizontal && (
        <div
          ref={hTrackRef}
          data-df="scroll-area-scrollbar"
          data-orientation="horizontal"
          data-horizontal=""
          data-variant={variant}
          data-side={horizontalSide}
          aria-hidden={!showHBar}
          style={width != null ? { height: width } : undefined}
          className={cn(
            "transition-opacity duration-150",
            showHBar ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <div
            ref={hThumbRef}
            data-df="scroll-area-thumb"
            data-variant={variant}
            data-thumb-shape={thumbShape}
            onPointerDown={startDrag("x")}
            style={{
              width: hThumb.size,
              transform: `translateX(${hThumb.offset}px)`,
            }}
          />
        </div>
      )}
    </div>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  side,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal"
  side?: ScrollAreaSide
}) {
  const resolvedSide =
    side ?? (orientation === "vertical" ? "right" : "bottom")
  return (
    <div
      data-df="scroll-area-scrollbar"
      data-orientation={orientation}
      data-vertical={orientation === "vertical" ? "" : undefined}
      data-horizontal={orientation === "horizontal" ? "" : undefined}
      data-side={resolvedSide}
      className={cn(className)}
      {...props}
    />
  )
}

export { ScrollArea, ScrollBar }
export type {
  ScrollAreaProps,
  ScrollAreaVariant,
  ScrollAreaThumbShape,
  ScrollAreaOrientation,
  ScrollAreaSide,
  ScrollAreaVisibility,
  ScrollAreaSpace,
}
