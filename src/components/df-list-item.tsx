"use client"

import * as React from "react"
import { Check } from "lucide-react"

import {
  dfPaddingChromeStyle,
  resolvePaddingSides,
  type PaddingChromeProps,
} from "../lib/padding-chrome"
import { cn, composeRefs } from "../lib/utils"

type ListItemSize = "xs" | "sm" | "md" | "lg"
type ListItemVariant = "accent" | "muted"
type ListItemLabelVariant = "menu" | "nav"
type ListItemLayout = "inline" | "stacked"
type ListItemLeading = "checkbox" | "check" | React.ReactNode | false
type ListItemAs = "div" | "button"

type ListItemChromeProps = PaddingChromeProps & {
  gap?: string
  fontSize?: string
  background?: string
  foreground?: string
  hoverBackground?: string
  hoverForeground?: string
  selectedBackground?: string
  selectedForeground?: string
  selectedHoverBackground?: string
  activeBackground?: string
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
    /** Native host when not using asChild. Ignored when asChild is true. */
    as?: ListItemAs
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
  hoverForeground,
  selectedBackground,
  selectedForeground,
  selectedHoverBackground,
  activeBackground,
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
    ...(hoverForeground != null
      ? { "--df-list-item-hover-fg": hoverForeground }
      : null),
    ...(selectedBackground != null
      ? {
          "--df-list-item-selected-bg": selectedBackground,
          "--df-list-item-selected-hover-bg":
            selectedHoverBackground ?? selectedBackground,
        }
      : null),
    ...(selectedForeground != null
      ? { "--df-list-item-selected-fg": selectedForeground }
      : null),
    ...(selectedHoverBackground != null
      ? { "--df-list-item-selected-hover-bg": selectedHoverBackground }
      : null),
    ...(activeBackground != null
      ? { "--df-list-item-active-bg": activeBackground }
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
      as: asProp = "div",
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
      hoverForeground,
      selectedBackground,
      selectedForeground,
      selectedHoverBackground,
      activeBackground,
      radius,
      "data-highlighted": dataHighlightedProp,
      ...props
    },
    ref
  ) {
    const copyLayout = secondary != null ? layout : "inline"
    const dataState = selected ? "selected" : "idle"
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
      hoverForeground,
      selectedBackground,
      selectedForeground,
      selectedHoverBackground,
      activeBackground,
      radius,
    })
    const sharedClassName = cn(className)
    const sharedData = {
      "data-df": "list-item" as const,
      "data-size": size,
      "data-variant": variant,
      "data-state": dataState,
      "data-open": open ? ("" as const) : undefined,
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

      const childPropsRef = child.props.ref
      const childOwnRef = (child as { ref?: React.Ref<HTMLElement | null> }).ref

      return React.cloneElement(child, {
        ...props,
        ...sharedData,
        ref: composeRefs(ref, childPropsRef, childOwnRef),
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

    const slots = (
      <ListItemSlots
        label={children}
        leading={leading}
        secondary={secondary}
        layout={copyLayout}
        trailing={trailing}
        indicator={indicator}
        selected={selected}
      />
    )

    if (asProp === "button") {
      const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
      return (
        <button
          {...buttonProps}
          {...sharedData}
          ref={ref as React.Ref<HTMLButtonElement>}
          type={buttonProps.type ?? "button"}
          className={sharedClassName}
          style={{ ...chromeStyle, ...style }}
          disabled={disabled || undefined}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          {slots}
        </button>
      )
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
        {slots}
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

export { ListItemNest, useListItemNestScope } from "./df-list-item-nest"
export type {
  ListItemNestChromeProps,
  ListItemNestProps,
} from "./df-list-item-nest"

export { ListItem, ListItemLabel }
export type {
  ListItemAs,
  ListItemChromeProps,
  ListItemLabelProps,
  ListItemLabelVariant,
  ListItemLayout,
  ListItemLeading,
  ListItemProps,
  ListItemSize,
  ListItemVariant,
}
