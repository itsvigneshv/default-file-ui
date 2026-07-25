"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, PanelLeft } from "lucide-react"

import {
  useControllableState,
  useIsClient,
  useIsMobile,
} from "../hooks"
import { useFocusTrap } from "../lib/df-focus-trap"
import { cn } from "../lib/utils"
import { Button } from "./df-button"
import { Label } from "./df-label"
import { ListItem } from "./df-list-item"
import {
  ScrollArea,
  type ScrollAreaOrientation,
  type ScrollAreaSide,
  type ScrollAreaSpace,
  type ScrollAreaThumbShape,
  type ScrollAreaVariant,
  type ScrollAreaVisibility,
} from "./df-scroll-area"
import { SearchInput, type SearchInputProps } from "./df-search-input"
import { Separator } from "./df-separator"
import { Skeleton } from "./df-skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./df-tooltip"

type SidebarSide = "left" | "right"
type SidebarVariant = "docked" | "floating" | "inset"
type SidebarCollapsible = "offcanvas" | "icon" | "none"
type SidebarLayout = "app" | "frame"
type SidebarHeightMode = "fill" | "fixed"
type SidebarScrollbar = "thumb" | "edge"
type SidebarMenuButtonSize = "sm" | "md" | "lg"
type SidebarMenuButtonVariant = "default" | "outline"

function scrollVariantForScrollbar(
  scrollbar: SidebarScrollbar
): ScrollAreaVariant {
  return scrollbar === "edge" ? "edge" : "default"
}

type SidebarGroupPaddingInput = {
  padding?: string
  paddingBlock?: string
  paddingInline?: string
  paddingBlockStart?: string
  paddingBlockEnd?: string
  paddingInlineStart?: string
  paddingInlineEnd?: string
}

