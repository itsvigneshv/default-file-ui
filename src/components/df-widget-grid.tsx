"use client"

import * as React from "react"

import { prefersReducedMotion } from "../lib/df-dnd"
import {
  DEFAULT_COLUMNS,
  cellDeltaFromPointer,
  cellMetricsFromGridRect,
  layoutById,
  layoutEquals,
  moveWidget,
  normalizeLayout,
  resizeWidget,
  translateFromCellDelta,
  type WidgetGridCellMetrics,
  type WidgetLayoutItem,
} from "../lib/df-widget-grid"
import { cn } from "../lib/utils"

const DRAG_HANDLE_SELECTOR = "[data-df-widget-drag-handle]"
const DEFAULT_ROW_HEIGHT_PX = 80
const DEFAULT_GAP_PX = 16

export type WidgetGridProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  layout: WidgetLayoutItem[]
  onLayoutChange?: (layout: WidgetLayoutItem[]) => void
  renderWidget: (id: string) => React.ReactNode
  columns?: number
  /** When false, drag, resize, and keyboard edit affordances are disabled. */
  editable?: boolean
  /**
   * Override `--df-widget-grid-row-height` for this instance.
   * Accepts a CSS length such as `5rem` or `80px`.
   */
  minRowHeight?: string
  emptyContent?: React.ReactNode
}

type GestureKind = "move" | "resize-se" | "resize-e" | "resize-s"

type PointerSession = {
  pointerId: number
  kind: GestureKind
  id: string
  origin: WidgetLayoutItem
  startClientX: number
  startClientY: number
  metrics: WidgetGridCellMetrics
}

type GesturePreview = {
  id: string
  kind: GestureKind
  draft: WidgetLayoutItem
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
}

type KeyboardDraft = {
  id: string
  originLayout: WidgetLayoutItem[]
  draftLayout: WidgetLayoutItem[]
}

function readCssPx(token: string, fallback: number): number {
  if (typeof document === "undefined") return fallback
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
  const px = Number.parseFloat(raw)
  return Number.isFinite(px) && px > 0 ? px : fallback
}

function readElementPx(
  element: HTMLElement,
  token: string,
  fallback: number
): number {
  const raw = getComputedStyle(element).getPropertyValue(token).trim()
  const px = Number.parseFloat(raw)
  return Number.isFinite(px) && px > 0 ? px : fallback
}

function captureGridMetrics(
  root: HTMLElement,
  columns: number
): WidgetGridCellMetrics {
  const rect = root.getBoundingClientRect()
  const styles = getComputedStyle(root)
  const gapX =
    Number.parseFloat(styles.columnGap || styles.gap) ||
    readElementPx(root, "--df-widget-grid-gap", DEFAULT_GAP_PX)
  const gapY =
    Number.parseFloat(styles.rowGap || styles.gap) ||
    readElementPx(root, "--df-widget-grid-gap", DEFAULT_GAP_PX)
  const rowHeight = readElementPx(
    root,
    "--df-widget-grid-row-height",
    readCssPx("--df-widget-grid-row-height", DEFAULT_ROW_HEIGHT_PX)
  )
  return cellMetricsFromGridRect({
    width: rect.width,
    columns,
    rowHeight,
    gapX: Number.isFinite(gapX) ? gapX : DEFAULT_GAP_PX,
    gapY: Number.isFinite(gapY) ? gapY : DEFAULT_GAP_PX,
  })
}

function formatWidgetCell(item: WidgetLayoutItem): string {
  return `column ${item.x + 1}, row ${item.y + 1}, ${item.w} by ${item.h}`
}

function applyGestureDelta(
  kind: GestureKind,
  origin: WidgetLayoutItem,
  dx: number,
  dy: number,
  layout: readonly WidgetLayoutItem[],
  columns: number
): WidgetLayoutItem[] {
  if (kind === "move") {
    return moveWidget(layout, origin.id, origin.x + dx, origin.y + dy, columns)
  }
  let nextW = origin.w
  let nextH = origin.h
  if (kind === "resize-e" || kind === "resize-se") nextW = origin.w + dx
  if (kind === "resize-s" || kind === "resize-se") nextH = origin.h + dy
  return resizeWidget(layout, origin.id, nextW, nextH, columns)
}

