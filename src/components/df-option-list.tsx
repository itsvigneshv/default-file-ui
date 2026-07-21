"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { SearchInput } from "./df-search-input"
import { ScrollArea } from "./df-scroll-area"
import {
  DISMISS_NESTED_LAYER_SELECTORS,
  useAnchoredPosition,
  useControllableState,
  useDismiss,
  useIsClient,
} from "../hooks"
import { cn } from "../lib/utils"

type SelectionMode = "single" | "multiple"
type OptionListItemLayout = "inline" | "stacked"

type OptionListContextValue = {
  selectionMode: SelectionMode
  value: string | null
  values: string[]
  setValue: (value: string | null) => void
  toggleValue: (value: string) => void
  isSelected: (value: string) => boolean
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  listboxId: string
  activeValue: string | null
  setActiveValue: (value: string | null) => void
  optionDomId: (value: string) => string
  labelFor: (value: string | null) => React.ReactNode
  secondaryFor: (value: string | null) => React.ReactNode | null
  layoutFor: (value: string | null) => OptionListItemLayout
  registerLabel: (value: string, label: React.ReactNode) => void
  registerSecondary: (
    value: string,
    secondary: React.ReactNode | null | undefined,
    layout?: OptionListItemLayout
  ) => void
  closeOnSelect: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  submenuAnimated: boolean
  submenuOpenDuration: number
  submenuCloseDuration: number
}

const OptionListContext = React.createContext<OptionListContextValue | null>(
  null
)

function useOptionListContext() {
  const ctx = React.useContext(OptionListContext)
  if (!ctx) {
    throw new Error("Option List parts must be used within OptionList")
  }
  return ctx
}

const DEFAULT_SUBMENU_OPEN_DURATION = 180
const DEFAULT_SUBMENU_CLOSE_DURATION = 90

type OptionListSubmenuMotion = {
  animated: boolean
  openDuration: number
  closeDuration: number
}

type OptionListSubmenuState = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  cancelClose: () => void
  scheduleClose: () => void
  motion: OptionListSubmenuMotion
}

const OptionListSubmenuStateContext =
  React.createContext<OptionListSubmenuState | null>(null)
const OptionListSubmenuTriggerZoneContext = React.createContext(false)

type OptionListSubmenuProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  animated?: boolean
  openDuration?: number
  closeDuration?: number
  closeDelay?: number
  children: React.ReactNode
}

function OptionListSubmenu({
  open,
  defaultOpen = false,
  onOpenChange,
  animated,
  openDuration,
  closeDuration,
  closeDelay = 60,
  children,
}: OptionListSubmenuProps) {
  const root = useOptionListContext()
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const motion = React.useMemo<OptionListSubmenuMotion>(
    () => ({
      animated: animated ?? root.submenuAnimated,
      openDuration: openDuration ?? root.submenuOpenDuration,
      closeDuration: closeDuration ?? root.submenuCloseDuration,
    }),
    [
      animated,
      closeDuration,
      openDuration,
      root.submenuAnimated,
      root.submenuCloseDuration,
      root.submenuOpenDuration,
    ]
  )

  const cancelClose = React.useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsOpen(true)
  }, [setIsOpen])

  const scheduleClose = React.useCallback(() => {
    if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      closeTimerRef.current = null
    }, closeDelay)
  }, [closeDelay, setIsOpen])

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const state = React.useMemo(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerRef,
      cancelClose,
      scheduleClose,
      motion,
    }),
    [cancelClose, isOpen, motion, scheduleClose, setIsOpen]
  )

  return (
    <OptionListSubmenuStateContext.Provider value={state}>
      <OptionListSubmenuTriggerZoneContext.Provider value={true}>
        <div
          data-df="option-list-submenu"
          data-state={isOpen ? "open" : "closed"}
          data-animated={motion.animated ? "true" : "false"}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {children}
        </div>
      </OptionListSubmenuTriggerZoneContext.Provider>
    </OptionListSubmenuStateContext.Provider>
  )
}

type OptionListSubContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end" | "auto"
  alignOffset?: number
  portal?: boolean
  animated?: boolean
  openDuration?: number
  closeDuration?: number
}

function OptionListSubContent({
  className,
  children,
  side = "right",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  portal = true,
  animated,
  openDuration,
  closeDuration,
  onAnimationEnd,
  ...props
}: OptionListSubContentProps) {
  const submenu = React.useContext(OptionListSubmenuStateContext)
  if (!submenu) {
    throw new Error("OptionListSubContent must be used within OptionListSubmenu")
  }

  const { open, setOpen, triggerRef, motion: submenuMotion } = submenu
  const motion: OptionListSubmenuMotion = {
    animated: animated ?? submenuMotion.animated,
    openDuration: openDuration ?? submenuMotion.openDuration,
    closeDuration: closeDuration ?? submenuMotion.closeDuration,
  }

  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [present, setPresent] = React.useState(open)
  const placement = useAnchoredPosition({
    open: present && portal,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
  })

  useDismiss(open && portal, () => setOpen(false), [triggerRef, contentRef], {
    excludeSelectors: DISMISS_NESTED_LAYER_SELECTORS,
  })

  React.useEffect(() => {
    if (open) {
      setPresent(true)
      return
    }
    if (!present) return
    if (!motion.animated) {
      setPresent(false)
      return
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) setPresent(false)
  }, [motion.animated, open, present])

  const mounted = useIsClient()
  if (!mounted || !present) return null

  const motionStyle = {
    ["--df-submenu-open-duration" as string]: `${motion.openDuration}ms`,
    ["--df-submenu-close-duration" as string]: `${motion.closeDuration}ms`,
  }

  const panel = (
    <OptionListSubmenuTriggerZoneContext.Provider value={false}>
      <div
        {...props}
        ref={contentRef}
        role="menu"
        data-df="option-list-content"
        data-submenu=""
        data-side={placement.side}
        data-align={placement.align}
        data-state={open ? "open" : "closed"}
        data-animated={motion.animated ? "true" : "false"}
        data-portal={portal ? "true" : "false"}
        className={cn(className)}
        style={
          portal
            ? {
                ...placement.style,
                ...motionStyle,
                width: "max-content",
                maxWidth:
                  "min(calc(100vw - 4 * var(--spacing-unit, 0.25rem)), var(--df-max-w-sm))",
              }
            : {
                ...motionStyle,
                position: "absolute",
                left: `calc(100% + ${sideOffset}px)`,
                top: alignOffset,
                zIndex: "var(--z-toast)",
                width: "max-content",
                minWidth: "var(--df-menu-min-width)",
              }
        }
        onMouseEnter={submenu.cancelClose}
        onMouseLeave={submenu.scheduleClose}
        onAnimationEnd={(event) => {
          onAnimationEnd?.(event)
          if (event.target !== event.currentTarget) return
          if (!open) setPresent(false)
        }}
      >
        {children}
      </div>
    </OptionListSubmenuTriggerZoneContext.Provider>
  )

  if (!portal) return panel
  return createPortal(panel, document.body)
}

type OptionListProps = {
  selectionMode?: SelectionMode
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeOnSelect?: boolean
  submenuAnimated?: boolean
  submenuOpenDuration?: number
  submenuCloseDuration?: number
  children: React.ReactNode
}

