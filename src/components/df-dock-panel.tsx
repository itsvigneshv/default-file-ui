"use client"

import * as React from "react"
import { PanelLeft, X } from "lucide-react"

import { useControllableState } from "../hooks"
import { cn } from "../lib/utils"
import { Button } from "./df-button"
import {
  ScrollArea,
  type ScrollAreaOrientation,
  type ScrollAreaSide,
  type ScrollAreaSpace,
  type ScrollAreaThumbShape,
  type ScrollAreaVariant,
  type ScrollAreaVisibility,
} from "./df-scroll-area"

type DockPanelSize = "sm" | "md" | "lg" | "xl"
type DockPanelMobileMaxHeight = "sm" | "md" | "lg"
type DockPanelCollapsedAlign = "start" | "center"

type DockPanelContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  label: string
  collapseIcon: React.ReactNode
  expandIcon: React.ReactNode
  collapseLabel?: string
  expandLabel?: string
  collapsedLabelVisible: boolean
  collapsedAlign: DockPanelCollapsedAlign
}

const DockPanelContext = React.createContext<DockPanelContextValue | null>(null)

function useDockPanelContext(part: string) {
  const ctx = React.useContext(DockPanelContext)
  if (!ctx) {
    throw new Error(`${part} must be used within DockPanel`)
  }
  return ctx
}

type DockPanelRailProps = React.ComponentProps<"div">

function DockPanelRail({ className, ...props }: DockPanelRailProps) {
  return (
    <div
      data-df="dock-panel-rail"
      className={cn("df-dock-panel-rail", className)}
      {...props}
    />
  )
}

type DockPanelProps = Omit<React.ComponentProps<"aside">, "title"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  size?: DockPanelSize
  mobileMaxHeight?: DockPanelMobileMaxHeight
  title?: React.ReactNode
  subtitle?: React.ReactNode
  titleVisible?: boolean
  subtitleVisible?: boolean
  label?: string
  /**
   * When true, closing removes the panel from the rail instead of showing the
   * collapsed expand chip. Defaults the header control to a close icon.
   */
  dismissible?: boolean
  collapseIcon?: React.ReactNode
  expandIcon?: React.ReactNode
  collapseLabel?: string
  expandLabel?: string
  collapsedLabelVisible?: boolean
  collapsedAlign?: DockPanelCollapsedAlign
  viewportClassName?: string
  variant?: ScrollAreaVariant
  thumbShape?: ScrollAreaThumbShape
  orientation?: ScrollAreaOrientation
  side?: ScrollAreaSide
  visibility?: ScrollAreaVisibility
  space?: ScrollAreaSpace
  width?: number
}

function resolveLabel(
  label: string | undefined,
  title: React.ReactNode | undefined,
  subtitle: React.ReactNode | undefined
): string {
  if (label) return label
  if (typeof title === "string") return title
  if (typeof subtitle === "string") return subtitle
  return "Panel"
}

function DockPanel({
  className,
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  size = "md",
  mobileMaxHeight = "lg",
  title,
  subtitle,
  titleVisible = true,
  subtitleVisible = true,
  label,
  dismissible = false,
  collapseIcon,
  expandIcon,
  collapseLabel,
  expandLabel,
  collapsedLabelVisible = true,
  collapsedAlign = "start",
  viewportClassName,
  variant,
  thumbShape,
  orientation,
  side,
  visibility,
  space,
  width,
  ...props
}: DockPanelProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const resolvedLabel = resolveLabel(label, title, subtitle)
  const collapseNode = collapseIcon ?? (dismissible ? <X /> : <PanelLeft />)
  const expandNode = expandIcon ?? collapseNode
  const resolvedCollapseLabel =
    collapseLabel ?? (dismissible ? `Close ${resolvedLabel}` : undefined)
  const showTitle = title != null && titleVisible
  const showSubtitle = subtitle != null && subtitleVisible
  const composeHeader = title != null || subtitle != null
  const headingLines =
    showTitle && showSubtitle ? "both" : showTitle || showSubtitle ? "one" : "none"

  const content =
    composeHeader ? (
      <>
        <DockPanelHeader>
          {showTitle || showSubtitle ? (
            <div
              data-df="dock-panel-heading"
              data-lines={headingLines}
              className="df-dock-panel-heading"
            >
              {showTitle ? <DockPanelTitle>{title}</DockPanelTitle> : null}
              {showSubtitle ? (
                <DockPanelSubtitle>{subtitle}</DockPanelSubtitle>
              ) : null}
            </div>
          ) : null}
          <DockPanelCollapseTrigger />
        </DockPanelHeader>
        <DockPanelBody
          viewportClassName={viewportClassName}
          variant={variant}
          thumbShape={thumbShape}
          orientation={orientation}
          side={side}
          visibility={visibility}
          space={space}
          width={width}
        >
          {children}
        </DockPanelBody>
      </>
    ) : (
      children
    )

  if (dismissible && !isOpen) {
    return null
  }

  return (
    <DockPanelContext.Provider
      value={{
        open: isOpen,
        setOpen,
        label: resolvedLabel,
        collapseIcon: collapseNode,
        expandIcon: expandNode,
        collapseLabel: resolvedCollapseLabel,
        expandLabel,
        collapsedLabelVisible,
        collapsedAlign,
      }}
    >
      <aside
        data-df="dock-panel"
        data-state={isOpen ? "open" : "closed"}
        data-dismissible={dismissible ? "" : undefined}
        data-size={size}
        data-mobile-max-height={mobileMaxHeight}
        data-collapsed-label={collapsedLabelVisible ? "visible" : "hidden"}
        data-collapsed-align={collapsedAlign}
        className={cn("df-dock-panel", className)}
        {...props}
      >
        {isOpen ? content : <DockPanelExpandTrigger />}
      </aside>
    </DockPanelContext.Provider>
  )
}

