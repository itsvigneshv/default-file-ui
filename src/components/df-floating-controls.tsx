"use client"

import * as React from "react"

import { Separator } from "./df-separator"
import { cn } from "../lib/utils"

type FloatingControlsVariant = "surface" | "overlay"

type FloatingControlsItemEntry = {
  type?: "item"
  key?: string
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
  variant?: FloatingControlsVariant
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
  leading?: React.ReactNode
  trailing?: React.ReactNode
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