function sidebarGroupPaddingStyle(
  input: SidebarGroupPaddingInput
): React.CSSProperties {
  const {
    padding,
    paddingBlock,
    paddingInline,
    paddingBlockStart,
    paddingBlockEnd,
    paddingInlineStart,
    paddingInlineEnd,
  } = input

  return {
    ...(padding != null
      ? {
          "--df-sidebar-group-padding-block-start": padding,
          "--df-sidebar-group-padding-block-end": padding,
          "--df-sidebar-group-padding-inline-start": padding,
          "--df-sidebar-group-padding-inline-end": padding,
        }
      : null),
    ...(paddingBlock != null
      ? {
          "--df-sidebar-group-padding-block-start": paddingBlock,
          "--df-sidebar-group-padding-block-end": paddingBlock,
        }
      : null),
    ...(paddingInline != null
      ? {
          "--df-sidebar-group-padding-inline-start": paddingInline,
          "--df-sidebar-group-padding-inline-end": paddingInline,
        }
      : null),
    ...(paddingBlockStart != null
      ? { "--df-sidebar-group-padding-block-start": paddingBlockStart }
      : null),
    ...(paddingBlockEnd != null
      ? { "--df-sidebar-group-padding-block-end": paddingBlockEnd }
      : null),
    ...(paddingInlineStart != null
      ? { "--df-sidebar-group-padding-inline-start": paddingInlineStart }
      : null),
    ...(paddingInlineEnd != null
      ? { "--df-sidebar-group-padding-inline-end": paddingInlineEnd }
      : null),
  } as React.CSSProperties
}

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  side: SidebarSide
  variant: SidebarVariant
  collapsible: SidebarCollapsible
  edgeCollapse: boolean
  edgeBorder: boolean
  layout: SidebarLayout
  fillHeight: boolean
  heightMode: SidebarHeightMode
  label: string
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return ctx
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fixed viewport chrome (app) or absolute chrome inside a sized host (frame). */
  layout?: SidebarLayout
  /** Stretch to the viewport or host. Ignored when height is set. */
  fillHeight?: boolean
  /** Fixed height. Prefer a kit length token. Sets --df-sidebar-height. */
  height?: string
  /** Accessible name for toggles and the mobile panel. */
  label?: string
  /** When false, disables the mod+b shortcut. */
  keyboardShortcut?: boolean
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  /** Desktop seam double-click toggle. Ignored when collapsible is none. */
  edgeCollapse?: boolean
  /** Hover accent on the seam when edgeCollapse is enabled. Uses --df-sidebar-border. */
  edgeBorder?: boolean
  /** Sets --df-sidebar-width. */
  width?: string
  /** Sets --df-sidebar-width-icon. */
  iconWidth?: string
  /** Sets --df-sidebar-width-mobile. */
  mobileWidth?: string
  /** Sets block and inline panel padding to the same length. */
  padding?: string
  /** Sets --df-sidebar-padding-block. */
  paddingBlock?: string
  /** Sets --df-sidebar-padding-inline. */
  paddingInline?: string
  /** Panel corner radius. Sets --df-sidebar-radius and --df-sidebar-radius-floating. */
  radius?: string
  /** Header, footer, and group radius. Sets --df-sidebar-section-radius. */
  sectionRadius?: string
  /** Menu row and label radius. Sets --df-sidebar-item-radius. */
  itemRadius?: string
  /** Gap inside header and footer stacks. Sets --df-sidebar-gap. */
  gap?: string
  /** Gap inside SidebarGroup. Sets --df-sidebar-group-gap. */
  groupGap?: string
  /** Sets all SidebarGroup padding axes to the same length. */
  groupPadding?: string
  /** Sets SidebarGroup block-start and block-end padding. */
  groupPaddingBlock?: string
  /** Sets SidebarGroup inline-start and inline-end padding. */
  groupPaddingInline?: string
  groupPaddingBlockStart?: string
  groupPaddingBlockEnd?: string
  groupPaddingInlineStart?: string
  groupPaddingInlineEnd?: string
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  layout = "app",
  fillHeight = true,
  height,
  label = "Sidebar",
  keyboardShortcut = true,
  side = "left",
  variant = "docked",
  collapsible = "icon",
  edgeCollapse = true,
  edgeBorder = true,
  width,
  iconWidth,
  mobileWidth,
  padding,
  paddingBlock,
  paddingInline,
  radius,
  sectionRadius,
  itemRadius,
  gap,
  groupGap,
  groupPadding,
  groupPaddingBlock,
  groupPaddingInline,
  groupPaddingBlockStart,
  groupPaddingBlockEnd,
  groupPaddingInlineStart,
  groupPaddingInlineEnd,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const setOpenValue = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value
      setOpen(next)
    },
    [open, setOpen]
  )

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
      return
    }
    setOpenValue((prev) => !prev)
  }, [isMobile, setOpenValue])

  React.useEffect(() => {
    if (!keyboardShortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "b") return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      toggleSidebar()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [keyboardShortcut, toggleSidebar])

  const state = open ? "expanded" : "collapsed"
  const heightMode: SidebarHeightMode = height != null ? "fixed" : "fill"

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen: setOpenValue,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      side,
      variant,
      collapsible,
      edgeCollapse,
      edgeBorder,
      layout,
      fillHeight,
      heightMode,
      label,
    }),
    [
      state,
      open,
      setOpenValue,
      openMobile,
      isMobile,
      toggleSidebar,
      side,
      variant,
      collapsible,
      edgeCollapse,
      edgeBorder,
      layout,
      fillHeight,
      heightMode,
      label,
    ]
  )

  const providerStyle = {
    ...(width != null ? { "--df-sidebar-width": width } : null),
    ...(iconWidth != null ? { "--df-sidebar-width-icon": iconWidth } : null),
    ...(mobileWidth != null
      ? { "--df-sidebar-width-mobile": mobileWidth }
      : null),
    ...(padding != null
      ? {
          "--df-sidebar-padding-block": padding,
          "--df-sidebar-padding-inline": padding,
        }
      : null),
    ...(paddingBlock != null
      ? { "--df-sidebar-padding-block": paddingBlock }
      : null),
    ...(paddingInline != null
      ? { "--df-sidebar-padding-inline": paddingInline }
      : null),
    ...(radius != null
      ? {
          "--df-sidebar-radius": radius,
          "--df-sidebar-radius-floating": radius,
        }
      : null),
    ...(sectionRadius != null
      ? { "--df-sidebar-section-radius": sectionRadius }
      : null),
    ...(itemRadius != null
      ? { "--df-sidebar-item-radius": itemRadius }
      : null),
    ...(gap != null ? { "--df-sidebar-gap": gap } : null),
    ...(groupGap != null ? { "--df-sidebar-group-gap": groupGap } : null),
    ...sidebarGroupPaddingStyle({
      padding: groupPadding,
      paddingBlock: groupPaddingBlock,
      paddingInline: groupPaddingInline,
      paddingBlockStart: groupPaddingBlockStart,
      paddingBlockEnd: groupPaddingBlockEnd,
      paddingInlineStart: groupPaddingInlineStart,
      paddingInlineEnd: groupPaddingInlineEnd,
    }),
    ...(height != null
      ? {
          "--df-sidebar-height": height,
          height,
          minHeight: height,
          maxHeight: height,
          boxSizing: "border-box",
        }
      : null),
    ...style,
  } as React.CSSProperties

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-df="sidebar-provider"
        data-layout={layout}
        data-height={heightMode}
        data-variant={variant}
        className={cn("df-sidebar-provider", className)}
        style={providerStyle}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

