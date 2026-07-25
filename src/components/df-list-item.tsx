"use client"

import * as React from "react"
import { Check } from "lucide-react"

import {
  dfPaddingChromeStyle,
  resolvePaddingSides,
  type PaddingChromeProps,
} from "../lib/padding-chrome"
import { cn } from "../lib/utils"

type ListItemSize = "sm" | "md" | "lg"
type ListItemVariant = "accent" | "muted"
type ListItemLabelVariant = "menu" | "nav"
type ListItemLayout = "inline" | "stacked"
type ListItemLeading = "checkbox" | "check" | React.ReactNode | false

type ListItemChromeProps = PaddingChromeProps & {
  gap?: string
  fontSize?: string
  background?: string
  foreground?: string
  hoverBackground?: string
  selectedBackground?: string
  radius?: string
}

type ListItemHostProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement | null>
  style?: React.CSSProperties
}

type ListItemProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> &
  ListItemChromeProps & {
    size?: ListItemSize
    variant?: ListItemVariant
    selected?: boolean
    highlighted?: boolean
    disabled?: boolean
    open?: boolean
    leading?: ListItemLeading
    secondary?: React.ReactNode
    layout?: ListItemLayout
    trailing?: React.ReactNode
    indicator?: boolean
    /**
     * When true, do not render a wrapper. Pass one child element (usually a link).
     * That element becomes the row and keeps its own href or routing.
     */
    asChild?: boolean
    children?: React.ReactNode
    "data-highlighted"?: string
  }

function resolveLeadingAttr(
  leading: ListItemLeading | undefined
): "checkbox" | "check" | "custom" | undefined {
  if (leading === "checkbox") return "checkbox"
  if (leading === "check") return "check"
  if (leading != null && leading !== false) return "custom"
  return undefined
}

function listItemChromeStyle({
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  gap,
  fontSize,
  background,
  foreground,
  hoverBackground,
  selectedBackground,
  radius,
}: ListItemChromeProps): React.CSSProperties {
  return {
    ...dfPaddingChromeStyle(
      "--df-list-item-padding",
      resolvePaddingSides({
        padding,
        paddingX,
        paddingY,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
      })
    ),
    ...(gap != null ? { "--df-list-item-gap": gap } : null),
    ...(fontSize != null ? { "--df-list-item-font-size": fontSize } : null),
    ...(background != null ? { "--df-list-item-bg": background } : null),
    ...(foreground != null ? { "--df-list-item-fg": foreground } : null),
    ...(hoverBackground != null
      ? { "--df-list-item-hover-bg": hoverBackground }
      : null),
    ...(selectedBackground != null
      ? {
          "--df-list-item-selected-bg": selectedBackground,
          "--df-list-item-selected-hover-bg": selectedBackground,
        }
      : null),
    ...(radius != null ? { "--df-list-item-radius": radius } : null),
  } as React.CSSProperties
}