function previewFromDelta(
  session: PointerSession,
  clientX: number,
  clientY: number,
  layout: readonly WidgetLayoutItem[],
  columns: number
): GesturePreview {
  const deltaPxX = clientX - session.startClientX
  const deltaPxY = clientY - session.startClientY
  const cellDelta = cellDeltaFromPointer(
    deltaPxX,
    deltaPxY,
    session.metrics
  )
  const nextLayout = applyGestureDelta(
    session.kind,
    session.origin,
    cellDelta.dx,
    cellDelta.dy,
    layout,
    columns
  )
  const draft = layoutById(nextLayout).get(session.id) ?? session.origin
  const snapped = translateFromCellDelta(
    {
      dx: draft.x - session.origin.x,
      dy: draft.y - session.origin.y,
    },
    session.metrics
  )

  if (session.kind === "move") {
    return {
      id: session.id,
      kind: session.kind,
      draft,
      translateX: snapped.x,
      translateY: snapped.y,
      scaleX: 1,
      scaleY: 1,
    }
  }

  const originW = Math.max(session.origin.w * session.metrics.colStride, 1)
  const originH = Math.max(session.origin.h * session.metrics.rowStride, 1)
  const nextW = Math.max(draft.w * session.metrics.colStride, 1)
  const nextH = Math.max(draft.h * session.metrics.rowStride, 1)

  return {
    id: session.id,
    kind: session.kind,
    draft,
    translateX: 0,
    translateY: 0,
    scaleX: nextW / originW,
    scaleY: nextH / originH,
  }
}

