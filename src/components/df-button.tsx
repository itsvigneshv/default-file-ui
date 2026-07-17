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
  | "xl"
  | "2xl"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"
  | "icon-xl"
  | "icon-2xl"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * Link variant only. When true (default), show underline on hover.
   * Set false to keep the label plain on hover.
   */
  underline?: boolean
  /** Content before the label. Accepts an icon or any node such as a badge or counter. */
  leading?: React.ReactNode
  /** Content after the label. Accepts an icon or any node such as a badge or counter. */
  trailing?: React.ReactNode
}

const sizeClass: Record<ButtonSize, string> = {
  default: "df-btn-default-size",
  xs: "df-btn-xs",
  sm: "df-btn-sm",
  lg: "df-btn-lg",
  xl: "df-btn-xl",
  "2xl": "df-btn-2xl",
  icon: "df-btn-icon",
  "icon-xs": "df-btn-icon-xs",
  "icon-sm": "df-btn-icon-sm",
  "icon-lg": "df-btn-icon-lg",
  "icon-xl": "df-btn-icon-xl",
  "icon-2xl": "df-btn-icon-2xl",
}

/** Builds button classes for non button hosts such as Next.js Link. */
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
  underline = true,
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
      data-underline={
        variant === "link" ? (underline ? "hover" : "none") : undefined
      }
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
