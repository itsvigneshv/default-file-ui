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
import { indexFromPointerY, moveIndex } from "./reorder"

export type SortableItem = { id: string }

export type SortableItemBindings = {
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

export function useSortableList<T extends SortableItem>(options: {
  items: T[]
  onReorder: (items: T[]) => void
  disabled?: boolean
}) {
  const { items, onReorder, disabled = false } = options
  const instructionsId = useId()
  const itemNodes = useRef(new Map<string, HTMLElement>())
  const itemsRef = useRef(items)
  itemsRef.current = items

  const [activeId, setActiveId] = useState<string | null>(null)
  const [keyboardActiveId, setKeyboardActiveId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState("")
  const pointerId = useRef<number | null>(null)
  const pendingToIndex = useRef<number | null>(null)

  const setNode = useCallback((id: string, node: HTMLElement | null) => {
    if (node) itemNodes.current.set(id, node)
    else itemNodes.current.delete(id)
  }, [])

  const announce = useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  useEffect(() => {
    if (pointerId.current === null || !activeId) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      const current = itemsRef.current
      const rects = current
        .filter((item) => item.id !== activeId)
        .map((item) => {
          const node = itemNodes.current.get(item.id)
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
      pendingToIndex.current = indexFromPointerY(event.clientY, rects)
    }

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      const current = itemsRef.current
      const from = current.findIndex((item) => item.id === activeId)
      const to = pendingToIndex.current
      pointerId.current = null
      pendingToIndex.current = null
      setActiveId(null)
      if (from >= 0 && to !== null && to !== from) {
        let insertAt = to
        if (insertAt > from) insertAt -= 1
        onReorder(moveIndex(current, from, insertAt))
        announce(`Moved item to position ${insertAt + 1} of ${current.length}`)
      } else {
        announce("Reorder finished")
      }
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [activeId, announce, onReorder])

  const getItemProps = useCallback(
    (id: string): SortableItemBindings => {
      const index = items.findIndex((item) => item.id === id)
      const isDragging = activeId === id || keyboardActiveId === id
      const reduced = prefersReducedMotion()

      return {
        ref: (node) => setNode(id, node),
        isDragging,
        style: {
          opacity: isDragging ? 0.85 : undefined,
          transform:
            isDragging && activeId === id && !reduced
              ? "scale(1.02)"
              : undefined,
          transition: reduced ? "none" : "transform 120ms ease, opacity 120ms ease",
          touchAction: "none",
          zIndex: isDragging ? 1 : undefined,
        },
        attributes: {
          role: "button",
          tabIndex: disabled ? -1 : 0,
          "aria-roledescription": "sortable",
          "aria-grabbed": isDragging,
          "aria-describedby": instructionsId,
        },
        listeners: {
          onPointerDown: (event) => {
            if (disabled || event.button !== 0) return
            event.preventDefault()
            pointerId.current = event.pointerId
            pendingToIndex.current = index
            setActiveId(id)
            setKeyboardActiveId(null)
            announce(`Picked up item ${index + 1} of ${items.length}`)
            ;(event.currentTarget as HTMLElement).setPointerCapture?.(
              event.pointerId
            )
          },
          onKeyDown: (event) => {
            if (disabled) return
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault()
              if (keyboardActiveId === id) {
                setKeyboardActiveId(null)
                announce("Item dropped")
                return
              }
              setKeyboardActiveId(id)
              setActiveId(null)
              announce(
                "Item grabbed. Use up and down arrows to reorder, Space to drop, Escape to cancel."
              )
              return
            }
            if (keyboardActiveId !== id) return
            if (event.key === "Escape") {
              event.preventDefault()
              setKeyboardActiveId(null)
              announce("Reorder cancelled")
              return
            }
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault()
              const from = items.findIndex((item) => item.id === id)
              if (from < 0) return
              const to = event.key === "ArrowUp" ? from - 1 : from + 1
              if (to < 0 || to >= items.length) return
              onReorder(moveIndex(items, from, to))
              announce(`Moved item to position ${to + 1} of ${items.length}`)
            }
          },
        },
      }
    },
    [
      activeId,
      announce,
      disabled,
      instructionsId,
      items,
      keyboardActiveId,
      onReorder,
      setNode,
    ]
  )

  return {
    activeId: activeId ?? keyboardActiveId,
    getItemProps,
    instructionsId,
    instructions:
      "Press Space or Enter to pick up an item, Arrow keys to move, Space or Enter to drop, Escape to cancel.",
    liveMessage,
  }
}
