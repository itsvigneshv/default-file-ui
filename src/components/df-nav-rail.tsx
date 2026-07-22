"use client"

import * as React from "react"

import { cn } from "../lib/utils"

type NavRailSide = "left" | "right"

type NavRailProps = React.ComponentProps<"nav"> & {
  /** Edge the rail sits on. Controls which side draws the inner border. */
  side?: NavRailSide
}

function NavRail({
  className,
  side = "left",
  children,
  ...props
}: NavRailProps) {
  return (
    <nav
      data-df="nav-rail"
      data-side={side}
      className={cn("df-nav-rail", className)}
      {...props}
    >
      {children}
    </nav>
  )
}

type NavRailItemProps = Omit<React.ComponentProps<"button">, "children"> & {
  active?: boolean
  icon: React.ReactNode
  /** Short label shown under the icon. */
  children: React.ReactNode
  /**
   * Merge props onto a single child element (for example a Next.js Link).
   * The child becomes the interactive root; icon and label render inside it.
   */
  asChild?: boolean
}

function NavRailItem({
  className,
  active = false,
  icon,
  children,
  asChild = false,
  type = "button",
  ...props
}: NavRailItemProps) {
  const content = (
    <>
      <span data-df="nav-rail-item-icon" className="df-nav-rail-item-icon">
        {icon}
      </span>
      <span data-df="nav-rail-item-label" className="df-nav-rail-item-label">
        {children}
      </span>
    </>
  )

  const sharedProps = {
    "data-df": "nav-rail-item",
    "data-active": active ? "" : undefined,
    "aria-current": active ? ("page" as const) : undefined,
    className: cn("df-nav-rail-item", className),
  }

  if (asChild) {
    const child = React.Children.only(children)
    if (!React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      throw new Error("NavRailItem asChild requires a single React element child.")
    }

    const label = child.props.children
    return React.cloneElement(child, {
      ...props,
      ...sharedProps,
      className: cn(sharedProps.className, child.props.className),
      children: (
        <>
          <span data-df="nav-rail-item-icon" className="df-nav-rail-item-icon">
            {icon}
          </span>
          <span data-df="nav-rail-item-label" className="df-nav-rail-item-label">
            {label}
          </span>
        </>
      ),
    } as never)
  }

  return (
    <button type={type} {...sharedProps} {...props}>
      {content}
    </button>
  )
}

type NavRailSeparatorProps = React.ComponentProps<"div">

function NavRailSeparator({ className, ...props }: NavRailSeparatorProps) {
  return (
    <div
      role="none"
      data-df="nav-rail-separator"
      className={cn("df-nav-rail-separator", className)}
      {...props}
    />
  )
}

export { NavRail, NavRailItem, NavRailSeparator }
export type {
  NavRailProps,
  NavRailItemProps,
  NavRailSeparatorProps,
  NavRailSide,
}
