"use client"

import * as React from "react"

import { Separator } from "./df-separator"
import { cn } from "../lib/utils"

type FloatingControlsVariant = "surface" | "overlay"

type FloatingControlsItemEntry = {
  type?: "item"
  key?: string
  /** Button label. Prefer this for text actions; falls back to `children`. */
  label?: React.ReactNode
  children?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  tone?: "ghost" | "solid"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

type FloatingControlsDividerEntry = {
  type: "divider"
  key?: string
  /** Swap in a custom divider node. Defaults to the kit vertical rule. */
  children?: React.ReactNode
  className?: string
}

type FloatingControlsSlotEntry = {
  type: "slot"
  key?: string
  children: React.ReactNode
  className?: string
}

type FloatingControlsEntry =
  | FloatingControlsItemEntry
  | FloatingControlsDividerEntry
  | FloatingControlsSlotEntry

type FloatingControlsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `surface` light bar, or `overlay` glass bar over dark canvases. */
  variant?: FloatingControlsVariant
  /**
   * Declarative slot list. Place `{ type: "divider" }` anywhere;
   * use `{ type: "slot", children }` for custom nodes (menus, switchers).
   * Ignored when `children` are provided.
   */
  items?: FloatingControlsEntry[]
}

function FloatingControls({
  className,
  variant = "surface",
  items,
  children,
  ...props
}: FloatingControlsProps) {
  const content =
    children ??
    (items?.map((entry, index) => {
      const key =
        ("key" in entry && entry.key) ||
        `${entry.type ?? "item"}-${index}`

      if (entry.type === "divider") {
        return (
          <FloatingControlsDivider
            key={key}
            className={entry.className}
          >
            {entry.children}
          </FloatingControlsDivider>
        )
      }

      if (entry.type === "slot") {
        return (
          <FloatingControlsSlot key={key} className={entry.className}>
            {entry.children}
          </FloatingControlsSlot>
        )
      }

      const {
        label,
        children: itemChildren,
        leading,
        trailing,
        tone,
        onClick,
        disabled,
        className: itemClassName,
        "aria-label": ariaLabel,
      } = entry

      return (
        <FloatingControlsItem
          key={key}
          leading={leading}
          trailing={trailing}
          tone={tone}
          onClick={onClick}
          disabled={disabled}
          className={itemClassName}
          aria-label={ariaLabel}
        >
          {label ?? itemChildren}
        </FloatingControlsItem>
      )
    }))

  return (
    <div
      role="toolbar"
      data-df="floating-controls"
      data-variant={variant}
      className={cn("df-floating-controls", className)}
      {...props}
    >
      {content}
    </div>
  )
}

type FloatingControlsItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Slot before the label (icon, badge, …). */
  leading?: React.ReactNode
  /** Slot after the label. */
  trailing?: React.ReactNode
  /** `ghost` (default) or `solid` filled contrast chip. */
  tone?: "ghost" | "solid"
}

function FloatingControlsItem({
  className,
  leading,
  trailing,
  tone = "ghost",
  type = "button",
  children,
  ...props
}: FloatingControlsItemProps) {
  return (
    <button
      type={type}
      data-df="floating-controls-item"
      data-tone={tone}
      className={cn("df-floating-controls-item", className)}
      {...props}
    >
      {leading != null && (
        <span
          className="df-floating-controls-item-slot"
          data-df="floating-controls-item-slot"
          data-slot="leading"
          data-icon="inline-start"
        >
          {leading}
        </span>
      )}
      {children}
      {trailing != null && (
        <span
          className="df-floating-controls-item-slot"
          data-df="floating-controls-item-slot"
          data-slot="trailing"
          data-icon="inline-end"
        >
          {trailing}
        </span>
      )}
    </button>
  )
}

type FloatingControlsDividerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional custom divider. When omitted, renders the default vertical rule.
   * Pass any node to swap the separator for another component.
   */
  children?: React.ReactNode
}

function FloatingControlsDivider({
  className,
  children,
  ...props
}: FloatingControlsDividerProps) {
  if (children != null) {
    return (
      <div
        data-df="floating-controls-divider"
        data-custom=""
        className={cn("df-floating-controls-divider", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <Separator
      orientation="vertical"
      data-df="floating-controls-divider"
      className={cn("df-floating-controls-divider", className)}
      {...props}
    />
  )
}

type FloatingControlsSlotProps = React.HTMLAttributes<HTMLDivElement>

/** Host for arbitrary controls (export menus, switchers, custom actions). */
function FloatingControlsSlot({
  className,
  children,
  ...props
}: FloatingControlsSlotProps) {
  return (
    <div
      data-df="floating-controls-slot"
      className={cn("df-floating-controls-slot", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  FloatingControls,
  FloatingControlsItem,
  FloatingControlsDivider,
  FloatingControlsSlot,
}
export type {
  FloatingControlsProps,
  FloatingControlsItemProps,
  FloatingControlsDividerProps,
  FloatingControlsSlotProps,
  FloatingControlsVariant,
  FloatingControlsEntry,
  FloatingControlsItemEntry,
  FloatingControlsDividerEntry,
  FloatingControlsSlotEntry,
}
