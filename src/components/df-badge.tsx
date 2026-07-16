import * as React from "react"

import { cn } from "../lib/utils"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl"

/** Corner radius. Defaults to `4xl` (soft pill). */
type BadgeRadius =
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

type BadgeProps = React.HTMLAttributes<HTMLElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  /** Corner radius. Defaults to `4xl`. */
  radius?: BadgeRadius
  /**
   * Trailing count chip. Accepts any numeric value (1 to 4+ digits).
   * Renders on md, lg, and xl hosts. Prefer this over nesting a second Badge.
   */
  count?: number | string
  asChild?: boolean
  render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
}

/** Counter chip uses the opposite of the host primary fill for contrast. */
function resolveCounterVariant(variant: BadgeVariant): BadgeVariant {
  return variant === "default" ? "secondary" : "default"
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(function Badge(
  {
    className,
    variant = "default",
    size = "md",
    radius = "4xl",
    count,
    render,
    children,
    ...props
  },
  ref
) {
  const classes = cn(className)
  const hasCount = count != null && count !== ""
  const content =
    children != null || hasCount ? (
      <>
        {children}
        {hasCount ? (
          <span
            data-df="badge"
            data-slot="counter"
            data-variant={resolveCounterVariant(variant)}
            data-size="xs"
            data-radius="full"
          >
            {count}
          </span>
        ) : null}
      </>
    ) : undefined

  if (render) {
    return React.cloneElement(render, {
      ...props,
      ref,
      "data-df": "badge",
      "data-variant": variant,
      "data-size": size,
      "data-radius": radius,
      className: cn(classes, render.props.className),
      children: content ?? render.props.children,
    } as never)
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      data-df="badge"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      className={classes}
      {...props}
    >
      {content}
    </span>
  )
})

export { Badge }
export type { BadgeProps, BadgeRadius, BadgeSize, BadgeVariant }
