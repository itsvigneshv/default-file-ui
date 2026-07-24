"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"

import { prefersReducedMotion } from "./motion"
import {
  indexFromPointerY,
  moveBoardItem,
  type BoardColumn,
} from "./reorder"

export type BoardCard = { id: string }

export type BoardCardBindings = {
  ref: (node: HTMLElement | null) => void
  style: CSSProperties
  isDragging: boolean
  attributes: {
    role: "button"
    tabIndex: number
    "aria-roledescription": string
    "aria-grabbed": boolean
    "aria-describedby": string
  }
  listeners: {
    onPointerDown: (event: ReactPointerEvent) => void
    onKeyDown: (event: KeyboardEvent) => void
  }
}

export type BoardColumnBindings = {
  ref: (node: HTMLElement | null) => void
  "data-df-board-column": string
  "data-df-drop-active": boolean
}

type PendingDrop = {
  columnId: string
  index: number
}

export function useBoardDnd<T extends BoardCard>(options: {
  columns: BoardColumn<T>[]
  onChange: (columns: BoardColumn<T>[]) => void
  disabled?: boolean
}) {
  const { columns, onChange, disabled = false } = options
  const instructionsId = useId()
  const cardNodes = useRef(new Map<string, HTMLElement>())
  const columnNodes = useRef(new Map<string, HTMLElement>())
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [keyboardActiveId, setKeyboardActiveId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState("")
  const pointerId = useRef<number | null>(null)
  const pendingDrop = useRef<PendingDrop | null>(null)

  const announce = useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  const findLocation = useCallback((itemId: string, source = columns) => {
    for (let columnIndex = 0; columnIndex < source.length; columnIndex += 1) {
      const column = source[columnIndex]
      if (!column) continue
      const itemIndex = column.items.findIndex((item) => item.id === itemId)
      if (itemIndex >= 0) {
        return { columnId: column.id, columnIndex, itemIndex }
      }
    }
    return null
  }, [columns])

  const setCardNode = useCallback((id: string, node: HTMLElement | null) => {
    if (node) cardNodes.current.set(id, node)
    else cardNodes.current.delete(id)
  }, [])

  const setColumnNode = useCallback((id: string, node: HTMLElement | null) => {
    if (node) columnNodes.current.set(id, node)
    else columnNodes.current.delete(id)
  }, [])

  const columnFromPoint = useCallback((clientX: number, clientY: number) => {
    for (const [columnId, node] of columnNodes.current) {
      const rect = node.getBoundingClientRect()
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return columnId
      }
    }
    return null
  }, [])

  useEffect(() => {
    if (pointerId.current === null || !activeId) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      const current = columnsRef.current
      const columnId = columnFromPoint(event.clientX, event.clientY)
      if (!columnId) return
      setOverColumnId(columnId)
      const column = current.find((entry) => entry.id === columnId)
      if (!column) return
      const rects = column.items
        .filter((item) => item.id !== activeId)
        .map((item) => {
          const node = cardNodes.current.get(item.id)
          if (!node) return null
          const rect = node.getBoundingClientRect()
          return {
            id: item.id,
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height,
          }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      pendingDrop.current = {
        columnId,
        index: indexFromPointerY(event.clientY, rects),
      }
    }

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      const current = columnsRef.current
      const drop = pendingDrop.current
      pointerId.current = null
      pendingDrop.current = null
      setActiveId(null)
      setOverColumnId(null)
      if (!drop) {
        announce("Board move finished")
        return
      }
      const location = findLocation(activeId, current)
      if (!location) return
      if (location.columnId === drop.columnId && location.itemIndex === drop.index) {
        announce("Board move finished")
        return
      }
      onChange(moveBoardItem(current, activeId, drop.columnId, drop.index))
      announce(`Moved card to column ${drop.columnId}, position ${drop.index + 1}`)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [activeId, announce, columnFromPoint, findLocation, onChange])

  const getColumnProps = useCallback(
    (columnId: string): BoardColumnBindings => ({
      ref: (node) => setColumnNode(columnId, node),
      "data-df-board-column": columnId,
      "data-df-drop-active": overColumnId === columnId,
    }),
    [overColumnId, setColumnNode]
  )

  const getCardProps = useCallback(
    (id: string): BoardCardBindings => {
      const location = findLocation(id)
      const isDragging = activeId === id || keyboardActiveId === id
      const reduced = prefersReducedMotion()

      return {
        ref: (node) => setCardNode(id, node),
        isDragging,
        style: {
          opacity: isDragging ? 0.9 : undefined,
          transform:
            isDragging && activeId === id && !reduced
              ? "scale(1.02)"
              : undefined,
          transition: reduced ? "none" : "transform 120ms ease, opacity 120ms ease",
          touchAction: "none",
          zIndex: isDragging ? 2 : undefined,
        },
        attributes: {
          role: "button",
          tabIndex: disabled ? -1 : 0,
          "aria-roledescription": "board card",
          "aria-grabbed": isDragging,
          "aria-describedby": instructionsId,
        },
        listeners: {
          onPointerDown: (event) => {
            if (disabled || event.button !== 0) return
            event.preventDefault()
            pointerId.current = event.pointerId
            pendingDrop.current = location
              ? { columnId: location.columnId, index: location.itemIndex }
              : null
            setActiveId(id)
            setKeyboardActiveId(null)
            setOverColumnId(location?.columnId ?? null)
            announce("Picked up board card")
            ;(event.currentTarget as HTMLElement).setPointerCapture?.(
              event.pointerId
            )
          },
          onKeyDown: (event) => {
            if (disabled || !location) return
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault()
              if (keyboardActiveId === id) {
                setKeyboardActiveId(null)
                announce("Card dropped")
                return
              }
              setKeyboardActiveId(id)
              setActiveId(null)
              announce(
                "Card grabbed. Arrow keys move within or across columns. Space drops. Escape cancels."
              )
              return
            }
            if (keyboardActiveId !== id) return
            if (event.key === "Escape") {
              event.preventDefault()
              setKeyboardActiveId(null)
              announce("Board move cancelled")
              return
            }
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault()
              const delta = event.key === "ArrowUp" ? -1 : 1
              const toIndex = location.itemIndex + delta
              if (toIndex < 0) return
              onChange(
                moveBoardItem(columns, id, location.columnId, toIndex)
              )
              announce(`Moved within column to position ${toIndex + 1}`)
              return
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault()
              const columnDelta = event.key === "ArrowLeft" ? -1 : 1
              const nextColumn = columns[location.columnIndex + columnDelta]
              if (!nextColumn) return
              const toIndex = Math.min(
                location.itemIndex,
                nextColumn.items.length
              )
              onChange(moveBoardItem(columns, id, nextColumn.id, toIndex))
              announce(`Moved card to column ${nextColumn.id}`)
            }
          },
        },
      }
    },
    [
      activeId,
      announce,
      columns,
      disabled,
      findLocation,
      instructionsId,
      keyboardActiveId,
      onChange,
      setCardNode,
    ]
  )

  return {
    activeId: activeId ?? keyboardActiveId,
    overColumnId,
    getCardProps,
    getColumnProps,
    instructionsId,
    instructions:
      "Press Space or Enter to pick up a card. Arrow keys move it. Space or Enter drops. Escape cancels.",
    liveMessage,
  }
}
