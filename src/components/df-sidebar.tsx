"use client"

import * as React from "react"
import { ChevronsUpDown, PanelLeft, Search } from "lucide-react"

import { useControllableState } from "../hooks"
import {
  dfCornerShapeStyle,
  type DfCornerShape,
} from "../lib/corner-shape"
import { cn } from "../lib/utils"
import { Avatar } from "./df-avatar"
import { Badge, type BadgeProps } from "./df-badge"
import { Button } from "./df-button"
import { ListItem, ListItemLabel } from "./df-list-item"
import {
  OptionList,
  OptionListContent,
  OptionListTrigger,
  type OptionListContentProps,
  type OptionListProps,
} from "./df-option-list"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./df-popover"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./df-tooltip"

type SidebarSide = "left" | "right"

type SidebarRadius =
  | "none"
  | "xxs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full"

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  side: SidebarSide
  label: string
  tooltipSide: "left" | "right"
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebarContext(part: string) {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) {
    throw new Error(`${part} must be used within Sidebar`)
  }
  return ctx
}

function textFromNode(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textFromNode).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textFromNode(node.props.children)
  }
  return ""
}

type SidebarProps = Omit<React.ComponentProps<"aside">, "color"> & {
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  side?: SidebarSide
  width?: string
  collapsedWidth?: string
  radius?: SidebarRadius
  itemRadius?: SidebarRadius
  cornerShape?: DfCornerShape
  background?: string
  borderColor?: string
  foreground?: string
  shadow?: string
  /** Accessible name for the landmark and collapse controls. */
  label?: string
}

function Sidebar({
  className,
  style,
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  side = "left",
  width,
  collapsedWidth,
  radius = "2xl",
  itemRadius = "lg",
  cornerShape,
  background,
  borderColor,
  foreground,
  shadow,
  label = "Primary",
  "aria-label": ariaLabel,
  ...props
}: SidebarProps) {
  const [isCollapsed, setCollapsed] = useControllableState({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })

  const sidebarStyle = {
    ...(width != null ? { "--df-sidebar-width": width } : null),
    ...(collapsedWidth != null
      ? { "--df-sidebar-width-collapsed": collapsedWidth }
      : null),
    ...(background != null ? { "--df-sidebar-bg": background } : null),
    ...(borderColor != null ? { "--df-sidebar-border": borderColor } : null),
    ...(foreground != null ? { "--df-sidebar-fg": foreground } : null),
    ...(shadow != null ? { "--df-sidebar-shadow": shadow } : null),
    ...dfCornerShapeStyle(cornerShape),
    ...style,
  } as React.CSSProperties

  return (
    <SidebarContext.Provider
      value={{
        collapsed: isCollapsed,
        setCollapsed,
        side,
        label,
        tooltipSide: side === "right" ? "left" : "right",
      }}
    >
      <aside
        data-df="sidebar"
        data-collapsed={isCollapsed ? "true" : "false"}
        data-side={side}
        data-radius={radius}
        data-item-radius={itemRadius}
        data-corner-shape={cornerShape}
        className={cn("df-sidebar", className)}
        style={sidebarStyle}
        aria-label={ariaLabel ?? label}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

type SidebarHeaderProps = React.ComponentProps<"div">

function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-df="sidebar-header"
      className={cn("df-sidebar-header", className)}
      {...props}
    />
  )
}

