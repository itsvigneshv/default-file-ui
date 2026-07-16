import * as React from "react"

import { cn } from "../lib/utils"

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link"
type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Slot before the label: an icon or any node (badge, counter, avatar, ...). */
  leading?: React.ReactNode
  /** Slot after the label: an icon or any node (badge, counter, close, ...). */
  trailing?: React.ReactNode
}

const sizeClass: Record<ButtonSize, string> = {
  default: "df-btn-default-size",
  xs: "df-btn-xs",
  sm: "df-btn-sm",
  lg: "df-btn-lg",
  icon: "df-btn-icon",
  "icon-xs": "df-btn-icon-xs",
  "icon-sm": "df-btn-icon-sm",
  "icon-lg": "df-btn-icon-lg",
}

/** Class helper for non-button hosts (e.g. Next.js Link) that need button chrome. */
function dfButtonClass({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn("df-btn", `df-btn-${variant}`, sizeClass[size], className)
}

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  leading,
  trailing,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-df="button"
      data-variant={variant}
      data-size={size}
      className={dfButtonClass({ variant, size, className })}
      {...props}
    >
      {leading != null && (
        <span
          className="df-btn-slot"
          data-df="button-slot"
          data-slot="leading"
          data-icon="inline-start"
        >
          {leading}
        </span>
      )}
      {children}
      {trailing != null && (
        <span
          className="df-btn-slot"
          data-df="button-slot"
          data-slot="trailing"
          data-icon="inline-end"
        >
          {trailing}
        </span>
      )}
    </button>
  )
}

export { Button, dfButtonClass }
export type { ButtonProps, ButtonVariant, ButtonSize }