function ListItemSlots({
  label,
  leading,
  secondary,
  layout,
  trailing,
  indicator,
  selected,
}: {
  label: React.ReactNode
  leading?: ListItemLeading
  secondary?: React.ReactNode
  layout: ListItemLayout
  trailing?: React.ReactNode
  indicator?: boolean
  selected: boolean
}) {
  let leadingNode: React.ReactNode = null
  if (leading === "checkbox") {
    leadingNode = (
      <span
        data-df="list-item-checkbox"
        data-state={selected ? "checked" : "unchecked"}
        aria-hidden
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    )
  } else if (leading === "check") {
    leadingNode = (
      <span data-df="list-item-leading" aria-hidden>
        {selected ? (
          <Check className="size-4 shrink-0" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
      </span>
    )
  } else if (leading != null && leading !== false) {
    leadingNode = (
      <span data-df="list-item-leading" aria-hidden>
        {leading}
      </span>
    )
  }

  return (
    <>
      {leadingNode}
      <span data-df="list-item-copy" data-layout={layout}>
        <span data-df="list-item-title">{label}</span>
        {secondary != null ? (
          <span data-df="list-item-secondary">{secondary}</span>
        ) : null}
      </span>
      {trailing != null ? (
        <span data-df="list-item-trailing">{trailing}</span>
      ) : null}
      {indicator && selected ? (
        <span data-df="list-item-indicator">
          <Check className="pointer-events-none size-4" />
        </span>
      ) : null}
    </>
  )
}

const ListItem = React.forwardRef<HTMLElement, ListItemProps>(
  function ListItem(
    {
      className,
      style,
      children,
      size = "md",
      variant = "accent",
      selected = false,
      highlighted = false,
      disabled = false,
      open = false,
      leading,
      secondary,
      layout = "inline",
      trailing,
      indicator = false,
      asChild = false,
      onClick,
      onKeyDown,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      gap,
      fontSize,
      background,
      foreground,
      hoverBackground,
      selectedBackground,
      radius,
      "data-highlighted": dataHighlightedProp,
      ...props
    },
    ref
  ) {
    const copyLayout = secondary != null ? layout : "inline"
    const dataState = open ? "open" : selected ? "selected" : "idle"
    const dataHighlighted =
      highlighted || dataHighlightedProp != null

    const chromeStyle = listItemChromeStyle({
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      gap,
      fontSize,
      background,
      foreground,
      hoverBackground,
      selectedBackground,
      radius,
    })
    const sharedClassName = cn(className)
    const sharedData = {
      "data-df": "list-item" as const,
      "data-size": size,
      "data-variant": variant,
      "data-state": dataState,
      "data-layout": copyLayout,
      "data-disabled": disabled ? ("" as const) : undefined,
      "data-leading": resolveLeadingAttr(leading),
      "data-trailing": trailing != null ? ("" as const) : undefined,
      "data-highlighted": dataHighlighted ? ("" as const) : undefined,
      "aria-disabled": disabled || undefined,
    }

    if (asChild) {
      const child = React.Children.only(children)
      if (!React.isValidElement<ListItemHostProps>(child)) {
        throw new Error("ListItem asChild requires a single React element child.")
      }

      return React.cloneElement(child, {
        ...props,
        ...sharedData,
        ref: ref as React.Ref<HTMLElement>,
        className: cn(sharedClassName, child.props.className),
        style: { ...chromeStyle, ...child.props.style, ...style },
        tabIndex: disabled ? -1 : child.props.tabIndex,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          child.props.onClick?.(event)
          onClick?.(event)
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          child.props.onKeyDown?.(event)
          onKeyDown?.(event)
        },
        children: (
          <ListItemSlots
            label={child.props.children}
            leading={leading}
            secondary={secondary}
            layout={copyLayout}
            trailing={trailing}
            indicator={indicator}
            selected={selected}
          />
        ),
      } as ListItemHostProps)
    }

    return (
      <div
        {...props}
        {...sharedData}
        ref={ref as React.Ref<HTMLDivElement>}
        className={sharedClassName}
        style={{ ...chromeStyle, ...style }}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <ListItemSlots
          label={children}
          leading={leading}
          secondary={secondary}
          layout={copyLayout}
          trailing={trailing}
          indicator={indicator}
          selected={selected}
        />
      </div>
    )
  }
)

type ListItemLabelProps = React.ComponentProps<"div"> & {
  /** menu matches picker group headings. nav matches catalogue section headings. */
  variant?: ListItemLabelVariant
}

function ListItemLabel({
  className,
  variant = "menu",
  ...props
}: ListItemLabelProps) {
  return (
    <div
      data-df="list-item-section"
      data-variant={variant}
      className={cn(className)}
      {...props}
    />
  )
}

type ListItemNestChromeProps = {
  /** Outer inset before the nest group. Sets --df-list-item-nest-indent. */
  indent?: string
  /** Inner pad after the guide line. Sets --df-list-item-nest-pad. */
  pad?: string
  /** Gap between nested rows. Sets --df-list-item-nest-gap. */
  gap?: string
  /** Guide line thickness. Sets --df-list-item-nest-line-width. */
  lineWidth?: string
  /** Guide line color. Prefer var(--border). Sets --df-list-item-nest-line-color. */
  lineColor?: string
}

type ListItemNestProps = React.ComponentProps<"div"> &
  ListItemNestChromeProps & {
    /** When true, paints the nest guide line. */
    line?: boolean
  }

function listItemNestChromeStyle({
  indent,
  pad,
  gap,
  lineWidth,
  lineColor,
}: ListItemNestChromeProps): React.CSSProperties {
  return {
    ...(indent != null ? { "--df-list-item-nest-indent": indent } : null),
    ...(pad != null ? { "--df-list-item-nest-pad": pad } : null),
    ...(gap != null ? { "--df-list-item-nest-gap": gap } : null),
    ...(lineWidth != null
      ? { "--df-list-item-nest-line-width": lineWidth }
      : null),
    ...(lineColor != null
      ? { "--df-list-item-nest-line-color": lineColor }
      : null),
  } as React.CSSProperties
}

function ListItemNest({
  className,
  style,
  line = true,
  indent,
  pad,
  gap,
  lineWidth,
  lineColor,
  ...props
}: ListItemNestProps) {
  return (
    <div
      data-df="list-item-nest"
      data-line={line ? "true" : "false"}
      className={cn(className)}
      style={{
        ...listItemNestChromeStyle({
          indent,
          pad,
          gap,
          lineWidth,
          lineColor,
        }),
        ...style,
      }}
      {...props}
    />
  )
}

export { ListItem, ListItemLabel, ListItemNest }
export type {
  ListItemChromeProps,
  ListItemLabelProps,
  ListItemLabelVariant,
  ListItemLayout,
  ListItemLeading,
  ListItemNestChromeProps,
  ListItemNestProps,
  ListItemProps,
  ListItemSize,
  ListItemVariant,
}