type DockPanelHeaderProps = React.ComponentProps<"div">

function DockPanelHeader({ className, ...props }: DockPanelHeaderProps) {
  return (
    <div
      data-df="dock-panel-header"
      className={cn("df-dock-panel-header", className)}
      {...props}
    />
  )
}

type DockPanelTitleProps = React.ComponentProps<"p">

function DockPanelTitle({ className, ...props }: DockPanelTitleProps) {
  return (
    <p
      data-df="dock-panel-title"
      className={cn("df-dock-panel-title", className)}
      {...props}
    />
  )
}

type DockPanelSubtitleProps = React.ComponentProps<"p">

function DockPanelSubtitle({ className, ...props }: DockPanelSubtitleProps) {
  return (
    <p
      data-df="dock-panel-subtitle"
      className={cn("df-dock-panel-subtitle", className)}
      {...props}
    />
  )
}

type DockPanelCollapseTriggerProps = React.ComponentProps<typeof Button> & {
  icon?: React.ReactNode
}

function DockPanelCollapseTrigger({
  className,
  icon,
  children,
  onClick,
  "aria-label": ariaLabel,
  title,
  ...props
}: DockPanelCollapseTriggerProps) {
  const { setOpen, label, collapseIcon, collapseLabel } = useDockPanelContext(
    "DockPanelCollapseTrigger"
  )
  const accessibleName = collapseLabel ?? `Collapse ${label}`

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={cn("df-dock-panel-collapse-trigger", className)}
      aria-label={ariaLabel ?? accessibleName}
      title={title ?? accessibleName}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(false)
      }}
      {...props}
    >
      {children ?? icon ?? collapseIcon}
    </Button>
  )
}

type DockPanelExpandTriggerProps = React.ComponentProps<"button"> & {
  icon?: React.ReactNode
  label?: React.ReactNode
  showLabel?: boolean
}

function DockPanelExpandTrigger({
  className,
  icon,
  label: labelProp,
  showLabel,
  children,
  onClick,
  "aria-label": ariaLabel,
  title,
  ...props
}: DockPanelExpandTriggerProps) {
  const {
    setOpen,
    label,
    expandIcon,
    expandLabel,
    collapsedLabelVisible,
    collapsedAlign,
  } = useDockPanelContext("DockPanelExpandTrigger")
  const accessibleName = expandLabel ?? `Expand ${label}`
  const visibleLabel = labelProp ?? label
  const labelVisible = showLabel ?? collapsedLabelVisible

  return (
    <button
      type="button"
      data-df="dock-panel-expand-trigger"
      data-label={labelVisible ? "visible" : "hidden"}
      data-align={collapsedAlign}
      className={cn("df-dock-panel-expand-trigger", className)}
      aria-label={ariaLabel ?? accessibleName}
      title={title ?? accessibleName}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setOpen(true)
      }}
      {...props}
    >
      {children ?? (
        <>
          <span
            data-df="dock-panel-expand-chip"
            className="df-dock-panel-expand-chip"
          >
            {icon ?? expandIcon}
          </span>
          {labelVisible ? (
            <span
              data-df="dock-panel-expand-label"
              className="df-dock-panel-expand-label"
            >
              {visibleLabel}
            </span>
          ) : null}
        </>
      )}
    </button>
  )
}

type DockPanelBodyProps = Omit<React.ComponentProps<"div">, "children"> & {
  children?: React.ReactNode
  viewportClassName?: string
  variant?: ScrollAreaVariant
  thumbShape?: ScrollAreaThumbShape
  orientation?: ScrollAreaOrientation
  side?: ScrollAreaSide
  visibility?: ScrollAreaVisibility
  space?: ScrollAreaSpace
  width?: number
}

function DockPanelBody({
  className,
  children,
  viewportClassName,
  variant,
  thumbShape,
  orientation = "vertical",
  side,
  visibility,
  space,
  width,
  ...props
}: DockPanelBodyProps) {
  return (
    <div
      data-df="dock-panel-body"
      className={cn("df-dock-panel-body", className)}
      {...props}
    >
      <ScrollArea
        className="df-dock-panel-scroll"
        viewportClassName={viewportClassName}
        variant={variant}
        thumbShape={thumbShape}
        orientation={orientation}
        side={side}
        visibility={visibility}
        space={space}
        width={width}
      >
        {children}
      </ScrollArea>
    </div>
  )
}

type DockPanelFooterProps = React.ComponentProps<"div">

function DockPanelFooter({ className, ...props }: DockPanelFooterProps) {
  return (
    <div
      data-df="dock-panel-footer"
      className={cn("df-dock-panel-footer", className)}
      {...props}
    />
  )
}

export {
  DockPanel,
  DockPanelRail,
  DockPanelHeader,
  DockPanelTitle,
  DockPanelSubtitle,
  DockPanelCollapseTrigger,
  DockPanelExpandTrigger,
  DockPanelBody,
  DockPanelFooter,
}
export type {
  DockPanelProps,
  DockPanelRailProps,
  DockPanelHeaderProps,
  DockPanelTitleProps,
  DockPanelSubtitleProps,
  DockPanelCollapseTriggerProps,
  DockPanelExpandTriggerProps,
  DockPanelBodyProps,
  DockPanelFooterProps,
  DockPanelSize,
  DockPanelMobileMaxHeight,
  DockPanelCollapsedAlign,
}