function OptionList({
  selectionMode = "single",
  value,
  defaultValue = null,
  onValueChange,
  values,
  defaultValues = [],
  onValuesChange,
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect,
  submenuAnimated = true,
  submenuOpenDuration = DEFAULT_SUBMENU_OPEN_DURATION,
  submenuCloseDuration = DEFAULT_SUBMENU_CLOSE_DURATION,
  children,
}: OptionListProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [currentValues, setCurrentValues] = useControllableState({
    value: values,
    defaultValue: defaultValues,
    onChange: onValuesChange,
  })
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeValue, setActiveValue] = React.useState<string | null>(null)
  const [, setLabelsVersion] = React.useState(0)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const reactId = React.useId()
  const listboxId = `df-option-list-${reactId.replace(/:/g, "")}`
  const optionDomId = React.useCallback(
    (itemValue: string) =>
      `${listboxId}-opt-${itemValue.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    [listboxId]
  )
  const labels = React.useRef(new Map<string, React.ReactNode>())
  const secondaries = React.useRef(new Map<string, React.ReactNode | null>())
  const layouts = React.useRef(new Map<string, OptionListItemLayout>())

  const resolvedCloseOnSelect =
    closeOnSelect ?? selectionMode === "single"

  const registerLabel = React.useCallback(
    (itemValue: string, label: React.ReactNode) => {
      if (labels.current.get(itemValue) === label) return
      labels.current.set(itemValue, label)
      setLabelsVersion((n) => n + 1)
    },
    []
  )

  const registerSecondary = React.useCallback(
    (
      itemValue: string,
      secondary: React.ReactNode | null | undefined,
      layout: OptionListItemLayout = "inline"
    ) => {
      const nextSecondary = secondary ?? null
      const nextLayout = nextSecondary == null ? "inline" : layout
      const secondaryUnchanged =
        secondaries.current.get(itemValue) === nextSecondary
      const layoutUnchanged = layouts.current.get(itemValue) === nextLayout
      if (secondaryUnchanged && layoutUnchanged) return
      secondaries.current.set(itemValue, nextSecondary)
      layouts.current.set(itemValue, nextLayout)
      setLabelsVersion((n) => n + 1)
    },
    []
  )

  const labelFor = React.useCallback((itemValue: string | null) => {
    if (!itemValue) return null
    return labels.current.get(itemValue) ?? itemValue
  }, [])

  const secondaryFor = React.useCallback((itemValue: string | null) => {
    if (!itemValue) return null
    return secondaries.current.get(itemValue) ?? null
  }, [])

  const layoutFor = React.useCallback((itemValue: string | null) => {
    if (!itemValue) return "inline" as const
    return layouts.current.get(itemValue) ?? "inline"
  }, [])

  const isSelected = React.useCallback(
    (itemValue: string) => {
      if (selectionMode === "multiple") {
        return currentValues.includes(itemValue)
      }
      return current === itemValue
    },
    [current, currentValues, selectionMode]
  )

  const toggleValue = React.useCallback(
    (itemValue: string) => {
      if (selectionMode === "multiple") {
        setCurrentValues(
          currentValues.includes(itemValue)
            ? currentValues.filter((v) => v !== itemValue)
            : [...currentValues, itemValue]
        )
        return
      }
      setCurrent(itemValue)
    },
    [currentValues, selectionMode, setCurrent, setCurrentValues]
  )

  return (
    <OptionListContext.Provider
      value={{
        selectionMode,
        value: current,
        values: currentValues,
        setValue: setCurrent,
        toggleValue,
        isSelected,
        open: isOpen,
        setOpen: setIsOpen,
        triggerRef,
        listboxId,
        activeValue,
        setActiveValue,
        optionDomId,
        labelFor,
        secondaryFor,
        layoutFor,
        registerLabel,
        registerSecondary,
        closeOnSelect: resolvedCloseOnSelect,
        searchQuery,
        setSearchQuery,
        submenuAnimated,
        submenuOpenDuration,
        submenuCloseDuration,
      }}
    >
      <div data-df="option-list">{children}</div>
    </OptionListContext.Provider>
  )
}

function OptionListTrigger({
  className,
  children,
  render,
  onClick,
  onKeyDown,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  render?: React.ReactElement
}) {
  const { open, setOpen, triggerRef, listboxId } = useOptionListContext()

  const toggleOpen = () => setOpen(!open)

  const onTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>)
    if (event.defaultPrevented) return
    toggleOpen()
  }

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>)
    if (event.defaultPrevented) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleOpen()
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (!open) setOpen(true)
    }
    if (event.key === "Escape" && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  if (render) {
    return React.cloneElement(render, {
      ...props,
      ref: triggerRef as React.Ref<HTMLElement>,
      "data-df-option-list-trigger": "",
      "aria-expanded": open,
      "aria-haspopup": "listbox",
      "aria-controls": open ? listboxId : undefined,
      role: (render.props as { role?: string }).role ?? "button",
      tabIndex: (render.props as { tabIndex?: number }).tabIndex ?? 0,
      className: cn(
        className,
        (render.props as { className?: string }).className
      ),
      onClick: onTriggerClick,
      onKeyDown: onTriggerKeyDown,
      children:
        children ?? (render.props as { children?: React.ReactNode }).children,
    } as never)
  }

  return (
    <button
      type="button"
      className={cn(className)}
      {...props}
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      data-df="option-list-trigger"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={open ? listboxId : undefined}
      onClick={onTriggerClick}
      onKeyDown={onTriggerKeyDown}
    >
      {children}
    </button>
  )
}

function OptionListGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-df="option-list-group"
      className={cn("p-1", className)}
      {...props}
    />
  )
}

type OptionListSearchProps = Omit<
  React.ComponentProps<typeof SearchInput>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function OptionListSearch({
  className,
  placeholder = "Search",
  value,
  defaultValue,
  onValueChange,
  size = "sm",
  clearable = true,
  ...props
}: OptionListSearchProps) {
  const { searchQuery, setSearchQuery } = useOptionListContext()
  const isControlled = value !== undefined
  const current = isControlled ? value : searchQuery

  React.useEffect(() => {
    if (defaultValue == null || isControlled) return
    setSearchQuery(defaultValue)
  }, [defaultValue, isControlled, setSearchQuery])

  function commit(next: string) {
    setSearchQuery(next)
    onValueChange?.(next)
  }

  return (
    <div data-df="option-list-search" className={cn(className)}>
      <SearchInput
        size={size}
        clearable={clearable}
        placeholder={placeholder}
        value={current}
        onChange={(event) => commit(event.target.value)}
        onClear={() => commit("")}
        {...props}
      />
    </div>
  )
}

type OptionListBodyProps = React.ComponentProps<"div"> & {
  scrollable?: boolean
  maxHeight?: string | number
  /** Space on each side of the scrollbar thumb, in pixels. */
  scrollThumbGap?: number
}

function OptionListBody({
  className,
  children,
  scrollable = false,
  maxHeight = "var(--df-menu-stacked-max-height)",
  scrollThumbGap,
  style,
  ...props
}: OptionListBodyProps) {
  const gapStyle =
    scrollThumbGap != null
      ? ({
          "--df-option-list-scroll-thumb-gap": `${scrollThumbGap}px`,
        } as React.CSSProperties)
      : undefined

  if (scrollable) {
    return (
      <div
        data-df="option-list-body"
        data-scrollable=""
        className={cn("min-h-0", className)}
        {...props}
        style={{ ...gapStyle, ...style }}
      >
        <ScrollArea visibility="always" style={{ maxHeight }}>
          {children}
        </ScrollArea>
      </div>
    )
  }

  return (
    <div
      data-df="option-list-body"
      className={cn(className)}
      {...props}
      style={style}
    >
      {children}
    </div>
  )
}

function OptionListFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-df="option-list-footer" className={cn(className)} {...props}>
      {children}
    </div>
  )
}

type OptionListContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end" | "auto"
  alignOffset?: number
  alignItemWithTrigger?: boolean
  portal?: boolean
  dismissOnScroll?: boolean
  search?: boolean
  searchPlaceholder?: string
  searchValue?: string
  defaultSearchValue?: string
  onSearchChange?: (value: string) => void
  scrollable?: boolean
  scrollMaxHeight?: string | number
  /** Space on each side of the scrollbar thumb, in pixels. */
  scrollThumbGap?: number
  footer?: React.ReactNode
}

function containsSubmenu(node: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(node, (child) => {
    if (found || !React.isValidElement(child)) return
    if (child.type === OptionListSubmenu) {
      found = true
      return
    }
    const nested = (child.props as { children?: React.ReactNode }).children
    if (nested != null && containsSubmenu(nested)) found = true
  })
  return found
}

function scrollSelectedIntoListViewport(
  selected: HTMLElement,
  root: HTMLElement
) {
  const body = root.querySelector<HTMLElement>(
    '[data-df="option-list-body"][data-scrollable]'
  )
  if (!body || !body.contains(selected)) return

  const viewport = body.querySelector<HTMLElement>(
    '[data-df="scroll-area-viewport"]'
  )
  if (!viewport) return

  const itemRect = selected.getBoundingClientRect()
  const portRect = viewport.getBoundingClientRect()
  if (itemRect.top < portRect.top) {
    viewport.scrollTop -= portRect.top - itemRect.top
  } else if (itemRect.bottom > portRect.bottom) {
    viewport.scrollTop += itemRect.bottom - portRect.bottom
  }
}

function navigableOptions(root: HTMLElement): HTMLElement[] {
  const items = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-df="option-list-item"]:not([data-disabled])'
    )
  )
  return items.filter(
    (item) => item.closest('[data-df="option-list-content"]') === root
  )
}

function optionText(item: HTMLElement): string {
  const label = item.querySelector<HTMLElement>(
    '[data-df="option-list-item-label"]'
  )
  return (label?.textContent ?? item.textContent ?? "").trim().toLowerCase()
}

function OptionListContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  portal = true,
  dismissOnScroll = true,
  search = false,
  searchPlaceholder = "Search",
  searchValue,
  defaultSearchValue,
  onSearchChange,
  scrollable,
  scrollMaxHeight,
  scrollThumbGap,
  footer,
  ...props
}: OptionListContentProps) {
  const {
    open,
    setOpen,
    triggerRef,
    listboxId,
    activeValue,
    setActiveValue,
    optionDomId,
    value,
    values,
  } = useOptionListContext()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const typeaheadRef = React.useRef<{ query: string; timer: number | null }>({
    query: "",
    timer: null,
  })
  const placement = useAnchoredPosition({
    open: open && portal,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
    matchTriggerWidth: alignItemWithTrigger,
  })

  useDismiss(open && portal, () => setOpen(false), [triggerRef, contentRef], {
    excludeSelectors: DISMISS_NESTED_LAYER_SELECTORS,
    dismissOnScroll,
  })

  const mounted = useIsClient()
  const hasSubmenu = React.useMemo(() => containsSubmenu(children), [children])
  const wrapInScrollArea = scrollable ?? !hasSubmenu
  const stacked = search || footer != null
  const effectiveMaxHeight =
    scrollMaxHeight ??
    (stacked
      ? "var(--df-menu-stacked-max-height)"
      : "min(60vh, var(--df-menu-max-height))")

  // Keep list order; reveal the selected option in the list scrollport.
  React.useLayoutEffect(() => {
    if (!open || !mounted) return
    const root = contentRef.current
    if (!root) return
    const selected = root.querySelector<HTMLElement>(
      '[data-df="option-list-item"][data-state="selected"]'
    )
    if (!selected) return
    scrollSelectedIntoListViewport(selected, root)
  }, [open, mounted])

  const moveActiveTo = React.useCallback(
    (item: HTMLElement | undefined) => {
      if (!item) return
      const next = item.getAttribute("data-value")
      if (next == null) return
      setActiveValue(next)
      const root = contentRef.current
      if (root) scrollSelectedIntoListViewport(item, root)
      else item.scrollIntoView({ block: "nearest" })
    },
    [setActiveValue]
  )

  // Set the initial active option and move focus into the list on open.
  // The guard keeps focus stable while selections change during interaction.
  const initializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!open || !mounted || !portal) {
      initializedRef.current = false
      return
    }
    if (initializedRef.current) return
    initializedRef.current = true
    const root = contentRef.current
    if (!root) return
    const items = navigableOptions(root)
    const preferred = value ?? values[0] ?? null
    const initial =
      items.find((item) => item.getAttribute("data-value") === preferred) ??
      items[0]
    setActiveValue(initial?.getAttribute("data-value") ?? null)
    const searchInput = root.querySelector<HTMLInputElement>(
      '[data-df="option-list-search"] input'
    )
    if (searchInput) searchInput.focus()
    else root.focus()
    if (initial) scrollSelectedIntoListViewport(initial, root)
  }, [open, mounted, portal, setActiveValue, value, values])

  // Return focus to the trigger when the list closes by keyboard or selection.
  const wasOpenRef = React.useRef(false)
  React.useEffect(() => {
    if (!portal) return
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    setActiveValue(null)
    const active = document.activeElement
    if (active == null || active === document.body) {
      triggerRef.current?.focus?.()
    }
  }, [open, portal, setActiveValue, triggerRef])

  React.useEffect(() => {
    const typeahead = typeaheadRef.current
    return () => {
      if (typeahead.timer != null) window.clearTimeout(typeahead.timer)
    }
  }, [])

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented) return
    const root = contentRef.current
    if (!root) return
    const items = navigableOptions(root)
    if (items.length === 0) return

    const inSearch = Boolean(
      (event.target as HTMLElement | null)?.closest(
        '[data-df="option-list-search"]'
      )
    )
    const currentIndex = items.findIndex(
      (item) => item.getAttribute("data-value") === activeValue
    )

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const base = currentIndex === -1 ? -1 : currentIndex
      moveActiveTo(items[(base + 1 + items.length) % items.length])
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      const base = currentIndex === -1 ? 0 : currentIndex
      moveActiveTo(items[(base - 1 + items.length) % items.length])
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      moveActiveTo(items[0])
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      moveActiveTo(items[items.length - 1])
      return
    }
    if (event.key === "Enter" || (event.key === " " && !inSearch)) {
      if (currentIndex === -1) return
      event.preventDefault()
      items[currentIndex]?.click()
      return
    }
    if (event.key === "ArrowRight" && currentIndex !== -1) {
      const item = items[currentIndex]
      if (item.getAttribute("data-submenu-trigger") != null) {
        event.preventDefault()
        item.click()
      }
      return
    }

    if (
      inSearch ||
      event.key.length !== 1 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      return
    }
    const typeahead = typeaheadRef.current
    if (typeahead.timer != null) window.clearTimeout(typeahead.timer)
    typeahead.query += event.key.toLowerCase()
    const query = typeahead.query
    const match =
      items.find((item) => optionText(item).startsWith(query)) ??
      items.find((item) => optionText(item).includes(query))
    if (match) {
      event.preventDefault()
      moveActiveTo(match)
    }
    typeahead.timer = window.setTimeout(() => {
      typeahead.query = ""
      typeahead.timer = null
    }, 500)
  }

  if (!mounted) {
    return (
      <div hidden aria-hidden data-df="option-list-label-registry">
        {children}
      </div>
    )
  }

  if (!open) {
    return (
      <div hidden aria-hidden>
        {children}
      </div>
    )
  }

  const body = (
    <OptionListBody
      scrollable={wrapInScrollArea}
      maxHeight={effectiveMaxHeight}
      scrollThumbGap={scrollThumbGap}
    >
      {children}
    </OptionListBody>
  )

  const panel = (
    <div
      ref={contentRef}
      role="listbox"
      id={listboxId}
      tabIndex={-1}
      aria-activedescendant={
        activeValue != null ? optionDomId(activeValue) : undefined
      }
      data-df="option-list-content"
      data-side={placement.side}
      data-align={placement.align}
      data-align-trigger={alignItemWithTrigger ? "true" : "false"}
      data-portal={portal ? "true" : "false"}
      data-stacked={stacked ? "true" : undefined}
      data-scroll={wrapInScrollArea ? "kit" : undefined}
      className={cn(className)}
      style={
        portal
          ? {
              ...placement.style,
              ...(alignItemWithTrigger
                ? null
                : {
                    // Hug the longest option. Use alignItemWithTrigger to match the field.
                    width: "max-content",
                    minWidth: "var(--df-menu-min-width)",
                    maxWidth:
                      "min(calc(100vw - 4 * var(--spacing-unit, 0.25rem)), var(--df-max-w-sm))",
                  }),
            }
          : {
              position: "relative",
              width: alignItemWithTrigger ? "100%" : "max-content",
              minWidth:
                stacked && !alignItemWithTrigger
                  ? "var(--df-submenu-min-width)"
                  : "var(--df-menu-min-width)",
            }
      }
      {...props}
      onKeyDown={handleListKeyDown}
    >
      {search ? (
        <OptionListSearch
          placeholder={searchPlaceholder}
          value={searchValue}
          defaultValue={defaultSearchValue}
          onValueChange={onSearchChange}
        />
      ) : null}
      {body}
      {footer != null ? <OptionListFooter>{footer}</OptionListFooter> : null}
    </div>
  )

  if (!portal) return panel

  return createPortal(panel, document.body)
}

function OptionListLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="option-list-label"
      className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

type OptionListItemLeading = "checkbox" | "check" | React.ReactNode | false

type OptionListItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
  leading?: OptionListItemLeading
  secondary?: React.ReactNode
  layout?: OptionListItemLayout
  trailing?: React.ReactNode
  indicator?: boolean
}

function optionLabelText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(optionLabelText).join(" ")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return optionLabelText(node.props.children)
  }
  return ""
}

function OptionListItem({
  className,
  children,
  value,
  disabled,
  leading,
  secondary,
  layout = "inline",
  trailing,
  indicator,
  id: idProp,
  onClick,
  onMouseEnter,
  ...props
}: OptionListItemProps) {
  const {
    isSelected,
    toggleValue,
    setOpen,
    setActiveValue,
    registerLabel,
    registerSecondary,
    closeOnSelect,
    searchQuery,
    selectionMode,
    activeValue,
    optionDomId,
  } = useOptionListContext()
  const submenu = React.useContext(OptionListSubmenuStateContext)
  const inTriggerZone = React.useContext(OptionListSubmenuTriggerZoneContext)
  const isSubmenuTrigger = Boolean(submenu && inTriggerZone)

  const selected = isSelected(value)
  const keyboardActive = !disabled && !isSubmenuTrigger && activeValue === value
  const showCheckbox = leading === "checkbox"
  const showTrailingIndicator =
    indicator ??
    (!showCheckbox &&
      selectionMode === "single" &&
      trailing == null &&
      !isSubmenuTrigger)
  const copyLayout = secondary != null ? layout : "inline"
  const dataHighlighted = (props as { "data-highlighted"?: string })[
    "data-highlighted"
  ]
  const highlighted =
    (isSubmenuTrigger && submenu?.open) || dataHighlighted != null

  React.useLayoutEffect(() => {
    registerLabel(value, children)
    registerSecondary(value, secondary, copyLayout)
  }, [children, copyLayout, registerLabel, registerSecondary, secondary, value])

  const query = searchQuery.trim().toLowerCase()
  if (query) {
    const haystack =
      `${optionLabelText(children)} ${optionLabelText(secondary)} ${optionLabelText(trailing)}`
        .toLowerCase()
        .trim()
    if (!haystack.includes(query)) return null
  }

  let leadingNode: React.ReactNode = null
  if (leading === "checkbox") {
    leadingNode = (
      <span
        data-df="option-list-checkbox"
        data-state={selected ? "checked" : "unchecked"}
        aria-hidden
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    )
  } else if (leading === "check") {
    leadingNode = selected ? (
      <Check className="size-4 shrink-0" aria-hidden />
    ) : (
      <span className="size-4 shrink-0" aria-hidden />
    )
  } else if (leading != null && leading !== false) {
    leadingNode = (
      <span data-df="option-list-item-leading" aria-hidden>
        {leading}
      </span>
    )
  }

  const setItemRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (isSubmenuTrigger && submenu) {
        submenu.triggerRef.current = node
      }
    },
    [isSubmenuTrigger, submenu]
  )

  return (
    <div
      {...props}
      ref={setItemRef}
      id={idProp ?? (isSubmenuTrigger ? undefined : optionDomId(value))}
      role={isSubmenuTrigger ? "menuitem" : "option"}
      aria-selected={isSubmenuTrigger ? undefined : selected}
      aria-haspopup={isSubmenuTrigger ? "menu" : undefined}
      aria-expanded={isSubmenuTrigger ? submenu?.open : undefined}
      data-df="option-list-item"
      data-value={value}
      data-active={keyboardActive ? "" : undefined}
      data-state={
        isSubmenuTrigger
          ? submenu?.open
            ? "open"
            : "idle"
          : selected
            ? "selected"
            : "idle"
      }
      data-layout={copyLayout}
      data-disabled={disabled ? "" : undefined}
      data-leading={showCheckbox ? "checkbox" : leading ? "custom" : undefined}
      data-trailing={trailing != null ? "" : undefined}
      data-submenu-trigger={isSubmenuTrigger ? "" : undefined}
      data-highlighted={highlighted ? "" : undefined}
      className={cn(className)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event)
        if (!disabled && !isSubmenuTrigger) setActiveValue(value)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (disabled || event.defaultPrevented) return
        if (isSubmenuTrigger) {
          submenu?.cancelClose()
          return
        }
        toggleValue(value)
        if (closeOnSelect) setOpen(false)
      }}
    >
      {leadingNode}
      <span data-df="option-list-item-copy" data-layout={copyLayout}>
        <span data-df="option-list-item-label">{children}</span>
        {secondary != null ? (
          <span data-df="option-list-item-secondary">{secondary}</span>
        ) : null}
      </span>
      {trailing != null ? (
        <span data-df="option-list-item-trailing">{trailing}</span>
      ) : null}
      {showTrailingIndicator && selected ? (
        <span data-df="option-list-item-indicator">
          <Check className="pointer-events-none size-4" />
        </span>
      ) : null}
    </div>
  )
}

function OptionListSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="option-list-separator"
      className={cn("my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function OptionListScrollUpButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="option-list-scroll-up-button"
      className={cn(
        "flex w-full cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </div>
  )
}

function OptionListScrollDownButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="option-list-scroll-down-button"
      className={cn(
        "flex w-full cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </div>
  )
}

export {
  OptionList,
  OptionListBody,
  OptionListContent,
  OptionListFooter,
  OptionListGroup,
  OptionListItem,
  OptionListLabel,
  OptionListScrollDownButton,
  OptionListScrollUpButton,
  OptionListSearch,
  OptionListSeparator,
  OptionListSubContent,
  OptionListSubmenu,
  OptionListTrigger,
  useOptionListContext,
}
export type {
  OptionListBodyProps,
  OptionListContentProps,
  OptionListItemLayout,
  OptionListItemProps,
  OptionListProps,
  OptionListSearchProps,
  OptionListSubContentProps,
  OptionListSubmenuProps,
  SelectionMode,
}