type SidebarContentProps = Omit<React.ComponentProps<"div">, "children"> & {
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

function SidebarContent({
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
}: SidebarContentProps) {
  return (
    <div
      data-df="sidebar-content"
      className={cn("df-sidebar-content", className)}
      {...props}
    >
      <ScrollArea
        className="df-sidebar-scroll"
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

type SidebarFooterProps = React.ComponentProps<"div">

function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-df="sidebar-footer"
      className={cn("df-sidebar-footer", className)}
      {...props}
    />
  )
}

type SidebarNavProps = React.ComponentProps<"nav">

function SidebarNav({ className, ...props }: SidebarNavProps) {
  return (
    <nav
      data-df="sidebar-nav"
      className={cn("df-sidebar-nav", className)}
      {...props}
    />
  )
}

type SidebarShortcutProps = React.ComponentProps<"span">

function SidebarShortcut({ className, ...props }: SidebarShortcutProps) {
  return (
    <span
      data-df="sidebar-shortcut"
      className={cn("df-sidebar-shortcut", className)}
      {...props}
    />
  )
}

type SidebarSearchProps = Omit<SearchInputProps, "trailing"> & {
  shortcut?: React.ReactNode
  collapsedLabel?: string
}

function SidebarSearch({
  className,
  shortcut,
  collapsedLabel = "Search",
  placeholder = "Search",
  size = "sm",
  variant = "pill",
  clearable = false,
  onClick,
  ...props
}: SidebarSearchProps) {
  const { collapsed, tooltipSide } = useSidebarContext("SidebarSearch")

  if (collapsed) {
    return (
      <div
        data-df="sidebar-search"
        data-collapsed="true"
        className={cn("df-sidebar-search", className)}
      >
        <Tooltip appearance="inverse">
          <TooltipTrigger
            render={
              <button
                type="button"
                data-df="sidebar-search-collapsed"
                className="df-sidebar-search-collapsed"
                aria-label={collapsedLabel}
                onClick={
                  onClick
                    ? (event) => {
                        onClick(
                          event as unknown as React.MouseEvent<HTMLInputElement>
                        )
                      }
                    : undefined
                }
              >
                <Search aria-hidden />
              </button>
            }
          />
          <TooltipContent side={tooltipSide}>{collapsedLabel}</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      data-df="sidebar-search"
      data-collapsed="false"
      className={cn("df-sidebar-search", className)}
    >
      <SearchInput
        placeholder={placeholder}
        size={size}
        variant={variant}
        clearable={clearable}
        onClick={onClick}
        trailing={
          shortcut != null ? (
            <SidebarShortcut>{shortcut}</SidebarShortcut>
          ) : undefined
        }
        {...props}
      />
    </div>
  )
}

type SidebarGroupProps = React.ComponentProps<"div"> & {
  label?: React.ReactNode
  action?: React.ReactNode
}

function SidebarGroup({
  className,
  label,
  action,
  children,
  ...props
}: SidebarGroupProps) {
  const { collapsed } = useSidebarContext("SidebarGroup")
  const showHeader = !collapsed && (label != null || action != null)

  return (
    <div
      data-df="sidebar-group"
      className={cn("df-sidebar-group", className)}
      {...props}
    >
      {showHeader ? (
        <div data-df="sidebar-group-header" className="df-sidebar-group-header">
          {label != null ? (
            <ListItemLabel variant="nav">{label}</ListItemLabel>
          ) : (
            <span data-df="sidebar-group-label-slot" />
          )}
          {action != null ? (
            <div data-df="sidebar-group-action" className="df-sidebar-group-action">
              {action}
            </div>
          ) : null}
        </div>
      ) : null}
      <div data-df="sidebar-group-items" className="df-sidebar-group-items">
        {children}
      </div>
    </div>
  )
}

type SidebarItemProps = Omit<
  React.ComponentProps<"div">,
  "children" | "color"
> & {
  icon?: React.ReactNode
  shortcut?: React.ReactNode
  badge?: React.ReactNode
  badgeVariant?: BadgeProps["variant"]
  /** Leading color swatch. Prefer a kit token such as var(--df-teal-400). */
  swatch?: string
  active?: boolean
  disabled?: boolean
  asChild?: boolean
  children?: React.ReactNode
  trailing?: React.ReactNode
}

function SidebarItem({
  className,
  style,
  icon,
  shortcut,
  badge,
  badgeVariant = "destructive",
  swatch,
  active = false,
  disabled = false,
  asChild = false,
  children,
  trailing,
  onClick,
  ...props
}: SidebarItemProps) {
  const { collapsed, tooltipSide } = useSidebarContext("SidebarItem")
  const label = textFromNode(children)

  let leading: React.ReactNode = false
  if (swatch != null) {
    leading = (
      <span
        data-df="sidebar-item-swatch"
        className="df-sidebar-item-swatch"
        style={{ backgroundColor: swatch }}
        aria-hidden
      />
    )
  } else if (icon != null) {
    leading = (
      <span data-df="sidebar-item-icon" className="df-sidebar-item-icon">
        {icon}
        {badge != null ? (
          <Badge
            variant={badgeVariant}
            size="xs"
            radius="full"
            className="df-sidebar-item-badge"
          >
            {badge}
          </Badge>
        ) : null}
      </span>
    )
  }

  const trailingNode = collapsed
    ? undefined
    : trailing != null || shortcut != null
      ? (
          <>
            {trailing}
            {shortcut != null ? (
              <SidebarShortcut>{shortcut}</SidebarShortcut>
            ) : null}
          </>
        )
      : undefined

  const item = (
    <ListItem
      variant="muted"
      size="sm"
      selected={active}
      disabled={disabled}
      leading={leading === false ? undefined : leading}
      trailing={trailingNode}
      asChild={asChild}
      selectedBackground="var(--df-sidebar-accent)"
      hoverBackground="var(--df-sidebar-accent)"
      radius="var(--df-sidebar-item-radius)"
      className={cn("df-sidebar-item", className)}
      style={style}
      aria-label={label || undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </ListItem>
  )

  if (!collapsed || !label) {
    return item
  }

  return (
    <Tooltip appearance="inverse">
      <TooltipTrigger render={item} />
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}

type SidebarSeparatorProps = React.ComponentProps<typeof Separator>

function SidebarSeparator({ className, ...props }: SidebarSeparatorProps) {
  return (
    <Separator
      data-df="sidebar-separator"
      className={cn("df-sidebar-separator", className)}
      {...props}
    />
  )
}

type SidebarCollapseTriggerProps = React.ComponentProps<typeof Button> & {
  icon?: React.ReactNode
}

function SidebarCollapseTrigger({
  className,
  icon,
  children,
  onClick,
  "aria-label": ariaLabel,
  title,
  ...props
}: SidebarCollapseTriggerProps) {
  const { collapsed, setCollapsed, label } = useSidebarContext(
    "SidebarCollapseTrigger"
  )
  const accessibleName = collapsed
    ? `Expand ${label}`
    : `Collapse ${label}`

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      data-df="sidebar-collapse-trigger"
      className={cn("df-sidebar-collapse-trigger", className)}
      aria-label={ariaLabel ?? accessibleName}
      title={title ?? accessibleName}
      aria-expanded={!collapsed}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setCollapsed(!collapsed)
      }}
      {...props}
    >
      {children ?? icon ?? <PanelLeft />}
    </Button>
  )
}

type SidebarWorkspaceProps = OptionListProps & {
  className?: string
}

function SidebarWorkspace({
  className,
  children,
  width = "hug",
  ...props
}: SidebarWorkspaceProps) {
  return (
    <div
      data-df="sidebar-workspace"
      className={cn("df-sidebar-workspace", className)}
    >
      <OptionList width={width} {...props}>
        {children}
      </OptionList>
    </div>
  )
}

type SidebarWorkspaceTriggerProps = {
  className?: string
  logo?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  chevron?: React.ReactNode
}

function SidebarWorkspaceTrigger({
  className,
  logo,
  title,
  description,
  chevron,
}: SidebarWorkspaceTriggerProps) {
  const { collapsed, tooltipSide } = useSidebarContext("SidebarWorkspaceTrigger")
  const label = textFromNode(title)

  const trigger = (
    <button
      type="button"
      data-df="sidebar-workspace-trigger"
      className={cn("df-sidebar-workspace-trigger", className)}
      aria-label={label || "Workspace"}
    >
      {logo != null ? (
        <span data-df="sidebar-workspace-logo" className="df-sidebar-workspace-logo">
          {logo}
        </span>
      ) : null}
      {!collapsed ? (
        <>
          <span data-df="sidebar-workspace-copy" className="df-sidebar-workspace-copy">
            <span data-df="sidebar-workspace-title" className="df-sidebar-workspace-title">
              {title}
            </span>
            {description != null ? (
              <span
                data-df="sidebar-workspace-description"
                className="df-sidebar-workspace-description"
              >
                {description}
              </span>
            ) : null}
          </span>
          <span
            data-df="sidebar-workspace-chevron"
            className="df-sidebar-workspace-chevron"
            aria-hidden
          >
            {chevron ?? <ChevronsUpDown />}
          </span>
        </>
      ) : null}
    </button>
  )

  if (collapsed && label) {
    return (
      <Tooltip appearance="inverse">
        <TooltipTrigger
          render={
            <span
              data-df="sidebar-tooltip-host"
              className="df-sidebar-tooltip-host"
            />
          }
        >
          <OptionListTrigger render={trigger} />
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return <OptionListTrigger render={trigger} />
}

type SidebarWorkspaceContentProps = OptionListContentProps

function SidebarWorkspaceContent({
  className,
  side,
  align = "start",
  sideOffset = 8,
  ...props
}: SidebarWorkspaceContentProps) {
  const { tooltipSide } = useSidebarContext("SidebarWorkspaceContent")

  return (
    <OptionListContent
      className={cn("df-sidebar-workspace-content", className)}
      side={side ?? tooltipSide}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

type SidebarUserProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function SidebarUser({
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: SidebarUserProps) {
  return (
    <div data-df="sidebar-user" className={cn("df-sidebar-user", className)}>
      <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children}
      </Popover>
    </div>
  )
}

type SidebarUserTriggerProps = {
  className?: string
  name: React.ReactNode
  email?: React.ReactNode
  src?: string
  alt?: string
  avatar?: React.ReactNode
  chevron?: React.ReactNode
}

function SidebarUserTrigger({
  className,
  name,
  email,
  src,
  alt,
  avatar,
  chevron,
}: SidebarUserTriggerProps) {
  const { collapsed, tooltipSide } = useSidebarContext("SidebarUserTrigger")
  const label = textFromNode(name)

  const trigger = (
    <button
      type="button"
      data-df="sidebar-user-trigger"
      className={cn("df-sidebar-user-trigger", className)}
      aria-label={label || "Account"}
    >
      {avatar ?? (
        <Avatar
          name={typeof name === "string" ? name : label}
          src={src}
          alt={alt}
          size="sm"
        />
      )}
      {!collapsed ? (
        <>
          <span data-df="sidebar-user-copy" className="df-sidebar-user-copy">
            <span data-df="sidebar-user-name" className="df-sidebar-user-name">
              {name}
            </span>
            {email != null ? (
              <span data-df="sidebar-user-email" className="df-sidebar-user-email">
                {email}
              </span>
            ) : null}
          </span>
          <span
            data-df="sidebar-user-chevron"
            className="df-sidebar-user-chevron"
            aria-hidden
          >
            {chevron ?? <ChevronsUpDown />}
          </span>
        </>
      ) : null}
    </button>
  )

  if (collapsed && label) {
    return (
      <Tooltip appearance="inverse">
        <TooltipTrigger
          render={
            <span
              data-df="sidebar-tooltip-host"
              className="df-sidebar-tooltip-host"
            />
          }
        >
          <PopoverTrigger render={trigger} />
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return <PopoverTrigger render={trigger} />
}

type SidebarUserContentProps = React.ComponentProps<typeof PopoverContent>

function SidebarUserContent({
  className,
  side,
  align = "end",
  sideOffset = 8,
  ...props
}: SidebarUserContentProps) {
  const { tooltipSide } = useSidebarContext("SidebarUserContent")

  return (
    <PopoverContent
      className={cn("df-sidebar-user-content", className)}
      side={side ?? tooltipSide}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarCollapseTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSearch,
  SidebarSeparator,
  SidebarShortcut,
  SidebarUser,
  SidebarUserContent,
  SidebarUserTrigger,
  SidebarWorkspace,
  SidebarWorkspaceContent,
  SidebarWorkspaceTrigger,
  useSidebarContext,
}

export type {
  SidebarCollapseTriggerProps,
  SidebarContentProps,
  SidebarFooterProps,
  SidebarGroupProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarNavProps,
  SidebarProps,
  SidebarRadius,
  SidebarSearchProps,
  SidebarSeparatorProps,
  SidebarShortcutProps,
  SidebarSide,
  SidebarUserContentProps,
  SidebarUserProps,
  SidebarUserTriggerProps,
  SidebarWorkspaceContentProps,
  SidebarWorkspaceProps,
  SidebarWorkspaceTriggerProps,
}
