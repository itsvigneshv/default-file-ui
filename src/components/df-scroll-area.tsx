"use client"

import * as React from "react"

import { cn } from "../lib/utils"

function ScrollArea({
  className,
  children,
  viewportClassName,
  ...props
}: React.ComponentProps<"div"> & {
  viewportClassName?: string
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const thumbRef = React.useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = React.useState({ size: 0, offset: 0, visible: false })

  const syncThumb = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const overflow = scrollHeight > clientHeight + 1
    if (!overflow) {
      setThumb({ size: 0, offset: 0, visible: false })
      return
    }
    const size = Math.max((clientHeight / scrollHeight) * clientHeight, 24)
    const maxOffset = clientHeight - size
    const offset =
      scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * maxOffset
    setThumb({ size, offset, visible: true })
  }, [])

  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    syncThumb()
    const ro = new ResizeObserver(syncThumb)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    el.addEventListener("scroll", syncThumb, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", syncThumb)
    }
  }, [syncThumb, children])

  const onThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current
    const thumbEl = thumbRef.current
    if (!el || !thumbEl) return
    event.preventDefault()
    const startY = event.clientY
    const startTop = el.scrollTop
    const { scrollHeight, clientHeight } = el
    const maxScroll = scrollHeight - clientHeight
    const maxOffset = clientHeight - thumb.size

    const onMove = (e: PointerEvent) => {
      if (maxOffset <= 0) return
      const delta = e.clientY - startY
      el.scrollTop = startTop + (delta / maxOffset) * maxScroll
    }
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div data-df="scroll-area" className={cn("relative", className)} {...props}>
      <div
        ref={viewportRef}
        data-df="scroll-area-viewport"
        className={cn(viewportClassName)}
      >
        {children}
      </div>
      <div
        data-df="scroll-area-scrollbar"
        data-orientation="vertical"
        data-vertical=""
        aria-hidden={!thumb.visible}
        className={cn(!thumb.visible && "pointer-events-none opacity-0")}
      >
        <div
          ref={thumbRef}
          data-df="scroll-area-thumb"
          onPointerDown={onThumbPointerDown}
          style={{
            height: thumb.size,
            transform: `translateY(${thumb.offset}px)`,
          }}
        />
      </div>
    </div>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal"
}) {
  return (
    <div
      data-df="scroll-area-scrollbar"
      data-orientation={orientation}
      data-vertical={orientation === "vertical" ? "" : undefined}
      data-horizontal={orientation === "horizontal" ? "" : undefined}
      className={cn(className)}
      {...props}
    />
  )
}

export { ScrollArea, ScrollBar }