type SidebarProps = React.ComponentProps<"div"> & {
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  edgeCollapse?: boolean
  edgeBorder?: boolean
}

function SidebarMobilePanel({
  side,
  label,
  children,
}: {
  side: SidebarSide
  label: string
  children: React.ReactNode
}) {
  const { openMobile, setOpenMobile } = useSidebar()
  const mounted = useIsClient()
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()

  useFocusTrap({
    open: openMobile,
    panelRef,
    triggerRef,
    onEscape: () => setOpenMobile(false),
  })

  if (!mounted || !openMobile) return null

  return createPortal(
    <div data-df="sidebar-mobile-root" data-side={side}>
      <div
        data-df="sidebar-mobile-scrim"
        aria-hidden
        onClick={() => setOpenMobile(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-df="sidebar-mobile-panel"
        data-side={side}
        className="df-sidebar-mobile-panel"
      >
        <h2 id={titleId} data-df="sidebar-mobile-title">
          {label}
        </h2>
        <div data-df="sidebar-panel" className="df-sidebar-panel">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

function Sidebar({
  side: sideProp,
  variant: variantProp,
  collapsible: collapsibleProp,
  edgeCollapse: edgeCollapseProp,
  edgeBorder: edgeBorderProp,
  className,
  children,
  ...props
}: SidebarProps) {
  const ctx = useSidebar()
  const side = sideProp ?? ctx.side
  const variant = variantProp ?? ctx.variant
  const collapsible = collapsibleProp ?? ctx.collapsible
  const edgeCollapse = edgeCollapseProp ?? ctx.edgeCollapse
  const edgeBorder = edgeBorderProp ?? ctx.edgeBorder
  const { state, isMobile, layout, heightMode, label } = ctx

  if (collapsible === "none") {
    return (
      <div
        data-df="sidebar"
        data-variant={variant}
        data-side={side}
        data-collapsible="none"
        data-layout={layout}
        data-height={heightMode}
        className={cn("df-sidebar", "df-sidebar-static", className)}
        {...props}
      >
        <div data-df="sidebar-panel" className="df-sidebar-panel">
          {children}
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <SidebarMobilePanel side={side} label={label}>
        {children}
      </SidebarMobilePanel>
    )
  }

  const collapsibleState = state === "collapsed" ? collapsible : ""
  // Frame offcanvas collapses to width 0 with overflow hidden, so the seam cannot receive hits.
  const showEdge =
    edgeCollapse &&
    !(layout === "frame" && collapsible === "offcanvas" && state === "collapsed")

  return (
    <div
      data-df="sidebar"
      data-state={state}
      data-collapsible={collapsibleState}
      data-variant={variant}
      data-side={side}
      data-layout={layout}
      data-height={heightMode}
      className={cn("df-sidebar", "df-sidebar-peer", className)}
      {...props}
    >
      <div data-df="sidebar-gap" className="df-sidebar-gap" aria-hidden />
      <div data-df="sidebar-container" className="df-sidebar-container">
        <div data-df="sidebar-panel" className="df-sidebar-panel">
          {children}
        </div>
        {showEdge ? (
          <SidebarEdgeToggle side={side} border={edgeBorder} />
        ) : null}
      </div>
    </div>
  )
}

function SidebarEdgeToggle({
  side,
  border,
}: {
  side: SidebarSide
  border: boolean
}) {
  const { toggleSidebar, label, state } = useSidebar()
  const expanded = state === "expanded"
  const emphasize: "left" | "right" =
    side === "left"
      ? expanded
        ? "left"
        : "right"
      : expanded
        ? "right"
        : "left"

  return (
    <div
      data-df="sidebar-edge"
      data-edge-border={border ? "true" : "false"}
      data-edge-emphasize={emphasize}
      className="df-sidebar-edge"
      aria-hidden
      title={
        expanded
          ? `Double-click to collapse ${label}`
          : `Double-click to expand ${label}`
      }
      onDoubleClick={(event) => {
        event.preventDefault()
        toggleSidebar()
      }}
    />
  )
}

type SidebarTriggerProps = React.ComponentProps<typeof Button>

function SidebarTrigger({
  className,
  onClick,
  children,
  "aria-label": ariaLabel,
  ...props
}: SidebarTriggerProps) {
  const { toggleSidebar, label, state, isMobile, openMobile } = useSidebar()
  const expanded = isMobile ? openMobile : state === "expanded"
  return (
    <Button
      type="button"
      size="icon-sm"
      className={cn("df-sidebar-trigger", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggleSidebar()
      }}
      {...props}
      variant="ghost"
      aria-label={
        ariaLabel ?? (expanded ? `Collapse ${label}` : `Expand ${label}`)
      }
      aria-expanded={expanded}
    >
      {children ?? <PanelLeft aria-hidden />}
    </Button>
  )
}

type SidebarInsetProps = React.ComponentProps<"main">

function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-df="sidebar-inset"
      className={cn("df-sidebar-inset", className)}
      {...props}
    />
  )
}

type SidebarSectionProps = React.ComponentProps<"div"> & {
  /** Corner radius for this section. Sets --df-sidebar-section-radius. */
  radius?: string
}

type SidebarGroupContextValue = {
  collapsible: boolean
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  toggle: () => void
  triggerId: string
  contentId: string
  labelId: string
  labelPresent: boolean
  setLabelPresent: (present: boolean) => void
}

const SidebarGroupContext =
  React.createContext<SidebarGroupContextValue | null>(null)

function useSidebarGroupOptional() {
  return React.useContext(SidebarGroupContext)
}

type SidebarGroupProps = SidebarSectionProps & {
  /** Opt in to a chevron on the label that expands and collapses SidebarGroupContent. */
  collapsible?: boolean
  /** Controlled open state when collapsible. */
  open?: boolean
  /** Uncontrolled initial open state when collapsible. */
  defaultOpen?: boolean
  /** Called when open changes while collapsible. */
  onOpenChange?: (open: boolean) => void
  /** Gap between label, separators, and content. Sets --df-sidebar-group-gap. */
  gap?: string
  /** Sets all group padding axes to the same length. */
  padding?: string
  /** Sets group block-start and block-end padding. */
  paddingBlock?: string
  /** Sets group inline-start and inline-end padding. */
  paddingInline?: string
  paddingBlockStart?: string
  paddingBlockEnd?: string
  paddingInlineStart?: string
  paddingInlineEnd?: string
}

function SidebarHeader({
  className,
  style,
  radius,
  ...props
}: SidebarSectionProps) {
  return (
    <div
      data-df="sidebar-header"
      className={cn("df-sidebar-header", className)}
      style={
        {
          ...(radius != null
            ? { "--df-sidebar-section-radius": radius }
            : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  style,
  radius,
  ...props
}: SidebarSectionProps) {
  return (
    <div
      data-df="sidebar-footer"
      className={cn("df-sidebar-footer", className)}
      style={
        {
          ...(radius != null
            ? { "--df-sidebar-section-radius": radius }
            : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

type SidebarContentProps = Omit<React.ComponentProps<"nav">, "children"> & {
  children?: React.ReactNode
  /** ScrollArea appearance: wider overlay (thumb) or thin flush accent (edge). */
  scrollbar?: SidebarScrollbar
  viewportClassName?: string
  thumbShape?: ScrollAreaThumbShape
  orientation?: ScrollAreaOrientation
  side?: ScrollAreaSide
  visibility?: ScrollAreaVisibility
  space?: ScrollAreaSpace
  width?: number
}

function SidebarContent({
  className,
  children,
  scrollbar = "thumb",
  viewportClassName,
  thumbShape,
  orientation = "vertical",
  side,
  visibility = "always",
  space,
  width,
  ...props
}: SidebarContentProps) {
  const { label } = useSidebar()
  return (
    <nav
      data-df="sidebar-content"
      data-scrollbar={scrollbar}
      aria-label={label}
      className={cn("df-sidebar-content", className)}
      {...props}
    >
      <ScrollArea
        className="df-sidebar-content-scroll"
        viewportClassName={cn(
          "df-sidebar-content-viewport",
          viewportClassName
        )}
        variant={scrollVariantForScrollbar(scrollbar)}
        thumbShape={thumbShape}
        orientation={orientation}
        side={side}
        visibility={visibility}
        space={space}
        width={width}
      >
        {children}
      </ScrollArea>
    </nav>
  )
}

type SidebarSeparatorProps = Omit<
  React.ComponentProps<typeof Separator>,
  "color"
> & {
  color?: string
}

function SidebarSeparator({
  className,
  style,
  color,
  orientation = "horizontal",
  ...props
}: SidebarSeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn("df-sidebar-separator", className)}
      style={
        {
          ...(color != null ? { "--df-sidebar-separator": color } : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

type SidebarInputProps = Omit<SearchInputProps, "trailing">

function SidebarInput({
  className,
  size = "md",
  variant = "pill",
  clearable = false,
  ...props
}: SidebarInputProps) {
  return (
    <div
      data-df="sidebar-input"
      className={cn("df-sidebar-input", className)}
    >
      <SearchInput
        size={size}
        variant={variant}
        clearable={clearable}
        {...props}
      />
    </div>
  )
}

function SidebarGroup({
  className,
  style,
  radius,
  collapsible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  gap,
  padding,
  paddingBlock,
  paddingInline,
  paddingBlockStart,
  paddingBlockEnd,
  paddingInlineStart,
  paddingInlineEnd,
  ...props
}: SidebarGroupProps) {
  const reactId = React.useId()
  const triggerId = `df-sidebar-group-trigger${reactId}`
  const contentId = `df-sidebar-group-content${reactId}`
  const labelId = `df-sidebar-group-label${reactId}`
  const [labelPresent, setLabelPresent] = React.useState(false)
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const toggle = React.useCallback(() => {
    setOpen((current) => !current)
  }, [setOpen])
  const context = React.useMemo<SidebarGroupContextValue>(
    () => ({
      collapsible,
      open,
      setOpen,
      toggle,
      triggerId,
      contentId,
      labelId,
      labelPresent,
      setLabelPresent,
    }),
    [
      collapsible,
      open,
      setOpen,
      toggle,
      triggerId,
      contentId,
      labelId,
      labelPresent,
    ]
  )

  return (
    <SidebarGroupContext.Provider value={context}>
      <div
        data-df="sidebar-group"
        data-collapsible={collapsible ? "" : undefined}
        data-state={collapsible ? (open ? "open" : "closed") : undefined}
        data-open={collapsible ? (open ? "true" : "false") : undefined}
        className={cn("df-sidebar-group", className)}
        style={
          {
            ...(radius != null
              ? { "--df-sidebar-section-radius": radius }
              : null),
            ...(gap != null ? { "--df-sidebar-group-gap": gap } : null),
            ...sidebarGroupPaddingStyle({
              padding,
              paddingBlock,
              paddingInline,
              paddingBlockStart,
              paddingBlockEnd,
              paddingInlineStart,
              paddingInlineEnd,
            }),
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </SidebarGroupContext.Provider>
  )
}

type SidebarGroupLabelProps = Omit<React.ComponentProps<"div">, "color"> & {
  asChild?: boolean
  leading?: React.ReactNode
  trailing?: React.ReactNode
  color?: string
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
}

function SidebarGroupLabel({
  className,
  style,
  asChild = false,
  children,
  leading,
  trailing,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  ...props
}: SidebarGroupLabelProps) {
  const { state, collapsible: sidebarCollapsible } = useSidebar()
  const group = useSidebarGroupOptional()
  const hideFromAssistive =
    sidebarCollapsible === "icon" && state === "collapsed" ? true : undefined
  const setLabelPresent = group?.setLabelPresent
  const registerLabel = group != null && !asChild

  React.useLayoutEffect(() => {
    if (!registerLabel || setLabelPresent == null) return
    setLabelPresent(true)
    return () => setLabelPresent(false)
  }, [registerLabel, setLabelPresent])

  const collapseControl =
    group?.collapsible && !asChild ? (
      <SidebarGroupAction
        id={group.triggerId}
        aria-expanded={group.open}
        aria-controls={group.contentId}
        aria-label={group.open ? "Collapse section" : "Expand section"}
        onClick={() => {
          group.toggle()
        }}
      >
        <ChevronDown
          className="df-sidebar-group-chevron"
          data-open={group.open ? "true" : "false"}
          data-state={group.open ? "open" : "closed"}
          aria-hidden
        />
      </SidebarGroupAction>
    ) : null
  const resolvedTrailing =
    trailing != null || collapseControl != null ? (
      <>
        {trailing}
        {collapseControl}
      </>
    ) : undefined

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      ...props,
      style,
      "aria-hidden": hideFromAssistive,
      className: cn(
        "df-sidebar-group-label",
        className,
        (children.props as { className?: string }).className
      ),
    } as never)
  }
  return (
    <Label
      as="div"
      className={cn("df-sidebar-group-label", className)}
      style={style}
      leading={leading}
      trailing={resolvedTrailing}
      color={color}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontWeight={fontWeight}
      aria-hidden={hideFromAssistive}
      {...props}
      {...(group != null ? { id: group.labelId } : null)}
    >
      {children}
    </Label>
  )
}

type SidebarGroupActionProps = React.ComponentProps<"button"> & {
  asChild?: boolean
}

function SidebarGroupAction({
  className,
  asChild = false,
  children,
  ...props
}: SidebarGroupActionProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      "data-df": "sidebar-group-action",
      className: cn(
        "df-sidebar-group-action",
        className,
        (children.props as { className?: string }).className
      ),
      ...props,
    } as never)
  }
  return (
    <button
      type="button"
      data-df="sidebar-group-action"
      className={cn("df-sidebar-group-action", className)}
      {...props}
    >
      {children}
    </button>
  )
}

type SidebarGroupContentProps = React.ComponentProps<"div"> & {
  /** Keep content mounted while closed so height can animate. */
  forceMount?: boolean
}

function SidebarGroupContent({
  className,
  forceMount = true,
  children,
  ...props
}: SidebarGroupContentProps) {
  const group = useSidebarGroupOptional()
  if (!group?.collapsible) {
    return (
      <div
        data-df="sidebar-group-content"
        className={cn("df-sidebar-group-content", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  const mounted = group.open || forceMount
  return (
    <div
      {...props}
      id={group.contentId}
      role={group.labelPresent ? "region" : undefined}
      aria-labelledby={group.labelPresent ? group.labelId : undefined}
      data-df="sidebar-group-content"
      data-state={group.open ? "open" : "closed"}
      data-open={group.open ? "true" : "false"}
      hidden={!group.open && !forceMount ? true : undefined}
      inert={!group.open ? true : undefined}
      className="df-sidebar-group-panel"
    >
      <div>
        {mounted ? (
          <div
            data-df="sidebar-group-content-body"
            className={cn("df-sidebar-group-content", className)}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-df="sidebar-menu"
      className={cn("df-sidebar-menu", className)}
      {...props}
    />
  )
}

type SidebarMenuItemProps = React.ComponentProps<"li"> & {
  /** Shown when the sidebar is icon-collapsed on desktop. Prefer this over the deprecated SidebarMenuButton tooltip. */
  tooltip?: React.ReactNode
}

function SidebarMenuItem({
  className,
  tooltip,
  children,
  ...props
}: SidebarMenuItemProps) {
  const { state, isMobile, collapsible } = useSidebar()
  const showTooltip =
    tooltip != null &&
    !isMobile &&
    collapsible === "icon" &&
    state === "collapsed"

  const content = showTooltip
    ? React.Children.map(children, (child, index) => {
        if (index !== 0 || !React.isValidElement(child)) return child
        if (child.type === Tooltip) return child
        return (
          <Tooltip appearance="inverse" key={child.key ?? "sidebar-menu-tooltip"}>
            <TooltipTrigger render={child as React.ReactElement} />
            <TooltipContent side="right" align="center">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )
      })
    : children

  return (
    <li
      data-df="sidebar-menu-item"
      className={cn("df-sidebar-menu-item", className)}
      {...props}
    >
      {content}
    </li>
  )
}

function splitSidebarMenuChildren(children: React.ReactNode): {
  leading?: React.ReactNode
  label: React.ReactNode
} {
  const items = React.Children.toArray(children)
  if (items.length >= 2 && React.isValidElement(items[0])) {
    return { leading: items[0], label: items.slice(1) }
  }
  return { label: children }
}

type SidebarMenuButtonProps = Omit<
  React.ComponentProps<"button">,
  "children"
> & {
  asChild?: boolean
  isActive?: boolean
  variant?: SidebarMenuButtonVariant
  size?: SidebarMenuButtonSize
  tooltip?: React.ReactNode
  children?: React.ReactNode
}

/** @deprecated Use ListItem inside SidebarMenuItem. Compatibility shim over List Item. */
function SidebarMenuButton({
  className,
  asChild = false,
  isActive = false,
  variant = "default",
  size = "md",
  tooltip,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile, collapsible } = useSidebar()
  const showTooltip =
    tooltip != null &&
    !isMobile &&
    collapsible === "icon" &&
    state === "collapsed"

  const sharedListProps = {
    selected: isActive,
    size,
    variant: "muted" as const,
    className: cn(
      "df-sidebar-menu-button",
      variant === "outline" && "df-sidebar-menu-button-outline",
      className
    ),
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-active": isActive ? ("" as const) : undefined,
  }

  let row: React.ReactElement
  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      children?: React.ReactNode
      className?: string
    }
    const { leading, label } = splitSidebarMenuChildren(childProps.children)
    const linkChild = React.cloneElement(
      children as React.ReactElement<{ children?: React.ReactNode }>,
      { children: label }
    )
    row = (
      <ListItem
        asChild
        leading={leading}
        {...sharedListProps}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {linkChild}
      </ListItem>
    )
  } else {
    const { leading, label } = splitSidebarMenuChildren(children)
    row = (
      <ListItem
        as="button"
        leading={leading}
        {...sharedListProps}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {label}
      </ListItem>
    )
  }

  if (!showTooltip) return row

  return (
    <Tooltip appearance="inverse">
      <TooltipTrigger render={row} />
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

type SidebarMenuActionProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  children,
  ...props
}: SidebarMenuActionProps) {
  const classes = cn(
    "df-sidebar-menu-action",
    showOnHover && "df-sidebar-menu-action-hover",
    className
  )
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      "data-df": "sidebar-menu-action",
      "data-show-on-hover": showOnHover ? "true" : undefined,
      className: cn(classes, (children.props as { className?: string }).className),
      ...props,
    } as never)
  }
  return (
    <button
      type="button"
      data-df="sidebar-menu-action"
      data-show-on-hover={showOnHover ? "true" : undefined}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-df="sidebar-menu-badge"
      className={cn("df-sidebar-menu-badge", className)}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  return (
    <div
      data-df="sidebar-menu-skeleton"
      className={cn("df-sidebar-menu-skeleton", className)}
      {...props}
    >
      {showIcon ? (
        <Skeleton shape="block" className="df-sidebar-menu-skeleton-icon" />
      ) : null}
      <Skeleton shape="text" className="df-sidebar-menu-skeleton-text" />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-df="sidebar-menu-sub"
      className={cn("df-sidebar-menu-sub", className)}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-df="sidebar-menu-sub-item"
      className={cn("df-sidebar-menu-sub-item", className)}
      {...props}
    />
  )
}

type SidebarMenuSubButtonProps = React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}

/** @deprecated Use ListItem inside SidebarMenuSubItem. Compatibility shim over List Item. */
function SidebarMenuSubButton({
  className,
  asChild = false,
  size = "md",
  isActive = false,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  const listSize = (size === "sm" ? "xs" : "md") as "xs" | "md"
  const sharedClassName = cn("df-sidebar-menu-sub-button", className)
  const sharedListProps = {
    selected: isActive,
    size: listSize,
    variant: "muted" as const,
    className: sharedClassName,
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-active": isActive ? ("" as const) : undefined,
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      children?: React.ReactNode
    }
    const { leading, label } = splitSidebarMenuChildren(childProps.children)
    const linkChild = React.cloneElement(
      children as React.ReactElement<{ children?: React.ReactNode }>,
      { ...props, children: label }
    )
    return (
      <ListItem asChild leading={leading} {...sharedListProps}>
        {linkChild}
      </ListItem>
    )
  }

  const { leading, label } = splitSidebarMenuChildren(children)
  return (
    <ListItem asChild leading={leading} {...sharedListProps}>
      <a {...props}>{label}</a>
    </ListItem>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

export type {
  SidebarCollapsible,
  SidebarContentProps,
  SidebarGroupActionProps,
  SidebarGroupContentProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
  SidebarHeightMode,
  SidebarInputProps,
  SidebarInsetProps,
  SidebarLayout,
  SidebarMenuActionProps,
  SidebarMenuButtonProps,
  SidebarMenuButtonSize,
  SidebarMenuButtonVariant,
  SidebarMenuItemProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarSectionProps,
  SidebarScrollbar,
  SidebarSeparatorProps,
  SidebarSide,
  SidebarTriggerProps,
  SidebarVariant,
}
