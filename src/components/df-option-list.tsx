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
  labelFor: (value: string | null) => React.ReactNode
  registerLabel: (value: string, label: React.ReactNode) => void
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
  /**
   * When true, the child panel fades/slides open and closed.
   * When false, open and close are instant (no motion).
   * Falls back to OptionList `submenuAnimated` (default true).
   */
  animated?: boolean
  /** Open animation duration in milliseconds. Falls back to OptionList `submenuOpenDuration`. */
  openDuration?: number
  /** Close animation duration in milliseconds. Falls back to OptionList `submenuCloseDuration`. */
  closeDuration?: number
  /** Delay before the submenu closes after pointer leaves. */
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
  /**
   * Override motion for this panel only.
   * When false, this panel appears and disappears instantly.
   */
  animated?: boolean
  /** Override open duration (ms) for this panel only. */
  openDuration?: number
  /** Override close duration (ms) for this panel only. */
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
  const style = useAnchoredPosition({
    open: present && portal,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
    collisionAvoidance: true,
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
        data-side={side}
        data-align={align}
        data-state={open ? "open" : "closed"}
        data-animated={motion.animated ? "true" : "false"}
        data-portal={portal ? "true" : "false"}
        className={cn(className)}
        style={
          portal
            ? {
                ...style,
                ...motionStyle,
                width: "max-content",
                maxWidth: "min(100vw - 1rem, 24rem)",
              }
            : {
                ...motionStyle,
                position: "absolute",
                left: `calc(100% + ${sideOffset}px)`,
                top: alignOffset,
                zIndex: 60,
                width: "max-content",
                minWidth: "9rem",
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
  /** When false, choosing a row keeps the panel open. Defaults false in multiple mode. */
  closeOnSelect?: boolean
  /**
   * Default motion for all nested OptionListSubmenu panels.
   * When false, nested menus open and close instantly.
   * Individual Submenu / SubContent `animated` props override this.
   */
  submenuAnimated?: boolean
  /** Default open animation duration in ms for nested submenus. */
  submenuOpenDuration?: number
  /** Default close animation duration in ms for nested submenus. */
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
  const [, setLabelsVersion] = React.useState(0)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const labels = React.useRef(new Map<string, React.ReactNode>())

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

  const labelFor = React.useCallback((itemValue: string | null) => {
    if (!itemValue) return null
    return labels.current.get(itemValue) ?? itemValue
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
        labelFor,
        registerLabel,
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
  /** Host element to clone trigger behavior onto (for example Badge). */
  render?: React.ReactElement
}) {
  const { open, setOpen, triggerRef } = useOptionListContext()

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
    // Do not pass data-df: hosts like Badge own their data-df for styling.
    return React.cloneElement(render, {
      ...props,
      ref: triggerRef as React.Ref<HTMLElement>,
      "data-df-option-list-trigger": "",
      "aria-expanded": open,
      "aria-haspopup": "listbox",
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

function OptionListBody({
  className,
  children,
  scrollable = false,
  maxHeight = "16rem",
  ...props
}: React.ComponentProps<"div"> & {
  scrollable?: boolean
  maxHeight?: string | number
}) {
  if (scrollable) {
    return (
      <div
        data-df="option-list-body"
        data-scrollable=""
        className={cn("min-h-0", className)}
        {...props}
      >
        <ScrollArea visibility="always" style={{ maxHeight }}>
          {children}
        </ScrollArea>
      </div>
    )
  }

  return (
    <div data-df="option-list-body" className={cn(className)} {...props}>
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
  /** Close when the page scrolls. Default true. */
  dismissOnScroll?: boolean
  /** Show a search field above the options. */
  search?: boolean
  searchPlaceholder?: string
  searchValue?: string
  defaultSearchValue?: string
  onSearchChange?: (value: string) => void
  /** Wrap options in a scroll area. */
  scrollable?: boolean
  scrollMaxHeight?: string | number
  /** Footer actions (e.g. Reset / Select all). */
  footer?: React.ReactNode
}

/** Detect nested OptionListSubmenu so those panels keep native (unclipped) overflow. */
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
  footer,
  ...props
}: OptionListContentProps) {
  const { open, setOpen, triggerRef } = useOptionListContext()
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const style = useAnchoredPosition({
    open: open && portal,
    triggerRef,
    contentRef,
    side,
    align,
    sideOffset,
    alignOffset,
    matchTriggerWidth: alignItemWithTrigger,
    collisionAvoidance: true,
  })

  useDismiss(open && portal, () => setOpen(false), [triggerRef, contentRef], {
    excludeSelectors: DISMISS_NESTED_LAYER_SELECTORS,
    dismissOnScroll,
  })

  const mounted = useIsClient()
  // Submenu panels must keep overflow visible so flyouts aren't clipped; every
  // other panel scrolls its options through the kit ScrollArea by default so we
  // never fall back to the native browser scrollbar.
  const hasSubmenu = React.useMemo(() => containsSubmenu(children), [children])
  const wrapInScrollArea = scrollable ?? !hasSubmenu
  const stacked = search || footer != null
  const effectiveMaxHeight =
    scrollMaxHeight ?? (stacked ? "16rem" : "min(60vh, 24rem)")

  if (!mounted) return null

  if (!open) {
    return (
      <div hidden aria-hidden>
        {children}
      </div>
    )
  }

  const body = (
    <OptionListBody scrollable={wrapInScrollArea} maxHeight={effectiveMaxHeight}>
      {children}
    </OptionListBody>
  )

  const panel = (
    <div
      ref={contentRef}
      role="listbox"
      data-df="option-list-content"
      data-align={align}
      data-align-trigger={alignItemWithTrigger ? "true" : "false"}
      data-portal={portal ? "true" : "false"}
      data-stacked={stacked ? "true" : undefined}
      data-scroll={wrapInScrollArea ? "kit" : undefined}
      className={cn(className)}
      style={
        portal
          ? {
              ...style,
              ...(alignItemWithTrigger
                ? null
                : { width: "max-content", maxWidth: "min(100vw - 1rem, 24rem)" }),
            }
          : {
              position: "relative",
              width: alignItemWithTrigger ? "100%" : "max-content",
              minWidth: stacked && !alignItemWithTrigger ? "18rem" : "12rem",
            }
      }
      {...props}
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

type OptionListItemLayout = "inline" | "stacked"

type OptionListItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
  /** Leading control or icon. Use `"checkbox"` for multi-select rows. */
  leading?: OptionListItemLeading
  /**
   * Supporting copy for the row.
   * - `layout="inline"` (default): sits beside the label
   * - `layout="stacked"`: description under the heading
   */
  secondary?: React.ReactNode
  /** How `secondary` sits relative to the main label. */
  layout?: OptionListItemLayout
  /** Slot after the label: badge, counter, or any node. */
  trailing?: React.ReactNode
  /**
   * Trailing selected check. Defaults to false when `leading="checkbox"`
   * or when `trailing` is set; otherwise true for single-select checkmarks.
   */
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
  onClick,
  ...props
}: OptionListItemProps) {
  const {
    isSelected,
    toggleValue,
    setOpen,
    registerLabel,
    closeOnSelect,
    searchQuery,
    selectionMode,
  } = useOptionListContext()
  const submenu = React.useContext(OptionListSubmenuStateContext)
  const inTriggerZone = React.useContext(OptionListSubmenuTriggerZoneContext)
  const isSubmenuTrigger = Boolean(submenu && inTriggerZone)

  const selected = isSelected(value)
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

  React.useEffect(() => {
    registerLabel(value, children)
  }, [children, registerLabel, value])

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
      role={isSubmenuTrigger ? "menuitem" : "option"}
      aria-selected={isSubmenuTrigger ? undefined : selected}
      aria-haspopup={isSubmenuTrigger ? "menu" : undefined}
      aria-expanded={isSubmenuTrigger ? submenu?.open : undefined}
      data-df="option-list-item"
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
  OptionListContentProps,
  OptionListItemLayout,
  OptionListItemProps,
  OptionListProps,
  OptionListSearchProps,
  OptionListSubContentProps,
  OptionListSubmenuProps,
  SelectionMode,
}
