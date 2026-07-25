"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "../lib/utils"

type ListItemSize = "sm" | "md" | "lg"
type ListItemVariant = "accent" | "muted"
type ListItemLayout = "inline" | "stacked"
type ListItemLeading = "checkbox" | "check" | React.ReactNode | false

type ListItemHostProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement | null>
}

type ListItemProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
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
  /** Merge row props onto a single child element (for example a link). */
  asChild?: boolean
  children?: React.ReactNode
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
    leadingNode = selected ? (
      <Check className="size-4 shrink-0" aria-hidden />
    ) : (
      <span className="size-4 shrink-0" aria-hidden />
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
        <span data-df="list-item-label">{label}</span>
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
      ...props
    },
    ref
  ) {
    const copyLayout = secondary != null ? layout : "inline"
    const showCheckbox = leading === "checkbox"
    const dataState = open ? "open" : selected ? "selected" : "idle"
    const dataHighlighted =
      highlighted ||
      (props as { "data-highlighted"?: string })["data-highlighted"] != null

    const sharedProps = {
      ...props,
      ref: ref as React.Ref<HTMLElement>,
      "data-df": "list-item" as const,
      "data-size": size,
      "data-variant": variant,
      "data-state": dataState,
      "data-layout": copyLayout,
      "data-disabled": disabled ? ("" as const) : undefined,
      "data-leading": showCheckbox
        ? ("checkbox" as const)
        : leading
          ? ("custom" as const)
          : undefined,
      "data-trailing": trailing != null ? ("" as const) : undefined,
      "data-highlighted": dataHighlighted ? ("" as const) : undefined,
      "aria-disabled": disabled || undefined,
      className: cn(className),
    }

    if (asChild) {
      const child = React.Children.only(children)
      if (!React.isValidElement<ListItemHostProps>(child)) {
        throw new Error("ListItem asChild requires a single React element child.")
      }

      return React.cloneElement(child, {
        ...sharedProps,
        className: cn(sharedProps.className, child.props.className),
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
      <div {...(sharedProps as React.HTMLAttributes<HTMLDivElement>)}>
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

export { ListItem }
export type {
  ListItemLayout,
  ListItemLeading,
  ListItemProps,
  ListItemSize,
  ListItemVariant,
}