function WidgetGrid({
  className,
  layout,
  onLayoutChange,
  renderWidget,
  columns = DEFAULT_COLUMNS,
  editable = true,
  minRowHeight,
  emptyContent,
  style,
  "aria-label": ariaLabel = "Widget grid",
  ...props
}: WidgetGridProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const sessionRef = React.useRef<PointerSession | null>(null)
  const previewRef = React.useRef<GesturePreview | null>(null)
  const captureTargetRef = React.useRef<HTMLElement | null>(null)
  const originLayoutRef = React.useRef<WidgetLayoutItem[]>(layout)

  const [liveMessage, setLiveMessage] = React.useState("")
  const [activePointer, setActivePointer] = React.useState(false)
  const [preview, setPreview] = React.useState<GesturePreview | null>(null)
  const [keyboardDraft, setKeyboardDraft] =
    React.useState<KeyboardDraft | null>(null)

  const announce = React.useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  const resolvedColumns = Math.max(1, Math.trunc(columns) || DEFAULT_COLUMNS)

  const baseLayout = React.useMemo(
    () => normalizeLayout(layout, resolvedColumns),
    [layout, resolvedColumns]
  )

  const displayLayout = keyboardDraft?.draftLayout ?? baseLayout
  const displayById = React.useMemo(
    () => layoutById(displayLayout),
    [displayLayout]
  )

  const updatePreview = React.useCallback((next: GesturePreview | null) => {
    previewRef.current = next
    setPreview(next)
  }, [])

  const endPointerSession = React.useCallback(() => {
    const session = sessionRef.current
    if (!session) return null
    const currentPreview = previewRef.current
    const target = captureTargetRef.current
    if (target?.hasPointerCapture?.(session.pointerId)) {
      target.releasePointerCapture(session.pointerId)
    }
    captureTargetRef.current = null
    sessionRef.current = null
    updatePreview(null)
    setActivePointer(false)
    return { session, preview: currentPreview }
  }, [updatePreview])

  const commitLayout = React.useCallback(
    (next: WidgetLayoutItem[], origin: WidgetLayoutItem[]) => {
      const resolved = normalizeLayout(next, resolvedColumns)
      if (layoutEquals(resolved, normalizeLayout(origin, resolvedColumns))) {
        announce("Layout unchanged")
        return
      }
      onLayoutChange?.(resolved)
      announce("Layout updated")
    },
    [announce, onLayoutChange, resolvedColumns]
  )

  React.useEffect(() => {
    if (!activePointer) return
    const session = sessionRef.current
    if (!session) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== session.pointerId) return
      updatePreview(
        previewFromDelta(
          session,
          event.clientX,
          event.clientY,
          originLayoutRef.current,
          resolvedColumns
        )
      )
    }

    const finish = (event: PointerEvent, cancelled: boolean) => {
      if (event.pointerId !== session.pointerId) return
      const ended = endPointerSession()
      if (!ended) return
      if (
        cancelled ||
        !ended.preview ||
        ended.preview.id !== ended.session.id
      ) {
        announce("Widget gesture cancelled")
        return
      }
      const committed =
        ended.session.kind === "move"
          ? moveWidget(
              originLayoutRef.current,
              ended.session.id,
              ended.preview.draft.x,
              ended.preview.draft.y,
              resolvedColumns
            )
          : resizeWidget(
              originLayoutRef.current,
              ended.session.id,
              ended.preview.draft.w,
              ended.preview.draft.h,
              resolvedColumns
            )
      commitLayout(committed, originLayoutRef.current)
    }

    const onUp = (event: PointerEvent) => finish(event, false)
    const onCancel = (event: PointerEvent) => finish(event, true)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      const ended = endPointerSession()
      if (!ended) return
      announce("Widget gesture cancelled")
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [
    activePointer,
    announce,
    commitLayout,
    endPointerSession,
    resolvedColumns,
    updatePreview,
  ])

  const beginPointerGesture = React.useCallback(
    (
      event: React.PointerEvent<HTMLElement>,
      item: WidgetLayoutItem,
      kind: GestureKind
    ) => {
      if (!editable || event.button !== 0) return
      const root = rootRef.current
      if (!root) return
      event.preventDefault()
      event.stopPropagation()

      originLayoutRef.current = baseLayout
      setKeyboardDraft(null)
      const metrics = captureGridMetrics(root, resolvedColumns)
      sessionRef.current = {
        pointerId: event.pointerId,
        kind,
        id: item.id,
        origin: item,
        startClientX: event.clientX,
        startClientY: event.clientY,
        metrics,
      }
      updatePreview({
        id: item.id,
        kind,
        draft: item,
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
      })
      setActivePointer(true)
      announce(
        kind === "move"
          ? `Moving widget at ${formatWidgetCell(item)}`
          : `Resizing widget at ${formatWidgetCell(item)}`
      )
      captureTargetRef.current = event.currentTarget
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    [announce, baseLayout, editable, resolvedColumns, updatePreview]
  )

  const onItemPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, item: WidgetLayoutItem) => {
      if (!editable) return
      const target = event.target
      if (!(target instanceof Element)) return
      const handle = target.closest(DRAG_HANDLE_SELECTOR)
      if (!handle || !event.currentTarget.contains(handle)) return
      beginPointerGesture(event, item, "move")
    },
    [beginPointerGesture, editable]
  )

  const onHandleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>, item: WidgetLayoutItem) => {
      if (!editable) return

      if (event.key === "Escape") {
        if (!keyboardDraft || keyboardDraft.id !== item.id) return
        event.preventDefault()
        setKeyboardDraft(null)
        announce("Widget edit cancelled")
        return
      }

      if (event.key === "Enter") {
        if (!keyboardDraft || keyboardDraft.id !== item.id) return
        event.preventDefault()
        const { originLayout, draftLayout } = keyboardDraft
        setKeyboardDraft(null)
        commitLayout(draftLayout, originLayout)
        return
      }

      const isArrow =
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      if (!isArrow) return
      event.preventDefault()

      const originLayout = keyboardDraft?.originLayout ?? baseLayout
      const liveLayout = keyboardDraft?.draftLayout ?? baseLayout
      const live = layoutById(liveLayout).get(item.id) ?? item

      let nextLayout: WidgetLayoutItem[]
      if (event.shiftKey) {
        const dw =
          event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
        const dh =
          event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0
        nextLayout = resizeWidget(
          liveLayout,
          item.id,
          live.w + dw,
          live.h + dh,
          resolvedColumns
        )
      } else {
        const dx =
          event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
        const dy =
          event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0
        nextLayout = moveWidget(
          liveLayout,
          item.id,
          live.x + dx,
          live.y + dy,
          resolvedColumns
        )
      }

      setKeyboardDraft({
        id: item.id,
        originLayout,
        draftLayout: nextLayout,
      })
      const nextItem = layoutById(nextLayout).get(item.id) ?? live
      announce(
        `${event.shiftKey ? "Resized" : "Moved"} to ${formatWidgetCell(nextItem)}. Press Enter to commit.`
      )
    },
    [
      announce,
      baseLayout,
      commitLayout,
      editable,
      keyboardDraft,
      resolvedColumns,
    ]
  )

  const isEmpty = displayLayout.length === 0
  const reducedMotion = prefersReducedMotion()

  const rootStyle = {
    ...style,
    "--df-widget-grid-columns": String(resolvedColumns),
    ...(minRowHeight
      ? { "--df-widget-grid-row-height": minRowHeight }
      : {}),
  } as React.CSSProperties

  return (
    <div
      {...props}
      ref={rootRef}
      data-df="widget-grid"
      data-editable={editable ? "true" : "false"}
      data-empty={isEmpty ? "true" : undefined}
      data-dragging={activePointer ? "true" : undefined}
      className={cn("df-widget-grid", className)}
      style={rootStyle}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={
        displayLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0) ||
        1
      }
      aria-colcount={resolvedColumns}
    >
      {isEmpty ? (
        <div
          className="df-widget-grid-empty"
          data-df="widget-grid-empty"
          role="status"
        >
          {emptyContent ?? "No widgets"}
        </div>
      ) : (
        displayLayout.map((item) => {
          const activePreview =
            preview?.id === item.id ? preview : null
          const draftItem =
            activePreview?.draft ?? displayById.get(item.id) ?? item
          const ghostItem = activePreview?.draft

          return (
            <React.Fragment key={item.id}>
              <div
                className="df-widget-grid-item"
                data-df="widget-grid-item"
                data-widget-id={item.id}
                data-dragging={activePreview ? "true" : undefined}
                role="gridcell"
                aria-colindex={item.x + 1}
                aria-rowindex={item.y + 1}
                style={{
                  gridColumn: `${item.x + 1} / span ${item.w}`,
                  gridRow: `${item.y + 1} / span ${item.h}`,
                  transform: activePreview
                    ? `translate(${activePreview.translateX}px, ${activePreview.translateY}px) scale(${activePreview.scaleX}, ${activePreview.scaleY})`
                    : undefined,
                  transformOrigin: "top left",
                  transition:
                    activePreview || reducedMotion
                      ? "none"
                      : "transform var(--df-duration-quick) var(--df-ease-standard)",
                }}
                {...(editable
                  ? {
                      onPointerDown: (
                        event: React.PointerEvent<HTMLDivElement>
                      ) => onItemPointerDown(event, item),
                      onKeyDown: (
                        event: React.KeyboardEvent<HTMLDivElement>
                      ) => {
                        const target = event.target
                        if (!(target instanceof Element)) return
                        const onHandle =
                          target.closest(DRAG_HANDLE_SELECTOR) != null ||
                          target.closest(
                            '[data-df="widget-grid-keyboard-handle"]'
                          ) != null
                        if (!onHandle) return
                        onHandleKeyDown(event, item)
                      },
                    }
                  : {})}
              >
                <div className="df-widget-grid-item-body">
                  {renderWidget(item.id)}
                </div>
                {editable ? (
                  <>
                    <button
                      type="button"
                      className="df-widget-grid-keyboard-handle"
                      data-df="widget-grid-keyboard-handle"
                      aria-label={`Move or resize widget at ${formatWidgetCell(draftItem)}`}
                    />
                    <span
                      className="df-widget-grid-resize df-widget-grid-resize-e"
                      data-df="widget-grid-resize"
                      data-edge="e"
                      onPointerDown={(event) =>
                        beginPointerGesture(event, item, "resize-e")
                      }
                    />
                    <span
                      className="df-widget-grid-resize df-widget-grid-resize-s"
                      data-df="widget-grid-resize"
                      data-edge="s"
                      onPointerDown={(event) =>
                        beginPointerGesture(event, item, "resize-s")
                      }
                    />
                    <span
                      className="df-widget-grid-resize df-widget-grid-resize-se"
                      data-df="widget-grid-resize"
                      data-edge="se"
                      onPointerDown={(event) =>
                        beginPointerGesture(event, item, "resize-se")
                      }
                    />
                  </>
                ) : null}
              </div>
              {ghostItem ? (
                <div
                  className="df-widget-grid-ghost"
                  data-df="widget-grid-ghost"
                  aria-hidden
                  style={{
                    gridColumn: `${ghostItem.x + 1} / span ${ghostItem.w}`,
                    gridRow: `${ghostItem.y + 1} / span ${ghostItem.h}`,
                  }}
                />
              ) : null}
            </React.Fragment>
          )
        })
      )}

      <div
        className="df-widget-grid-live"
        data-df="widget-grid-live"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </div>
    </div>
  )
}

export { WidgetGrid }
export type { WidgetLayoutItem }
