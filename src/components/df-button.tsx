import * as React from "react"

import { cn } from "../lib/utils"
import { Badge, type BadgeVariant } from "./df-badge"
import { Spinner, type SpinnerSize } from "./df-spinner"

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

type ButtonLoadingAppearance = "muted" | "solid"
type ButtonBadgePosition = "edge" | "inset"
type ButtonBadgeSide = "start" | "end"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  underline?: boolean
  leading?: React.ReactNode
  trailing?: React.ReactNode
  loading?: boolean
  loadingPlacement?: "leading" | "trailing"
  loadingAppearance?: ButtonLoadingAppearance
  badge?: number | string
  badgeVariant?: BadgeVariant
  badgePosition?: ButtonBadgePosition
  badgeSide?: ButtonBadgeSide
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

function isIconButtonSize(size: ButtonSize): boolean {
  return size.startsWith("icon")
}

function spinnerSizeForButton(size: ButtonSize): SpinnerSize {
  if (size === "xs" || size === "sm" || size === "icon-xs" || size === "icon-sm") {
    return "xs"
  }
  if (
    size === "lg" ||
    size === "xl" ||
    size === "2xl" ||
    size === "icon-lg" ||
    size === "icon-xl" ||
    size === "icon-2xl"
  ) {
    return "md"
  }
  return "sm"
}

function shouldShowBadge(badge: number | string | undefined): boolean {
  if (badge == null || badge === "") return false
  if (typeof badge === "number" && badge <= 0) return false
  return true
}

function resolveButtonBadgeVariant(
  buttonVariant: ButtonVariant,
  badgeVariant?: BadgeVariant
): BadgeVariant {
  if (badgeVariant) return badgeVariant
  if (buttonVariant === "default") return "secondary"
  return "default"
}

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
  loading = false,
  loadingPlacement = "leading",
  loadingAppearance = "muted",
  badge,
  badgeVariant,
  badgePosition = "edge",
  badgeSide = "end",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const supportsLoading = variant !== "link"
  const isLoading = Boolean(loading) && supportsLoading
  const spinner = isLoading ? (
    <Spinner size={spinnerSizeForButton(size)} aria-hidden />
  ) : null

  const iconOnly = isIconButtonSize(size)
  let resolvedLeading = leading
  let resolvedTrailing = trailing
  let resolvedChildren = children

  if (isLoading && spinner) {
    if (iconOnly) {
      resolvedLeading = undefined
      resolvedTrailing = undefined
      resolvedChildren = spinner
    } else if (loadingPlacement === "trailing") {
      resolvedTrailing = spinner
    } else {
      resolvedLeading = spinner
    }
  }

  const fadeLabel =
    isLoading && loadingAppearance === "solid" && !iconOnly && resolvedChildren != null
  if (fadeLabel) {
    resolvedChildren = (
      <span data-df="button-slot" data-slot="label">
        {resolvedChildren}
      </span>
    )
  }

  const showBadge = shouldShowBadge(badge)

  return (
    <button
      type={type}
      data-df="button"
      data-variant={variant}
      data-size={size}
      data-underline={
        variant === "link" ? (underline ? "hover" : "none") : undefined
      }
      data-loading={isLoading ? "" : undefined}
      data-loading-appearance={isLoading ? loadingAppearance : undefined}
      data-badge={showBadge ? "" : undefined}
      data-badge-position={showBadge ? badgePosition : undefined}
      data-badge-side={showBadge ? badgeSide : undefined}
      className={dfButtonClass({ variant, size, className })}
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {resolvedLeading != null && (
        <span
          className="df-btn-slot"
          data-df="button-slot"
          data-slot="leading"
          data-icon="inline-start"
        >
          {resolvedLeading}
        </span>
      )}
      {resolvedChildren}
      {resolvedTrailing != null && (
        <span
          className="df-btn-slot"
          data-df="button-slot"
          data-slot="trailing"
          data-icon="inline-end"
        >
          {resolvedTrailing}
        </span>
      )}
      {showBadge ? (
        <Badge
          data-slot="badge"
          variant={resolveButtonBadgeVariant(variant, badgeVariant)}
          size="xs"
          radius="full"
          aria-hidden
        >
          {badge}
        </Badge>
      ) : null}
    </button>
  )
}

export { Button, dfButtonClass }
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonLoadingAppearance,
  ButtonBadgePosition,
  ButtonBadgeSide,
}
